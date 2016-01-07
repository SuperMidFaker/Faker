import mysql from '../../reusable/db-util/mysql';
export default {
  getOwnerLoginId(tenantId) {
    const sql = `select login_id as id from sso_tenant_users where tenant_id = ? and user_type = 'owner'`;
    const args = [tenantId];
    return mysql.query(sql, args);
  },
  getAccountInfo(loginId) {
    const sql = `select name, tenant_id as tenantId from sso_tenant_users where login_id = ?`;
    const args = [loginId];
    return mysql.query(sql, args);
  },
  updateOwnerInfo(loginId, contact, position, trans) {
    const sql = `update sso_tenant_users set name = ?, position = ? where login_id = ?`;
    const args = [contact, position, loginId];
    return mysql.update(sql, args, trans);
  }
}
