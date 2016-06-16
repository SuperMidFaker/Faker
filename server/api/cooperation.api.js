import cobody from 'co-body';
import coopDao from '../models/cooperation.db';
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

function *getPartner() {
  const tenantId = this.request.query.tenantId;
  try {
    const partners = yield Partner.findAll({
      where: {tenant_id: tenantId},
      order: [
        ['created_date', 'DESC']
      ],
      include: [
        {model: Partnership, as: 'partnerships'}
      ]
    });
    const partnerlist = partners.map(partner => transformUnderscoreToCamel(partner.transformPartnerships().get(), ['created_date']));
    return Result.ok(this, { partnerlist });
  } catch(e) {
    return Result.internalServerError(this, e.message);
  }
}

function *addPartner() {
  const body = yield cobody(this);
  const { tenantId, partnerInfo: { partnerName, partnerCode }, partnerships } = body;
  try {
    const partnerTenant = yield Tenant.findOne({
      where: { name: partnerName,  $or: [{code: partnerCode}, {sub_code: partnerCode}]}
    });
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
        type_code: typeCode,
        status: partnerTenant ? 0 : 1 // 线上租户只有接受了邀请才能status才为1
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

function *deletePartner() {
  const body = yield cobody(this);
  const { id } = body;
  try {
    yield Partner.destroy({where: {id}});
    yield Partnership.destroy({where: {partner_id: id}});
    yield Invitation.destroy({where: {partner_id: id}});
    return Result.ok(this);
  } catch(e) {
    return Result.internalServerError(this, e.message);
  }
}

function *editPartner() {
  const body = yield cobody(this);
  const { partnerId, name, code } = body;
  try {
    yield Partner.update({name, partner_code: code}, {where: {id: partnerId}});
    yield Partnership.update({partner_name: name, partner_code: code}, {where: {partner_id: partnerId}});
    yield Invitation.update({invitee_name: name, invitee_code: code}, {where: {partner_id: partnerId}});
    return Result.ok(this);
  } catch(e) {
    return Result.internalServerError(this, e.message);
  }
}

function *changePartnerAndPartnershipStatus() {
  const body = yield cobody(this);
  const { id, status } = body;
  try {
    yield Partner.update({status}, {where: {id}});
    yield Partnership.update({status}, {where: {partner_id: id}});
    return Result.ok(this);
  } catch(e) {
    return Result.internalServerError(this, e.message);
  }
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
  const { partnerId, tenantId, partnerships } = body;
  let trans;
  try {
    const partnership = yield Partnership.findOne({where: {partner_id: partnerId}, attributes: {exclude: ['id', 'type_code']}});
    const partnershipInfo = partnership.get();
    yield Partnership.destroy({where: {partner_id: partnerId}});
    yield Partnership.bulkCreate(partnerships.map(ps => ({...partnershipInfo, type_code: ps})));
    yield mysql.commit(trans);
    return Result.ok(this);
  } catch(e) {
    yield mysql.rollback(trans);
    return Result.internalServerError(this, e.message);
  }
}

function *getToInvites() {
  const tenantId = this.request.query.tenantId;
  try {
    const rawToInvites = yield Partner.findAll({
      where: {tenant_id: tenantId, invited: 0},
      attributes: [['id', 'partner_id'], 'name', ['partner_code', 'code'], 'created_date', ['partner_tenant_id', 'tenant_id']],
      include: [
        {model: Partnership, as: 'partnerships'}
      ],
      order: [
        ['created_date', 'DESC']
      ]
    });
    const toInvites = rawToInvites.map(invitee => invitee.transformPartnerships().get());
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

export default [
  [ 'get', '/v1/cooperation/partners', getPartner ],
  [ 'post', '/v1/cooperation/partner/delete', deletePartner ],
  [ 'post', '/v1/cooperation/partner/add', addPartner ],
  [ 'post', '/v1/cooperation/partner/edit', editPartner ],
  [ 'post', '/v1/cooperation/partner/change_status', changePartnerAndPartnershipStatus ],
  [ 'post', '/v1/cooperation/partner/edit_provider_types', editProviderTypes ],
  [ 'get', '/v1/cooperation/invitation/to_invites', getToInvites ],
  [ 'get', '/v1/cooperation/invitation/send_invitations', getSendInvitations ],
  [ 'get', '/v1/cooperation/invitation/receive_invitations', getReceiveInvitations ],
  [ 'post', '/v1/cooperation/invitation/cancel_invite', cancelInvite ],
  [ 'post', '/v1/cooperation/invitation/invite_offline_partner', inviteOfflinePartner ],
  [ 'post', '/v1/cooperation/invitation/invite_online_partner', inviteOnlinePartner ],
  [ 'post', '/v1/cooperation/invitation/reject_invitation', rejectInvitation ],
  [ 'post', '/v1/cooperation/invitation/accept_invitation', acceptInvitation ]
]
