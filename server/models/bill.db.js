import mysql from '../db-util/mysql';
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
  getBillTotalCount(corpId) {
    const sql = `select count(id) as count from wms_bills where corp_id = ?`;
    const args = [corpId];
    return mysql.query(sql, args);
  },
  getPagedBillsByCorp(corpId) {
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
