import { STRING, INTEGER, DATE } from 'sequelize';
import sequelize from './sequelize';
import mysql from '../util/mysql';
function packColumnArgs(item) {
  const columns = [
    'code', 'sub_code', 'aspect', 'name', 'phone', 'subdomain', 'country', 'province', 'city',
    'district', 'address', 'logo', 'short_name', 'category_id', 'website', 'remark',
    'level', 'email', 'contact',
  ];
  const args = [];
  columns.forEach(c => {
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
    const sql = 'select tenant_id as id, name, code, sub_code as subCode from sso_tenants where tenant_id != ?';
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
    const sql = `select T.tenant_id as tid, T.name as name, sub_code as subCode, user_id as uid
      from sso_tenants as T inner join sso_tenant_users as TU on T.tenant_id = TU.tenant_id
      where T.tenant_id = ? and TU.user_type = 'owner' limit 1`;
    const args = [tid];
    return mysql.query(sql, args);
  },
  getTenantInfo(tid) {
    const sql = `select name, level, code, sub_code as subCode, subdomain, delegate_prefix
    from sso_tenants where tenant_id = ? limit 1`;
    const args = [tid];
    return mysql.query(sql, args);
  },
  updateCorp(corp, trans) {
    const sql = `update sso_tenants set code = ?, sub_code = ?, aspect = ?, name = ?, phone = ?, subdomain = ?,
      country = ?, province = ?, city = ?, district = ?, address = ?, logo = ?, short_name = ?,
      category_id = ?, website = ?, remark = ?, level = ?, email = ?, contact = ? where tenant_id = ?`;
    const args = packColumnArgs(corp);
    args.push(corp.key);
    return mysql.update(sql, args, trans);
  },
  updateCorpOwnerInfo(tenantId, phone, contact, email, trans) {
    const args = [];
    const sql = 'update sso_tenants set phone = ?, contact = ?, email = ? where tenant_id = ?';
    args.push(phone, contact, email, tenantId);
    return mysql.update(sql, args, trans);
  },
  updateOrganizationInfo(tenantId, name, subCode, phone, contact, email, trans) {
    const args = [];
    const sql = `update sso_tenants set name = ?, sub_code = ?, phone = ?, contact = ?,
      email = ? where tenant_id = ?`;
    args.push(name, subCode, phone, contact, email, tenantId);
    return mysql.update(sql, args, trans);
  },
  getSubdomainCount(subdomain, tenantId) {
    const sql = `select count(tenant_id) as count from sso_tenants where subdomain = ?
      and level = 1 and tenant_id != ?`;
    const args = [subdomain, tenantId];
    return mysql.query(sql, args);
  },
  getTenantByDomain(subdomain) {
    const sql = 'select logo, code, name from sso_tenants where subdomain = ? and level >= 1';
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
    const sql = `select tenant_id as \`key\`, sub_code as subCode, name, phone, email,
      contact, status from sso_tenants where parent_tenant_id = ? limit ?, ?`;
    const args = [parentTenantId, start, pageSize];
    return mysql.query(sql, args);
  },
  insertCorp(corp, parentTenantId, trans) {
    const sql = `insert into sso_tenants (code, sub_code, aspect, name, phone, subdomain, country, province,
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
      const sql = 'insert into sso_tenant_apps (tenant_id, app_id, app_name, app_desc, package, date_start) values (?, NOW())';
      const args = [tenantId, app.id, app.name, app.desc, app.package];
      return mysql.insert(sql, [args]);
    } else {
      const sql = 'delete from sso_tenant_apps where tenant_id = ? and app_id = ?';
      return mysql.delete(sql, [tenantId, app.id]);
    }
  },
  updateBranchCount(corpId, amount, trans) {
    const sql = 'update sso_tenants set branch_count = branch_count + ? where tenant_id = ?';
    const args = [amount, corpId];
    return mysql.update(sql, args, trans);
  },
  updateUserCount(tenantId, amount, trans) {
    const sql = 'update sso_tenants set user_count = user_count + ? where tenant_id = ?';
    const args = [amount, tenantId];
    return mysql.update(sql, args, trans);
  },
  getTenantInfoByCode(code, subCode) {
    // code => master tenant
    let s = ' and parent_tenant_id = 0 ';
    const args = [code];
    if (subCode && subCode.length > 0 && code !== subCode) {
      s = ' and sub_code = ? ';
      args.push(subCode);
    }

    return mysql.query(`select * from sso_tenants where code = ? ${s} limit 1`, args);
  },
  bindSubTenant(masterTenantId, masterCode) {
    return mysql.update('update sso_tenants set parent_tenant_id = ? where code = ? and parent_tenant_id = 0 and sub_code is not null and sub_code != \'\'', [masterTenantId, masterCode]);
  },
  getTenantInfoWithNameAndCode(name, code) {
    const sql = `
      SELECT tenant_id, name, level, code, sub_code as subCode
      FROM sso_tenants where name = '${name}' AND (code = '${code}' OR sub_code = '${code}')
      Limit 1
    `;
    return mysql.query(sql);
  },
  getTenants(current, pageSize) {
    const start = current * pageSize;
    const args = [start, pageSize];
    const sql = `select st.tenant_id as \`key\`, st.sub_code as subCode, st.name, st.phone, st.email,
      st.contact, st.status, stu.login_id from sso_tenants st
      inner join sso_tenant_users stu on stu.tenant_id = st.tenant_id
      where st.parent_tenant_id = 0 and st.level = 1 and stu.user_type='owner' limit ?, ?`;
    return mysql.query(sql, args);
  },
  countTenants() {
    const sql = `select count(*) as totalCount from sso_tenants st
      inner join sso_tenant_users stu on stu.tenant_id = st.tenant_id
      where st.parent_tenant_id = 0 and st.level = 1 and stu.user_type='owner'`;
    return mysql.query(sql);
  },
  getTenant(tenantId) {
    const sql = `select t.tenant_id, t.code, t.name, t.aspect, t.phone, t.subdomain, t.logo, t.contact, t.email from sso_tenants t where tenant_id = ${tenantId}`;
    return mysql.query(sql);
  },
  getTenantAppListByTenantId(tenantId) {
    const sql = 'select app_id as value, app_name as label from sso_tenant_apps t where tenant_id = ?';
    return mysql.query(sql, [tenantId]);
  },
  getTenantApps() {
    const appSql = `select entity_id as value, entity_name as label, entity_desc as app_desc,
    'basic_suite' as package from meta_apps`;
    return mysql.query(appSql);
  },
  insertTenantApps(tenantId, tenantAppList, apps) {
    let sql = '';
    tenantAppList.forEach(item => {
      for (let i = 0; i < apps.length; i++) {
        if (apps[i].value == item) {
          sql += `insert into sso_tenant_apps (tenant_id, app_id, app_name, app_desc, package, date_start)
          values ( '${tenantId}', '${apps[i].value}', '${apps[i].label}', '${apps[i].app_desc}', '${apps[i].package}', now() );`;
        }
      }
    });
    return mysql.insert(sql);
  },
  insertTenantLogin(code, email, phone, salt, password, unid) {
    const sql = `insert into sso_login (username, email, phone, salt, password, user_type, created_date, unid)
    values ( ?, ?, ?, ?, ?, 'admin', NOW(), ?)`;
    const args = [`admin@${code}`, email, phone, salt, password, unid];
    return mysql.insert(sql, args);
  },
  insertTenantUser(tenant_id, login_id, contact) {
    const sql = `insert into sso_tenant_users (tenant_id, login_id, name, user_type, created_date)
      values ( ?, ?, ?, 'owner', NOW())`;
    const args = [tenant_id, login_id, contact];
    return mysql.insert(sql, args);
  },
  insertTenant(code, name, aspect, phone, subdomain, logo, contact, email) {
    const sql = `insert into sso_tenants (code, name, aspect, phone, subdomain, logo, contact, email, level, status, created_date)
    values ( ?, ?, ?, ?, ?, ?, ?, ?, 1, 'normal', NOW())`;
    const args = [code, name, aspect, phone, subdomain, logo, contact, email];
    return mysql.insert(sql, args);
  },
  updateTenantByTenantId(tenantId, code, name, aspect, phone, subdomain, logo, contact, email) {
    const sql = `update sso_tenants set code = ?, name = ?, aspect = ?, phone = ?,
      subdomain = ?, logo = ?, contact = ?, email = ? where tenant_id = ?`;
    const args = [code, name, aspect, phone, subdomain, logo, contact, email, tenantId];
    return mysql.update(sql, args);
  },
  deleteTenantApps(tenantId) {
    const delsql = 'delete from sso_tenant_apps where tenant_id = ?';
    return mysql['delete'](delsql, [tenantId]);
  },
  deleteTenantByTenantId(tenantId, login_id) {
    const sql = `delete from sso_login where id = ?;
    delete from sso_tenant_apps where tenant_id = ?;
    delete from sso_tenant_users where tenant_id = ?;
    delete from sso_tenants where tenant_id = ?`;
    const args = [login_id, tenantId, tenantId, tenantId];
    return mysql['delete'](sql, args);
  },
};

export const Tenant = sequelize.define('sso_tenants', {
  tenant_id: {
    type: INTEGER,
    primaryKey: true,
  },
  code: STRING,
  sub_code: STRING,
  aspect: INTEGER,
  name: STRING,
  telephone: STRING,
  phone: STRING,
  subdomain: STRING,
  foundation: DATE,
  country: STRING,
  province: STRING,
  city: STRING,
  district: STRING,
  address: STRING,
  logo: STRING,
  short_name: STRING,
  category_id: INTEGER,
  website: STRING,
  remark: STRING,
  contact: STRING,
  level: STRING,
  email: STRING,
  branch_count: INTEGER,
  user_count: INTEGER,
  parent_tenant_id: INTEGER,
  delegate_prefix: STRING,
  status: STRING,
  created_date: DATE,
});
