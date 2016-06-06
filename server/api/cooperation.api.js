import cobody from 'co-body';
import coopDao from '../models/cooperation.db';
import tenantDao from '../models/tenant.db';
import mysql from '../util/mysql';
import Result from '../util/responseResult';
import { getSmsCode } from '../../common/validater';
import { TENANT_LEVEL, INVITATION_STATUS, PARTNERSHIP_TYPE_INFO, PARTNER_TENANT_TYPE, PARTNERSHIP }
  from 'common/constants';

const partnershipTypeNames = Object.keys(PARTNERSHIP_TYPE_INFO).map(pstkey => PARTNERSHIP_TYPE_INFO[pstkey]);

function getTenantTypeDesc(level) {
  return level === TENANT_LEVEL.ENTERPRISE ? PARTNER_TENANT_TYPE[0] : PARTNER_TENANT_TYPE[1];
}

function separatePartnerCode(codeStr) {
  const codes = codeStr.split('/');
  return codes.length === 2 ? codes[1] : codes[0];
}
function getPartnerCode(code, subCode) {
  return subCode ? `${code}/${subCode}` : code;
}
function *partnersG() {
  const current = parseInt(this.request.query.currentPage, 10);
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const tenantId = parseInt(this.request.query.tenantId, 10);
  const filters = this.request.query.filters ? JSON.parse(this.request.query.filters) : [];
  try {
    const totals = yield coopDao.getPartnersTotalCount(tenantId, filters);
    const partners = yield coopDao.getPagedPartners(tenantId, current, pageSize, filters);
    const partnerships = yield coopDao.getTenantPartnerships(tenantId, filters);
    const partnershipTypes = partnershipTypeNames.map((name, index) => ({
      key: `${index}`, // used as RadionButton key
      code: name,
      count: partnerships.filter(pts => pts.name === name).length
    }));
    for (let i = 0; i < partners.length; ++i) {
      const partner = partners[i];
      partner.types = partnerships.filter(ps => ps.partnerCode === partner.partnerCode).map(
        pt => ({
          key: pt.type,
          code: pt.name
        })
      );
    }
    const partnerTenants = yield tenantDao.getAllTenantsExcept(tenantId);
    const recevieablePartnerTenants = yield coopDao.getReceiveablePartnerTenants(tenantId);
    partnerTenants.forEach(pt => {
      pt.code = pt.subCode || pt.code;
      pt.subCode = undefined;
    });
    return Result.ok(this, {
      partnerlist: {
        totalCount: totals.length > 0 ? totals[0].count : 0,
        pageSize,
        current,
        data: partners.map(pt => {
          pt.partnerCode = separatePartnerCode(pt.partnerCode);
          return pt;
        })
      },
      partnershipTypes,
      partnerTenants,
      recevieablePartnerTenants
    });
  } catch (e) {
    console.log(e);
    return Result.internalServerError(this, e.message);
  }
}

function *cancelInvite() {
  const { id } = yield cobody(this);
  let trans;
  try {
    const invitations = yield coopDao.getInvitationInfo(id);
    if (invitations.length !== 1) {
      throw new Error('invitation not found');
    }
    const status = INVITATION_STATUS.CANCELED;
    trans = yield mysql.beginTransaction();
    yield coopDao.updateInvitationStatus(status, null, id, trans);
    yield mysql.commit(trans);
    return Result.ok(this);
  } catch (e) {
    yield mysql.rollback(trans);
    return Result.internalServerError(this, e.message);
  }
}

function *editProviderTypes() {
  const body = yield cobody(this);
  const { partnerKey, tenantId, partnerInfo, providerTypes } = body;
  const { partnerTenantId, partnerName, partnerCode } = partnerInfo;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    // 更改关系时,先删除原有的关系,再插入新的关系
    yield coopDao.removePartnerships(tenantId, partnerName, partnerCode, trans);
    yield coopDao.insertPartnerships(partnerKey, tenantId, partnerTenantId, partnerName, partnerCode, providerTypes, trans);
    yield mysql.commit(trans);
    return Result.ok(this);
  } catch(e) {
    yield mysql.rollback(trans);
    return Result.internalServerError(this, e.message);
  }
}

function *addPartner() {
  const body = yield cobody(this);
  const { tenantId, partnerInfo: { partnerName, partnerCode }, partnerships } = body;
  let newPartner = {name: partnerName, partnerCode, types: partnerships.map(partnership => ({code: partnership}))}; // 返回给客户端的新增partner
  let addPartnerResult;
  let trans;
  try {
    // 根据partner的name和code查询是否存在这个租户,不存在就创建一个线下的partner,如果存在则根据线上用户的信息创建partner
    const [ partnerTenantInfo ] = yield tenantDao.getTenantInfoWithNameAndCode(partnerName, partnerCode);
    if (partnerTenantInfo) { // 存在
      const partnerTenantId = partnerTenantInfo.tenant_id;
      const tenantType = PARTNER_TENANT_TYPE[partnerTenantInfo.level];
      addPartnerResult = yield coopDao.insertPartner(tenantId, partnerTenantInfo.tenant_id, partnerCode, partnerName, tenantType, 0, trans);
      yield coopDao.insertPartnerships(addPartnerResult.insertId, tenantId, partnerTenantId, partnerName, partnerCode, partnerships, trans);
      newPartner = {...newPartner, partnerTenantId, tenantType };
    } else {
      addPartnerResult = yield coopDao.insertPartner(tenantId, -1, partnerCode, partnerName, PARTNER_TENANT_TYPE[3], 0, trans);
      yield coopDao.insertPartnerships(addPartnerResult.insertId, tenantId, -1, partnerName, partnerCode, partnerships, trans);
      newPartner = {...newPartner, partnerTenantId: -1, tenantType: PARTNER_TENANT_TYPE[3] };
    }
    // add `key` to newPartner
    newPartner.key = addPartnerResult.insertId;
    yield mysql.commit(trans);
    return Result.ok(this, { newPartner });
  } catch(e) {
    yield mysql.rollback(trans);
    return Result.internalServerError(this, e.message);
  }
}

function *getToInvites() {
  const tenantId = this.request.query.tenantId;
  try {
    const offlineInvites = yield coopDao.getOfflineInvitesWithTenantId(tenantId);
    // const onlineInvites = yield coopDao.getOnlineInvitesWithTenantId(tenantId);
    const rawInvites = [...offlineInvites];
    // TODO: 优化查询的方式, 下面这个方法用于合并partnerships
    const toInvites = rawInvites.map(invitee => ({...invitee, partnerships: [invitee.partnerships]})).reduce((total, invitee) => {
      const foundIndex = total.findIndex(item => invitee.code === item.code && invitee.name === item.name);
      if (foundIndex !== -1) {
        total[foundIndex].partnerships.push(invitee.partnerships[0]);
      } else {
        total.push(invitee);
      }
      return total;
    }, []);
    return Result.ok(this, { toInvites });
  } catch(e) {
    return Result.internalServerError(this, e.message);
  }
}

function *inviteOfflinePartner() {
  const body = yield cobody(this);
  const { tenantId, inviteeInfo, concactInfo } = body;
  let trans;
  try {
    yield coopDao.insertInvitation(null, tenantId, -1, inviteeInfo.code, inviteeInfo.name, 0, null, trans);
    // TODO: 发送短信或者邮件给线下用户
    return Result.ok(this);
  } catch(e) {
    yield mysql.rollback(trans);
    return Result.internalServerError(this, e.message);
  }
}

function *inviteOnlinePartner() {
  const body = yield cobody(this);
  const { tenantId, inviteeInfo } = body;
  let trans;
  try {
    console.log(body);
    yield coopDao.insertInvitation(null, tenantId, inviteeInfo.tenantId, inviteeInfo.code, inviteeInfo.name, 0, null, trans);
    return Result.ok(this);
  } catch(e) {
    yield mysql.rollback(trans);
    return Result.internalServerError(this, e.message);
  }
}

function *getSendInvitations() {
  const tenantId = this.request.query.tenantId;
  try {
    const sendInvitations = yield coopDao.getInvitationsByTenantId(tenantId, 0);
    return Result.ok(this, {sendInvitations});
  } catch(e) {
    return Result.internalServerError(this, e.message);
  }
}

function *getReceiveInvitations() {
  const tenantId = this.request.query.tenantId;
  try {
    const receiveInvitations = yield coopDao.getInvitationsByTenantId(tenantId, 1);
    console.log(receiveInvitations);
    return Result.ok(this, {receiveInvitations});
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *rejectInvitation() {
  const body = yield cobody(this);
  const { status, id } = body;
  let trans;
  try {
    yield coopDao.updateInvitationStatus(2, null, id, trans);
    return Result.ok(this);
  } catch (e) {
    yield mysql.rollback(trans);
    return Result.internalServerError(this, e.message);
  }
}

function *acceptInvitation() {
  const body = yield cobody(this);
  console.log('fuck');
  const { id } = body;
  let trans;
  try {
    // 接受时,需要同时更新invitation表中的status和partnerships中的establish
    const invitationInfo = yield coopDao.getInvitationInfo(id);
    yield coopDao.establishPartner(invitationInfo.inviterId, invitationInfo.inviteeId, trans);
    yield coopDao.updateInvitationStatus(1, null, id, trans);
    return Result.ok(this);
  } catch (e) {
    yield mysql.rollback(trans);
    return Result.internalServerError(this, e.message);
  }
}

export default [
  [ 'get', '/v1/cooperation/partners', partnersG ],
  [ 'get', '/v1/cooperation/invitation/send_invitations', getSendInvitations ],
  [ 'get', '/v1/cooperation/invitation/receive_invitations', getReceiveInvitations ],
  [ 'post', '/v1/cooperation/invitation/cancel_invite', cancelInvite ],
  [ 'post', '/v1/cooperation/partner/edit_provider_types', editProviderTypes ],
  [ 'post', '/v1/cooperation/partner/add', addPartner ],
  [ 'get', '/v1/cooperation/invitation/to_invites', getToInvites ],
  [ 'post', '/v1/cooperation/invitation/invite_offline_partner', inviteOfflinePartner ],
  [ 'post', '/v1/cooperation/invitation/invite_online_partner', inviteOnlinePartner ],
  [ 'post', '/v1/cooperation/invitation/reject_invitation', rejectInvitation ],
  [ 'post', '/v1/cooperation/invitation/accept_invitation', acceptInvitation ]
]
