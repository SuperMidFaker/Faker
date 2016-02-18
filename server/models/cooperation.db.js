import mysql from '../../reusable/db-util/mysql';
function prepareArgs(input) {
  const args = [];
  const columns = [`payer_id`, `payee_id`, `subject`, `body`, `amount`, `batch_no`,
    `merge_batch_no`, `status`, `payment_id`, `payment_date`];
  columns.forEach((column) => {
    if (column in input) {
      if (column === 'payment_date') {
        args.push(new Date(input[column]));
      } else {
        args.push(input[column]);
      }
    } else {
      args.push(null);
    }
  });
  return args;
}
export default {
  getPartnersTotalCount(tenantId) {
    const sql = `select count(id) as count from sso_partners where tenant_id = ?`;
    const args = [tenantId];
    return mysql.query(sql, args);
  },
  getPagedPartners(tenantId, current, pageSize) {
    const sql = `select id as \`key\`, name, tenant_type as tenantType,
      partner_tenant_id as partnerTenantId, business_volume as volume, revenue, cost
      from sso_partners where tenant_id = ? and (established = 1 or partner_tenant_id = -1)
      limit ?,?`;
    const args = [tenantId, (current - 1) * pageSize, pageSize];
    return mysql.query(sql, args);
  },
  getTenantPartnerships(tenantId, partnerName) {
    const sql = `select type, type_name as name from sso_partnerships where tenant_id = ? and partner_name = ?`;
    const args = [tenantId, partnerName];
    return mysql.query(sql, args);
  },
  insertPartner(tenantId, partnerId, partnerName, tenantType, trans) {
    const sql = `insert into sso_partners(name, tenant_type, partner_tenant_id,
      tenant_id, created_date) values (?, NOW())`;
    const args = [partnerName, tenantType, partnerId, tenantId];
    return mysql.insert(sql, [args], trans);
  },
  insertPartnership(tenantId, partnerId, partnerName, partnerships, trans) {
    const sql = `insert into sso_partnerships(tenant_id, partner_tenant_id, partner_name,
      type, type_name) values ?`;
    const args = [];
    partnerships.forEach(pts => {
      args.push([tenantId, partnerId, partnerName, pts.key, pts.name]);
    });
    console.log('partnership args', args);
    return mysql.insert(sql, [args], trans);
  },
  insertInvitation(tenantId, partnerId, partnerName, code, trans) {
    const sql = `insert into sso_partner_invitations(inviter_tenant_id, invitee_tenant_id,
      invitee_name, invitation_code, status, created_date) values (?, 0, NOW())`;
    const args = [tenantId, partnerId, partnerName, code];
    return mysql.insert(sql, [args], trans);
  }
};
