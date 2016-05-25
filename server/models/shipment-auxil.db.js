import mysql from '../util/mysql';

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
  getPod(podId) {
    const sql = 'select sign_status, sign_remark, photos, submitter where pod_id = ?';
    const args = [podId];
    return mysql.query(sql, args);
  },
  createPod(type, signStatus, signRemark, photos, submitter, trans) {
    const sql = `insert into tms_shipment_pods(type, sign_status, sign_remark,
      photos, submitter, submit_date, created_date) values (?, NOW(), NOW())`;
    const args = [ type, signStatus, signRemark, photos, submitter ];
    return mysql.insert(sql, [args], trans);
  }
};
