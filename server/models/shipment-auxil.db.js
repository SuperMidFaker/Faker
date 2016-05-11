import mysql from '../../reusable/db-util/mysql';

export default {
  createLog(name, remark, trans) {
    const sql = `insert into tms_shipment_logs(op_name, remark, created_date)
      values (?, NOW())`;
    const args = [name, remark];
    return mysql.insert(sql, [args], trans);
  },
  createDispLogRel(logId, dispId, trans) {
    const sql = 'insert into tms_disp_log_relations(disp_id, log_id) values (?)';
    const args = [dispId, logId];
    return mysql.insert(sql, [args], trans);
  },
};
