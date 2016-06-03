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

function *partnerOnlineP() {
  const body = yield cobody(this);
  const partnerships = body.partnerships.map(pts => ({
    key: partnershipTypeNames.indexOf(pts),
    code: pts
  }));
  let trans;
  try {
    const partners = yield coopDao.getPartnerByPair(body.tenantId, body.partnerId);
    if (partners.length > 0) {
      return Result.paramError(this, { key: 'partnerExist' });
    }
    const partnerTenants = yield tenantDao.getTenantInfo(body.partnerId);
    if (partnerTenants.length !== 1) {
      throw new Error('no platform partner tenant found');
    }
    const partner = partnerTenants[0];
    const partnerCode = getPartnerCode(partner.code, partner.subCode);
    const tenantType = getTenantTypeDesc(partner.level);
    trans = yield mysql.beginTransaction();
    const result = yield coopDao.insertPartner(
      body.tenantId, body.partnerId, partnerCode,
      partner.name, tenantType, 0, trans
    );
    yield coopDao.deleteSinglePartnership(body.tenantId, body.partnerId, trans);
    yield [
      coopDao.insertPartnership(
        result.insertId, body.tenantId, body.partnerId, partnerCode,
        partner.name, partnerships, trans
      ),
      coopDao.insertInvitation(
        result.insertId, body.tenantId, body.partnerId, partnerCode,
        partner.name, INVITATION_STATUS.NEW_SENT, null, trans
      ),
    ];
    yield mysql.commit(trans);
    return Result.ok(this);
  } catch (e) {
    console.log(e && e.stack);
    yield mysql.rollback(trans);
    return Result.internalServerError(this, e.message);
  }
}

function *partnerOfflineP() {
  const body = yield cobody(this);
  const partnerships = body.partnerships.map(pts => ({
    key: partnershipTypeNames.indexOf(pts),
    code: pts
  }));
  const tenantType = PARTNER_TENANT_TYPE[2];
  let trans;
  try {
    const partners = yield coopDao.getPartnerByPair(body.tenantId, null, body.partnerCode);
    if (partners.length > 0) {
      return Result.paramError(this, { key: 'offlinePartnerExist' });
    }
    trans = yield mysql.beginTransaction();
    const result = yield coopDao.insertPartner(
      body.tenantId, -1, body.partnerCode, body.partnerName, tenantType, 0, trans
    );
    yield coopDao.deleteOfflinePartnership(body.tenantId, body.partnerCode, trans);
    yield coopDao.insertPartnership(
      result.insertId, body.tenantId, -1, body.partnerCode, body.partnerName, partnerships, trans
    );
    const code = getSmsCode(6);
    yield coopDao.insertInvitation(
      result.insertId, body.tenantId, -1, body.partnerCode, body.partnerName,
      INVITATION_STATUS.NEW_SENT, code, trans);
    yield mysql.commit(trans);
    // sendInvitation by body.contact -> phone or email todo
    return Result.ok(this, {
      key: result.insertId,
      name: body.partnerName,
      partnerCode: body.partnerCode,
      tenantType,
      types: partnerships,
      partnerTenantId: -1
    });
  } catch (e) {
    console.log(e && e.stack);
    return Result.internalServerError(this, e.message);
  }
}

function *receivedInvitationsG() {
  const current = parseInt(this.request.query.currentPage, 10);
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const tenantId = parseInt(this.request.query.tenantId, 10);
  try {
    const totals = yield coopDao.getReceivedInvitationCount(tenantId);
    const invitations = yield coopDao.getReceivedInvitations(
      tenantId, INVITATION_STATUS.CANCELED, current, pageSize);
    const partnerships = yield coopDao.getPartnershipByInvitee(tenantId);
    const receiveds = [];
    for (let i = 0; i < invitations.length; i++) {
      const inviters = yield tenantDao.getTenantInfo(invitations[i].inviterId);
      if (inviters.length !== 1) {
        console.log('receivedInvitationsG no inviter tenant');
        continue;
      }
      const receive = {
        key: invitations[i].id,
        createdDate: invitations[i].createdDate,
        status: invitations[i].status,
        code: inviters[0].subCode || inviters[0].code,
        name: inviters[0].name
      };
      receive.types = partnerships.filter(pts => pts.inviterId === invitations[i].inviterId)
        .map(pts => ({
          key: pts.type,
          code: pts.name
        }));
      receiveds.push(receive);
    }
    return Result.ok(this, {
      totalCount: totals.length > 0 ? totals[0].count : 0,
      pageSize,
      current,
      providerTypes: partnershipTypeNames.slice(1), // 去掉第一个'客户'关系
      data: receiveds
    });
  } catch (e) {
    console.log(e && e.stack);
    return Result.internalServerError(this, e.message);
  }
}

function *invitationP() {
  const body = yield cobody(this);
  let trans;
  try {
    const invitations = yield coopDao.getInvitationInfo(body.key);
    if (invitations.length !== 1) {
      throw new Error('invitation not found');
    }
    trans = yield mysql.beginTransaction();
    let status;
    if (body.type === 'accept') {
      status = INVITATION_STATUS.ACCEPTED;
      yield coopDao.updateInvitationStatus(status, new Date(), body.key, trans);
      yield coopDao.establishPartner(invitations[0].inviterId, invitations[0].inviteeId, trans);
      const partners = yield coopDao.getPartnerByPair(
        invitations[0].inviteeId, invitations[0].inviterId
      );
      if (partners.length === 0) {
        const inviterTenants = yield tenantDao.getTenantInfo(invitations[0].inviterId);
        const partnerName = inviterTenants[0].name;
        const partnerCode = getPartnerCode(inviterTenants[0].code, inviterTenants[0].subCode);
        const tenantType = getTenantTypeDesc(inviterTenants[0].level);
        const result = yield coopDao.insertPartner(
          invitations[0].inviteeId, invitations[0].inviterId,
          partnerCode, partnerName, tenantType, 1, trans
        );
        // 先删除再新建, 不在拒绝和取消时删除,因为收到和发出界面里需要显示
        // 若重新建立,则相应界面显示新的关系
        yield coopDao.deleteSinglePartnership(
          invitations[0].inviteeId, invitations[0].inviterId, trans
        );
        yield coopDao.insertPartnership(
          result.insertId, invitations[0].inviteeId, invitations[0].inviterId,
          partnerCode, partnerName,
          body.partnerships.map(ps => ({
            key: partnershipTypeNames.indexOf(ps),
            code: ps
          })), trans);
      } else {
        // 已经向邀请方发送添加请求,只需将另一条partner记录置为建立,
        // 发送邀请置为取消
        yield coopDao.cancelInvitationByPair(
          INVITATION_STATUS.CANCELED, invitations[0].inviteeId,
          invitations[0].inviterId, null, trans
        );
        yield coopDao.establishPartner(invitations[0].inviteeId, invitations[0].inviterId, trans);
      }
    } else if (body.type === 'reject') {
      status = INVITATION_STATUS.REJECTED;
      yield coopDao.updateInvitationStatus(status, null, body.key, trans);
      yield coopDao.rejectPartner(
        invitations[0].inviterId, invitations[0].inviteeId,
        invitations[0].inviteeCode, trans
      );
    }
    yield mysql.commit(trans);
    return Result.ok(this, status);
  } catch (e) {
    yield mysql.rollback(trans);
    console.log(e && e.stack);
    return Result.internalServerError(this, e.message);
  }
}

function *sentInvitationsG() {
  const current = parseInt(this.request.query.currentPage, 10);
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const tenantId = parseInt(this.request.query.tenantId, 10);
  try {
    const totals = yield coopDao.getSentInvitationCount(tenantId);
    const invitations = yield coopDao.getSentInvitations(tenantId, current, pageSize);
    const partnerships = yield coopDao.getPartnershipByInviter(tenantId);
    const sents = [];
    for (let i = 0; i < invitations.length; i++) {
      const sent = {
        key: invitations[i].id,
        createdDate: invitations[i].createdDate,
        name: invitations[i].name,
        code: separatePartnerCode(invitations[i].code),
        status: invitations[i].status
      };
      sent.types = partnerships.filter(pts => pts.partnerCode === invitations[i].code)
        .map(pts => ({
          key: pts.type,
          code: pts.name
        }));
      sents.push(sent);
    }
    return Result.ok(this, {
      totalCount: totals.length > 0 ? totals[0].count : 0,
      pageSize,
      current,
      data: sents
    });
  } catch (e) {
    console.log(e && e.stack);
    return Result.internalServerError(this, e.message);
  }
}

function *cancelInvitation() {
  const body = yield cobody(this);
  let trans;
  try {
    const invitations = yield coopDao.getInvitationInfo(body.key);
    if (invitations.length !== 1) {
      throw new Error('invitation not found');
    }
    const status = INVITATION_STATUS.CANCELED;
    trans = yield mysql.beginTransaction();
    yield coopDao.updateInvitationStatus(status, null, body.key, trans);
    yield coopDao.rejectPartner(
      invitations[0].inviterId, invitations[0].inviteeId,
      invitations[0].inviteeCode, trans
    );
    yield mysql.commit(trans);
    return Result.ok(this, status);
  } catch (e) {
    yield mysql.rollback(trans);
    return Result.internalServerError(this, e.message);
  }
}

function *sendOfflineInvitation() {
  const body = yield cobody(this);
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    yield coopDao.cancelInvitationByPair(
      INVITATION_STATUS.CANCELED, body.tenantId,
      null, body.partnerCode, trans
    );
    const code = getSmsCode(6);
    yield coopDao.insertInvitation(
      body.partnerKey, body.tenantId, -1, body.partnerCode, body.partnerName,
      INVITATION_STATUS.NEW_SENT, code, trans
    );
    // todo body.contact
    yield mysql.commit(trans);
    return Result.ok(this);
  } catch (e) {
    yield mysql.rollback(trans);
    return Result.internalServerError(this, e.message);
  }
}

function *editProviderTypes() {
  const body = yield cobody(this);
  const { tenantId, partnerInfo, providerTypes } = body;
  const { partnerTenantId, partnerName, partnerCode } = partnerInfo;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    // 更改关系时,先删除原有的关系,再插入新的关系
    yield coopDao.removePartnerships(tenantId, partnerName, partnerCode, trans);
    yield coopDao.insertPartnerships(tenantId, partnerTenantId, partnerName, partnerCode, providerTypes, trans);
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
      yield coopDao.insertPartnerships(tenantId, partnerTenantId, partnerName, partnerCode, partnerships, trans);
      newPartner = {...newPartner, partnerTenantId, tenantType };
    } else {
      addPartnerResult = yield coopDao.insertPartner(tenantId, -1, partnerCode, partnerName, PARTNER_TENANT_TYPE[3], 0, trans);
      yield coopDao.insertPartnerships(tenantId, -1, partnerName, partnerCode, partnerships, trans);
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
    const rawInvites = yield coopDao.getToInvitesWithTenantId(tenantId);
    // TODO: 优化查询的方式, 下面这个方法用于合并partnerships
    const toInvites = rawInvites.map(invite => ({...invite, partnerships: [invite.partnerships]})).reduce((total, invite) => {
      const foundIndex = total.findIndex(item => invite.partner_code === item.partner_code && invite.partner_name === item.partner_name);
      if (foundIndex !== -1) {
        total[foundIndex].partnerships.push(invite.partnerships[0]);
      } else {
        total.push(invite);
      }
      return total;
    }, []);
    return Result.ok(this, { toInvites });
  } catch(e) {
    return Result.internalServerError(this, e.message);
  }
}

export default [
  [ 'get', '/v1/cooperation/partners', partnersG ],
  [ 'post', '/v1/cooperation/partner/online', partnerOnlineP ],
  [ 'post', '/v1/cooperation/partner/offline', partnerOfflineP ],
  [ 'get', '/v1/cooperation/invitations/in', receivedInvitationsG ],
  [ 'post', '/v1/cooperation/invitation', invitationP ],
  [ 'get', '/v1/cooperation/invitations/out', sentInvitationsG ],
  [ 'post', '/v1/cooperation/invitation/cancel', cancelInvitation ],
  [ 'post', '/v1/cooperation/partner/invitation', sendOfflineInvitation ],
  [ 'post', '/v1/cooperation/partner/edit_provider_types', editProviderTypes],
  [ 'post', '/v1/cooperation/partner/add', addPartner ],
  [ 'get', '/v1/cooperation/invitation/to_invites', getToInvites]
]
