import cobody from 'co-body';
import coopDao from '../models/cooperation.db';
import tenantDao from '../models/tenant.db';
import mysql from '../util/mysql';
import Result from '../util/responseResult';
import { TENANT_LEVEL, INVITATION_STATUS, PARTNERSHIP_TYPE_INFO, PARTNER_TENANT_TYPE, PARTNERSHIP }
  from 'common/constants';
import { Partner, Partnership, Invitation, Tenant } from '../models/sequelize';
import transformUnderscoreToCamel from '../util/transformUnderscoreToCamel';

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

function transformInvitations(rawInvites) {
  return rawInvites.map(invitee => ({...invitee, partnerships: [invitee.partnerships]})).reduce((total, invitee) => {
    const foundIndex = total.findIndex(item => invitee.code === item.code && invitee.name === item.name);
    if (foundIndex !== -1) {
      total[foundIndex].partnerships.push(invitee.partnerships[0]);
    } else {
      total.push(invitee);
    }
    return total;
  }, []);
}

function *cancelInvite() {
  const { id, partnerId } = yield cobody(this);
  let trans;
  try {
    const invitations = yield coopDao.getInvitationInfo(id);
    if (invitations.length !== 1) {
      throw new Error('invitation not found');
    }
    const status = INVITATION_STATUS.CANCELED;
    trans = yield mysql.beginTransaction();
    yield coopDao.updateInvitationStatus(status, null, id, trans);
    yield coopDao.updatePartnerInvited(partnerId, 0, trans);
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
    yield coopDao.insertPartnerships(partnerKey, tenantId, partnerTenantId,
                                     partnerName, partnerCode, providerTypes, trans);
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
  let newPartner = {name: partnerName, partnerCode, types: partnerships.map(partnership => ({code: partnership})), status: 1}; // 返回给客户端的新增partner
  let addPartnerResult;
  let trans;
  try {
    // 根据partner的name和code查询是否存在这个租户,不存在就创建一个线下的partner,如果存在则根据线上用户的信息创建partner
    trans = yield mysql.beginTransaction();
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

function *addPartner2() {
  const body = yield cobody(this);
  const { tenantId, partnerInfo: { partnerName, partnerCode }, partnerships } = body;
  try {
    const partnerTenant = yield Tenant.findOne({
      where: { name: partnerName,  $or: [{code: partnerCode}, {sub_code: partnerCode}]}
    });
    console.log(partnerTenant);
    let partner;
    // 添加partner
    if (partnerTenant) { // 线上租户
      const existPartner = yield Partner.findOne({
        where: { name: partnerName, partner_code: partnerCode, partner_tenant_id: partnerTenant.tenant_id, tenant_id: tenantId }
      });
      if (!existPartner) {
        const tenantType = PARTNER_TENANT_TYPE[partnerTenant.level];
        partner = yield Partner.create({
          name: partnerName,
          partner_code: partnerCode,
          tenant_type: tenantType,
          partner_tenant_id: partnerTenant.tenant_id,
          tenant_id: tenantId
        });
      } else {
        throw new Error('该合作伙伴已添加');
      }
    } else { // 线下租户
      const existPartner = yield Partner.findOne({
        where: { name: partnerName, partner_code: partnerCode, partner_tenant_id: -1, tenant_id: tenantId }
      });
      if (!existPartner) {
        partner = yield Partner.create({
          name: partnerName,
          partner_code: partnerCode,
          tenant_type: PARTNER_TENANT_TYPE[3],
          partner_tenant_id: -1, 
          tenant_id: tenantId});
      } else {
        throw new Error('该合作伙伴已添加');
      }
    }
    // 添加partnerships
    for(let typeCode of partnerships) {
      const partnership = yield Partnership.create({
        partner_id: partner.id,
        tenant_id: tenantId,
        partner_tenant_id: partner.partner_tenant_id,
        partner_name: partnerName,
        partner_code: partnerCode,
        type_code: typeCode
      });
    }
    // 返回给客户端的新增partner
    const newPartner = {name: partnerName, partnerCode, types: partnerships.map(partnership => ({code: partnership})), 
      status: 1, partnerTenantId: partner.partner_tenant_id, tenantType: partner.tenant_type, key: partner.id};
    return Result.ok(this, { newPartner });
  } catch(e) {
    return Result.internalServerError(this, e.message);
  }
}

function *editPartner() {
  let trans;
  try {
    const body = yield cobody(this);
    const { partnerId, name, code } = body;
    trans = yield mysql.beginTransaction();
    yield [
      coopDao.updatePartnerById(partnerId, name, code, trans),
      coopDao.updatePartnershipById(partnerId, name, code, trans),
      coopDao.updateInvitationById(partnerId, name, code, trans),
    ];
    yield mysql.commit(trans);
    return Result.ok(this);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    return Result.internalServerError(this, e.message);
  }
}

function *getToInvites() {
  const tenantId = this.request.query.tenantId;
  try {
    const offlineInvites = yield coopDao.getOfflineInvitesWithTenantId(tenantId);
    const onlineInvites = yield coopDao.getOnlineInvitesWithTenantId(tenantId);
    const rawInvites = [...offlineInvites, ...onlineInvites];
    // TODO: 优化查询的方式, 下面这个方法用于合并partnerships
    const toInvites = transformInvitations(rawInvites);
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
    trans = yield mysql.beginTransaction();
    yield coopDao.insertInvitation(inviteeInfo.partnerId, tenantId, -1,
                                   inviteeInfo.code, inviteeInfo.name, 0, null, trans);
    yield coopDao.updatePartnerInvited(inviteeInfo.partnerId, 1, trans);
    // TODO: 发送短信或者邮件给线下用户
    yield mysql.commit(trans);
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
    trans = yield mysql.beginTransaction();
    yield coopDao.insertInvitation(inviteeInfo.partnerId, tenantId, inviteeInfo.tenantId,
                                   inviteeInfo.code, inviteeInfo.name, 0, null, trans);
    yield coopDao.updatePartnerInvited(inviteeInfo.partnerId, 1, trans);
    yield mysql.commit(trans);
    return Result.ok(this);
  } catch(e) {
    yield mysql.rollback(trans);
    return Result.internalServerError(this, e.message);
  }
}

function *getSendInvitations() {
  const tenantId = this.request.query.tenantId;
  try {
    const rawInvitations = yield coopDao.getSendInvitationsByTenantId(tenantId);
    const sendInvitations = transformInvitations(rawInvitations);
    return Result.ok(this, {sendInvitations});
  } catch(e) {
    return Result.internalServerError(this, e.message);
  }
}

function *getReceiveInvitations() {
  const tenantId = this.request.query.tenantId;
  try {
    const rawInvitations = yield coopDao.getReceiveInvitationsByTenantId(tenantId);
    const receiveInvitations = transformInvitations(rawInvitations);
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
    trans = yield mysql.beginTransaction();
    yield coopDao.updateInvitationStatus(2, null, id, trans);
    yield mysql.commit(trans);
    return Result.ok(this);
  } catch (e) {
    yield mysql.rollback(trans);
    return Result.internalServerError(this, e.message);
  }
}

function *acceptInvitation() {
  const body = yield cobody(this);
  const { id } = body;
  let trans;
  try {
    // 接受时,需要同时更新invitation表中的status和partnerships中的establish
    trans = yield mysql.beginTransaction();
    const invitationInfo = yield coopDao.getInvitationInfo(id);
    yield coopDao.establishPartner(invitationInfo.inviterId, invitationInfo.inviteeId, trans);
    yield coopDao.updateInvitationStatus(1, null, id, trans);
    yield mysql.commit(trans);
    return Result.ok(this);
  } catch (e) {
    yield mysql.rollback(trans);
    return Result.internalServerError(this, e.message);
  }
}

function *changePartnerStatus() {
  const body = yield cobody(this);
  const { id, status } = body;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    yield coopDao.updatePartnerStatus(id, status, trans);
    yield mysql.commit(trans);
    return Result.ok(this);
  } catch(e) {
    mysql.rollback(trans);
    return Result.internalServerError(this, e.message);
  }
}

function *deletePartner() {
  const body = yield cobody(this);
  const { id } = body;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    yield coopDao.deletePartner(id, trans);
    yield coopDao.deletePartnershipsByPartnerId(id, trans);
    yield coopDao.deletePartnershipsByPartnerId(id, trans);
    yield mysql.commit(trans);
    return Result.ok(this);
  } catch(e) {
    mysql.rollback(trans);
    return Result.internalServerError(this, e.message);
  }
}

function *getPartner() {
  const tenantId = this.request.query.tenantId;
  try {
    const partners = yield Partner.findAll({
      where: {tenant_id: tenantId},
      order: [
        ['created_date', 'DESC']
      ]
    });
    console.log(partners.map(partner => partner.get()));
    const partnerlist = [];
    for (let partner of partners) {
      const types = [];
      const partnerships = yield partner.getPartnerships().then(ps => ps.map(p => p.get()));
      partnerships.forEach(ps => {
        types.push({key: ps.type, code: ps.type_code});
      });
      partnerlist.push({...transformUnderscoreToCamel(partner.get(), ['created_date']), types});
    }
    return Result.ok(this, {partnerlist: partnerlist}); 
  } catch(e) {
    return Result.internalServerError(this, e.message);
  }
}

export default [
  [ 'get', '/v1/cooperation/partners', getPartner ],
  [ 'get', '/v1/cooperation/invitation/send_invitations', getSendInvitations ],
  [ 'get', '/v1/cooperation/invitation/receive_invitations', getReceiveInvitations ],
  [ 'post', '/v1/cooperation/invitation/cancel_invite', cancelInvite ],
  [ 'post', '/v1/cooperation/partner/edit_provider_types', editProviderTypes ],
  [ 'post', '/v1/cooperation/partner/add', addPartner ],
  [ 'post', '/v2/cooperation/partner/add', addPartner2 ],
  [ 'post', '/v1/cooperation/partner/edit', editPartner ],
  [ 'get', '/v1/cooperation/invitation/to_invites', getToInvites ],
  [ 'post', '/v1/cooperation/invitation/invite_offline_partner', inviteOfflinePartner ],
  [ 'post', '/v1/cooperation/invitation/invite_online_partner', inviteOnlinePartner ],
  [ 'post', '/v1/cooperation/invitation/reject_invitation', rejectInvitation ],
  [ 'post', '/v1/cooperation/invitation/accept_invitation', acceptInvitation ],
  [ 'post', '/v1/cooperation/partner/change_status', changePartnerStatus ],
  [ 'post', '/v1/cooperation/partner/delete', deletePartner ]
]
