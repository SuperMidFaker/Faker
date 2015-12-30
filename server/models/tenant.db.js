import mysql from '../../reusable/db-util/mysql';
export default {
  insert(corpId, trans) {
    const sql = `insert into sso_tenant (corp_id, branch_count, user_count, time_start) values (?, 1, 1, NOW())`;
    const args = [corpId];
    return mysql.insert(sql, args, trans);
  },
  updateBranchCount(corpId, trans) {
    const sql = `update sso_tenant set branch_count = branch_count + 1 where corp_id = ?`;
    const args = [corpId];
    return mysql.update(sql, args, trans);
  },
  getTenant(corpid) {
    const sql = 'select tms, che, app from sso_tenant where corp_id = ?';
    const args = [corpid];
    return mysql.query(sql, args);
  },
  deleteTenant(corpId, trans) {
    const sql = `delete from sso_tenant where corp_id = ?`;
    const args = [corpId];
    return mysql.delete(sql, args, trans);
  }
}
