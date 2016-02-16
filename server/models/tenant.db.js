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
  getAllTenantsExcept(tenantId) {
    const sql = 'select tenant_id as id, name from sso_tenants where tenant_id != ?';
    const args = [tenantId];
    return mysql.query(sql, args);
  },
  getCorpAndOwnerInfo(corpId) {
    const sql = `select T.tenant_id as \`key\`, code, aspect, T.name as name, phone, subdomain,
      country, province, city, district, address, logo, short_name, category_id, website, remark,
      level, email, contact, position, login_id as loginId, username as loginName from
      sso_tenants as T inner join (select tenant_id, login_id, name, username, position from
      sso_tenant_users as TU inner join sso_login as L on TU.login_id = L.id where TU.tenant_id = ?
      and TU.user_type = 'owner') as TUL on T.tenant_id = TUL.tenant_id limit 1`;
    const args = [corpId];
    return mysql.query(sql, args);
  },
  getPartialTenantInfo(tid) {
    const sql = `select T.tenant_id as tid, T.name as name, user_id as uid from sso_tenants as T
      inner join sso_tenant_users as TU on T.tenant_id = TU.tenant_id where T.tenant_id = ? and
      TU.user_type = 'owner' limit 1`;
    const args = [tid];
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
  updateCorpOwnerInfo(tenantId, tenantName, phone, contact, email, trans) {
    const args = [];
    let nameCol = '';
    if (tenantName !== null && tenantName !== undefined) {
      nameCol = 'name = ?,';
      args.push(tenantName);
    }
    const sql = `update sso_tenants set ${nameCol} phone = ?, contact = ?, email = ? where tenant_id = ?`;
    args.push(phone, contact, email, tenantId);
    return mysql.update(sql, args, trans);
  },
  getSubdomainCount(subdomain, tenantId) {
    const sql = `select count(tenant_id) as count from sso_tenants where subdomain = ?
      and level = 1 and tenant_id != ?`;
    const args = [subdomain, tenantId];
    return mysql.query(sql, args);
  },
  getTenantByDomain(subdomain) {
    const sql = 'select logo, code, name from sso_tenants where subdomain = ? and level = 1';
    const args = [subdomain];
    return mysql.query(sql, args);
  },
  getAppsInfoById(tenantId) {
    const sql = `select app_id as id, app_name as name, package, app_desc as \`desc\`
      from sso_tenant_apps where tenant_id = ?`;
    const args = [tenantId];
    return mysql.query(sql, args);
  },
  getOrganCountByParent(parentTenantId) {
    const sql = 'select count(tenant_id) as num from sso_tenants where parent_tenant_id = ?';
    const args = [parentTenantId];
    return mysql.query(sql, args);
  },
  getPagedOrgansByParent(parentTenantId, current, pageSize) {
    const start = (current - 1) * pageSize;
    const sql = `select tenant_id as \`key\`, name, phone, email, contact, status
      from sso_tenants where parent_tenant_id = ? limit ?, ?`;
    const args = [parentTenantId, start, pageSize];
    return mysql.query(sql, args);
  },
  insertCorp(corp, parentTenantId, trans) {
    const sql = `insert into sso_tenants (code, aspect, name, phone, subdomain, country, province,
      city, district, address, logo, short_name, category_id, website, remark, level, email, contact,
      parent_tenant_id, status, created_date) values (?, 'normal', NOW())`;
    const args = packColumnArgs(corp);
    args.push(parentTenantId);
    return mysql.insert(sql, [args], trans);
  },
  updateStatus(tenantId, status, trans) {
    const sql = 'update sso_tenants set status = ? where tenant_id = ?';
    const args = [status, tenantId];
    return mysql.update(sql, args, trans);
  },
  getAttachedTenants(tenantId) {
    const sql = `select tenant_id as \`key\`, name, parent_tenant_id as parentId from sso_tenants where status = 'normal'
      and (tenant_id = ? or parent_tenant_id = ?)`;
    const args = [tenantId, tenantId];
    return mysql.query(sql, args);
  },
  deleteTenant(corpId, trans) {
    const sql = 'delete from sso_tenants where tenant_id = ? or parent_tenant_id = ?';
    const args = [corpId, corpId];
    return mysql.delete(sql, args, trans);
  },
  changeOverTenantApp(tenantId, checked, app) {
    if (checked) {
      const sql = `insert into sso_tenant_apps (tenant_id, app_id, app_name, app_desc, package, date_start) values (?, NOW())`;
      const args = [tenantId, app.id, app.name, app.desc, app.package];
      return mysql.insert(sql, [args]);
    } else {
      const sql = 'delete from sso_tenant_apps where tenant_id = ? and app_id = ?';
      return mysql.delete(sql, [tenantId, app.id]);
    }
  },
  updateBranchCount(corpId, amount, trans) {
    const sql = `update sso_tenants set branch_count = branch_count + ? where tenant_id = ?`;
    const args = [amount, corpId];
    return mysql.update(sql, args, trans);
  },
  updateUserCount(tenantId, amount, trans) {
    const sql = `update sso_tenants set user_count = user_count + ? where tenant_id = ?`;
    const args = [amount, tenantId];
    return mysql.update(sql, args, trans);
  }
}
