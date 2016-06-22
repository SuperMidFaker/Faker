import cobody from 'co-body';
import Result from '../util/responseResult';
import { Partner } from '../models/cooperation.db';
import { Delegation, Dispatch } from '../models/cmsDelegation.db';

function *createDelegation() {
  const body = yield cobody(this);
  const { delegationInfo, tenantInfo, delg_type } = body;
  const { customer_tenant_id, ccb_tenant_id, tenant_id, creater_login_id, creater_login_name } = tenantInfo;
  try {
    // 生成委托运单号delg_no
    const lastDelegation = yield Delegation.findOne({where: {delg_type}, attributes: ['delg_no'], order: [['created_date', 'DESC']]});
    let delgNo;
    if (lastDelegation) {
      delgNo = Delegation.generateDelgNo('corp', delg_type, lastDelegation.delg_no.slice(-5));
    } else {
      delgNo = Delegation.generateDelgNo('corp', delg_type, '00000');
    }
    // 根据customer_tenant_id和ccb_tenant_id获取Partner表中的partner_id
    const customerPartner = yield Partner.findOne({where: {tenant_id: customer_tenant_id, partner_tenant_id: ccb_tenant_id}, attributes: ['id', 'name']});
    const ccbPartner = yield Partner.findOne({where: {tenant_id: ccb_tenant_id, partner_tenant_id: customer_tenant_id}, attributes: ['id', 'name']});
    // 新建一条Delegation
    yield Delegation.create({...delegationInfo, ...tenantInfo, delg_no: delgNo, customer_partner_id: customerPartner.id, 
      customer_partner_name: customerPartner.name, ccb_partner_id: ccbPartner.id, ccb_partner_name: ccbPartner.name});
    // 新建一条Delegation Dispatch
    yield Dispatch.create({delg_no: delgNo, ref_recv_external_no: delegationInfo.internal_no, send_login_id: creater_login_id, 
      send_login_name: creater_login_name, send_tenant_id: customer_tenant_id, sende_partner_id: customerPartner.id, send_name: customerPartner.name,
      recv_tenant_id: ccb_tenant_id, recv_partner_id: ccbPartner.id, recv_name: ccbPartner.name});
    return Result.ok(this);
  } catch(e) {
    return Result.internalServerError(this, e.message);
  }
}

export default [
  ['post', '/v1/cms/delegation/create', createDelegation]
];