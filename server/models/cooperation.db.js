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
    return [{
      key: 0,
      name: 'aa',
      tenantType: '线下',
      partnerTenantId: 1
    }, {
      key: 1,
      name: 'bb',
      tenantType: '分支机构',
      partnerTenantId: 2 
    }];
    const sql = `select id as \`key\`, name, tenant_type as tenantType,
      partner_tenant_id as partnerTenantId, business_volume as volume, revenue, cost
      from sso_partners where tenant_id = ? limit ?,?`;
    const args = [tenantId, (current - 1) * pageSize, pageSize];
    return mysql.query(sql, args);
  },
  getTenantPartnerships(tenantId, parnterName) {
    return [{
      type: '4',
      name: '仓储'
    }, {
      type: '3',
      name: '运输'
    }];
    return [];
  },
  insertBill(bill, corpId, tenantId) {
    const sql = `insert into wms_bills(payer_id, payee_id, subject, body, amount,
      batch_no, merge_batch_no, status, payment_id, payment_date, corp_id, tenant_id,
      created_date) values (?)`;
    const args = prepareArgs(bill);
    args.push(corpId, tenantId, new Date());
    console.log(bill);
    console.log('args length', args.length, args);
    return mysql.insert(sql, [args]);
  }
};
