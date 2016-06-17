import cobody from 'co-body';
import mysql from '../util/mysql';
import Result from '../util/responseResult';
import { TENANT_LEVEL, INVITATION_STATUS, PARTNERSHIP_TYPE_INFO, PARTNER_TENANT_TYPE, PARTNERSHIP }
  from 'common/constants';
import { Partner, Partnership, Invitation, Tenant } from '../models/sequelize';
import transformUnderscoreToCamel from '../util/transformUnderscoreToCamel';

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
    const newPartner = {name: partnerName, partnerCode, partnerships, status: 1, partnerTenantId: partner.partner_tenant_id, 
      tenantType: partner.tenant_type, key: partner.id};
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
  try {
    yield Invitation.create({partner_id: inviteeInfo.partnerId, inviter_tenant_id: tenantId, invitee_tenant_id: inviteeInfo.tenantId, 
      invitee_name: inviteeInfo.name, invitee_code: inviteeInfo.code});
    yield Partner.update({invited: 1}, {where: {id: inviteeInfo.partnerId}});
    // TODO: 发送短信或者邮件给线下用户
    return Result.ok(this);
  } catch(e) {
    return Result.internalServerError(this, e.message);
  }
}

function *inviteOnlinePartner() {
  const body = yield cobody(this);
  const { tenantId, inviteeInfo } = body;
  try {
    yield Invitation.create({partner_id: inviteeInfo.partnerId, inviter_tenant_id: tenantId, invitee_tenant_id: inviteeInfo.tenantId,
      invitee_name: inviteeInfo.name, invitee_code: inviteeInfo.code});
    yield Partner.update({invited: 1}, {where: {id: inviteeInfo.partnerId}});
    return Result.ok(this);
  } catch(e) {
    yield mysql.rollback(trans);
    return Result.internalServerError(this, e.message);
  }
}

function *getSendInvitations() {
  const tenantId = this.request.query.tenantId;
  try {
    const sendInvitations = yield Invitation.getSendInvitationsByTenantId(tenantId);
    return Result.ok(this, {sendInvitations});
  } catch(e) {
    return Result.internalServerError(this, e.message);
  }
}

function *getReceiveInvitations() {
  const tenantId = this.request.query.tenantId;
  try {
    const receiveInvitations = yield Invitation.getReceiveInvitationsByTenantId(tenantId);
    return Result.ok(this, {receiveInvitations});
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *cancelInvite() {
  const { id, partnerId } = yield cobody(this);
  try {
    const status = INVITATION_STATUS.CANCELED;
    yield Invitation.update({status}, {where: {id}});
    yield Partner.update({invited: 0}, {where: {id: partnerId}});
    return Result.ok(this);
  } catch(e) {
    return Result.internalServerError(this, e.message);
  }
}

function *rejectInvitation() {
  const body = yield cobody(this);
  const { partnerId, id } = body;
  try {
    const status = INVITATION_STATUS.REJECTED;
    yield Invitation.update({status: 2}, {where: {id}});
    yield Partner.update({invited: 0}, {where: {id: partnerId}});
    return Result.ok(this);
  } catch(e) {
    return Result.internalServerError(this, e.message);
  }
}

function *acceptInvitation() {
  const body = yield cobody(this);
  const { id, partnerId, reversePartnerships } = body;
  try {
    const status = INVITATION_STATUS.ACCEPTED
    // 先更新原有的partner,partnership,invitation
    yield Invitation.update({status: 1}, {where: {id}});
    yield Partner.update({established: 1, invited: 1}, {where: {id: partnerId}});
    yield Partnership.update({status: 1}, {where: {partner_id: partnerId}});
    // 再插入新的partner和partnership
    const originPartner = yield Partner.findById(partnerId);
    const originTenant = yield Tenant.findById(originPartner.get('tenant_id'));
    const newPartner = yield Partner.create({name: originTenant.name, partner_code: originTenant.code, tenant_type: PARTNER_TENANT_TYPE[originTenant.level],
    partner_tenant_id: originPartner.tenant_id, tenant_id: originPartner.partner_tenant_id, established: 1, invited: 1});
    // 建立关系的时候,如果邀请是供应商或者物流提供商,新的关系就是客户,否则根据前端传入的partnerships建立新的关系
    yield Partnership.bulkCreate(reversePartnerships.map(ps => ({partner_id: newPartner.id, tenant_id: newPartner.tenant_id,
    partner_tenant_id: newPartner.partner_tenant_id, partner_name: newPartner.name, partner_code: newPartner.partner_code, type_code: ps, status: 1})));
    return Result.ok(this);
  } catch(e) {
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
