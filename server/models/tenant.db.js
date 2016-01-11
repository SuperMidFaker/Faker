import mysql from '../../reusable/db-util/mysql';
function packColumnArgs(item) {
  const columns = [
    `code`, `aspect`, `name`, `phone`, `subdomain`, `country`, `province`, `city`,
    `district`, `address`, `logo`, `short_name`, `category_id`, `website`, `remark`,
    `level`, `email`, `contact`
  ]; 
  const args = [];
  columns.forEach((c) => {
    if (c in item) {
      args.push(item[c]);
    } else {
      args.push(null);
    }
  });
  return args;
}
export default {
  getCorpAndOwnerInfo(corpId) {
    const sql = `select T.tenant_id as \`key\`, code, aspect, T.name as name, phone, subdomain, country, province,
      city, district, address, logo, short_name, category_id, website, remark, level, email, contact,
      position, username as loginName from sso_tenants as T inner join (select tenant_id, name, username,
      position from sso_tenant_users as TU inner join sso_login as L on TU.login_id = L.id where TU.tenant_id
      = ? and TU.user_type = 'owner') as TUL on T.tenant_id = TUL.tenant_id limit 1`;
    const args = [corpId];
    return mysql.query(sql, args);
  },
  updateCorp(corp, trans) {
    const sql = `update sso_tenants set code = ?, aspect = ?, name = ?, phone = ?, subdomain = ?,
      country = ?, province = ?, city = ?, district = ?, address = ?, logo = ?, short_name = ?,
      category_id = ?, website = ?, remark = ?, level = ?, email = ?, contact = ? where tenant_id = ?`;
    const args = packColumnArgs(corp);
    args.push(corp.key);
    return mysql.update(sql, args, trans);
  },
  getSubdomainCount(subdomain, tenantId) {
    const sql = `select count(tenant_id) as count from sso_tenants where subdomain = ? and level = 1 and tenant_id != ?`;
    const args = [subdomain, tenantId];
    return mysql.query(sql, args);
  },
  getCorpCountByParent(parentTenantId) {
    const sql = 'select count(tenant_id) as num from sso_tenants where parent_tenant_id = ?';
    const args = [parentTenantId];
    return mysql.query(sql, args);
  },
  getPagedCorpsByParent(parentTenantId, current, pageSize) {
    const start = (current - 1) * pageSize;
    const sql = `select tenant_id as \`key\`, code, name, phone, status from sso_tenants where parent_tenant_id = ? limit ?, ?`;
    const args = [parentTenantId, start, pageSize];
    return mysql.query(sql, args);
  },
  updateBranchCount(corpId, trans) {
    const sql = `update sso_tenants set branch_count = branch_count + 1 where corp_id = ?`;
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
