import tenantDao from '../../models/tenant.db';
import coopDao, { Partner, Partnership } from '../../models/cooperation.db';
import { PARTNER_TENANT_TYPE } from 'common/constants';
import codes from '../codes';

export function makePartnerCode(code, subCode) {
  return `${code}/${subCode}`;
}

function *partnersP() {
  const partners = this.reqbody.partners;
  const clientTenantId = this.tenant_id;
  try {
    const tenantsDbOps = [];
    partners.forEach(pt => {
      tenantsDbOps.push(
        tenantDao.getTenantInfoByCode(pt.partner.code, pt.partner.sub_code)
      );
    });
    const tenants = yield tenantsDbOps;
    const partnerDbOps = [];
    partners.forEach((pt, idx) => {
      const ptenants = tenants[idx];
      let ptenant;
      if (ptenants.length === 1) {
        ptenant = ptenants[0];
      }
      const partnerTid = ptenant ? ptenant.id : -1;
      const tenantType = ptenant ?
        PARTNER_TENANT_TYPE[ptenant.level] : PARTNER_TENANT_TYPE[3];
      partnerDbOps.push(
        Partner.create({
          name: pt.partner.name,
          partner_code: makePartnerCode(pt.code, pt.sub_code),
          tenant_type: tenantType,
          partner_tenant_id: partnerTid,
          tenant_id: clientTenantId,
        })
      );
    });
    const partnerInsts = yield partnerDbOps;
    const partnershipDbOps = [];
    partners.forEach((pt, idx) => {
      const ptenants = tenants[idx];
      let ptenant;
      if (ptenants.length === 1) {
        ptenant = ptenants[0];
      }
      const partnerTid = ptenant ? ptenant.id : -1;
      const pcode = makePartnerCode(pt.code, pt.sub_code);
      pt.ships.forEach(ps => {
        partnershipDbOps.push(
          Partnership.create({
            partner_id: partnerInsts[idx].id,
            tenant_id: clientTenantId,
            partner_tenant_id: partnerTid,
            partner_name: pt.partner.name,
            partner_code: pcode,
            type: ps.type,
            type_code: ps.type_code,
            status: 1,
          })
        );
      });
    });
    yield partnershipDbOps;
    return this.ok();
  } catch (e) {
    return this.internalServerError({ msg: e.message });
  }
}

function *partnersG() {
  const { tenant_id: tid, type_code: tc } = this.reqbody;
  if (!tid || !tc) {
    return this.error(codes.params_error, 'tenant_id or type_code is empty');
  }
  try {
    const partners = yield coopDao.getPartnerByTypeCode(tid, tc);
    return this.ok(partners);
  } catch (e) {
    return this.internalServerError({ msg: e.message });
  }
}

export default [
  ['post', '/v1/saas/partners', partnersP],
  ['get', '/v1/saas/partners', partnersG],
];
