import mysql from '../../reusable/db-util/mysql';
export default {
  getOwnerLoginId(tenantId) {
    const sql = `select login_id as id from sso_tenant_users where tenant_id = ? and user_type = 'owner'`;
    const args = [tenantId];
    return mysql.query(sql, args);
  },
  getAccountInfo(loginId) {
    const sql = `select TU.name as username, T.tenant_id as tenantId, code, aspect, category_id as catgoryId
      from sso_tenant_users as TU inner join sso_tenants as T on TU.tenant_id = T.tenant_id where login_id = ?`;
    const args = [loginId];
    return mysql.query(sql, args);
  },
  getLoginNameCount(loginName, loginId, tenantId) {
    const sql = `select count(id) as count from sso_login as L inner join (select login_id from sso_tenant_users
      where login_id != ? and (tenant_id = ? or parent_tenant_id = ?)) as TU on id = TU.login_id where username = ?`;
    const args = [loginId, tenantId, tenantId, loginName];
    return mysql.query(sql, args);
  },
  getAttchedLoginIds(tenantId) {
    const sql = 'select login_id as id from sso_tenant_users where tenant_id = ? or parent_tenant_id = ?';
    const args = [tenantId, tenantId];
    return mysql.query(sql, args);
  },
  updateOwnerInfo(loginId, contact, position, trans) {
    const sql = `update sso_tenant_users set name = ?, position = ? where login_id = ?`;
    const args = [contact, position, loginId];
    return mysql.update(sql, args, trans);
  },
  updateStatus(id, status, trans) {
    const sql = `update sso_tenant_users set status = ? where user_id = ?`;
    const args = [status, id];
    return mysql.update(sql, args, trans);
  },
  insertTenantOwner(name, loginId, tenantId, parentTenantId, creator, trans) {
    const sql = `insert into sso_tenant_users(tenant_id, parent_tenant_id, login_id, name,
      user_type, creater_login_id, status, created_date) values (?, 0, NOW())`;
    const args = [tenantId, parentTenantId, loginId, name, 'owner', creator];
    return mysql.insert(sql, [args], trans);
  },
  deleteTenantUsers(corpId, trans) {
    const sql = 'delete from sso_tenant_users where tenant_id = ? or parent_tenant_id = ?';
    const args = [corpId, corpId];
    return mysql.delete(sql, args, trans);
  },
  getTenantPersonnelCount(tenantId) {
    const sql = `select count(user_id) as num from sso_tenant_users where tenant_id = ?`;
    const args = [tenantId];
    return mysql.query(sql, args);
  },
  getPagedPersonnelInCorp(tenantId, current, pageSize) {
    const sql = `select user_id as \`key\`, username as loginName, phone, email, name, position,
      TU.user_type as role, status, login_id as loginId from sso_tenant_users as TU inner join
      sso_login as L on TU.login_id = L.id where tenant_id = ? limit ?, ?`;
    const args = [tenantId, (current - 1) * pageSize, pageSize];
    return mysql.query(sql, args);
  },
  getPersonnelCorpInfo(accountId) {
    const sql = `select A.id as accountId, A.user_type as userType, name, corp_id as corpId,
      parent_corp_id as parentCorpId from sso_corp_accounts as CA inner join sso_login as A
      on A.id = CA.created_user_id where CA.id = ?`;
    const args = [accountId];
    return mysql.query(sql, args);
  }
}
