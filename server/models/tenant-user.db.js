import mysql from '../../reusable/db-util/mysql';
function putInComposition(f, args) {
  let sql = '';
  if (f.name === 'username') {
    sql = 'username like ?';
    args.push('%' + f.value + '%');
  } else if (f.name === 'email') {
    sql = 'email like ?';
    args.push('%' + f.value + '%');
  } else if (f.name === 'phone') {
    sql = 'phone like ?';
    args.push('%' + f.value + '%');
  } else if (f.name === 'name') {
    sql = 'name like ?';
    args.push('%' + f.value + '%');
  } else if (f.name === 'role') {
    sql = 'TU.user_type = ?';
    args.push(f.value);
  }
  return sql;
}
function concatFilterSql(filters, args) {
  let sqlClause = '';
  for (let i = 0, len = filters.length; i < len; i++) {
    sqlClause += ' and '; // 第一层级与关系
    const f = filters[i];
    if (f.length > 0) { // 第二层级为或关系
      sqlClause += '(';
      for (let j = 0, lenf = f.length; j < lenf; j++) {
        sqlClause += putInComposition(f[j], args);
        sqlClause += ' or ';
      }
      sqlClause = sqlClause.slice(0, -3);
      sqlClause += ')';
    } else {
      sqlClause += putInComposition(f, args);
    }
  }
  return sqlClause;
}
export default {
  getOwnerLoginId(tenantId) {
    const sql = `select login_id as id from sso_tenant_users where tenant_id = ? and user_type = 'owner'`;
    const args = [tenantId];
    return mysql.query(sql, args);
  },
  getAccountInfo(loginId) {
    const sql = `select login_id as loginId, TU.name as username, T.tenant_id as tenantId, code, aspect,
      category_id as categoryId from sso_tenant_users as TU inner join sso_tenants as T
      on TU.tenant_id = T.tenant_id where login_id = ?`;
    const args = [loginId];
    return mysql.query(sql, args);
  },
  getLoginNameCount(loginName, loginId, tenantId) {
    const sql = `select count(id) as count from sso_login as L inner join (select login_id from sso_tenant_users
      where login_id != ? and (tenant_id = ? or parent_tenant_id = ?)) as TU on id = TU.login_id where username = ?`;
    const args = [loginId || -1, tenantId, tenantId, loginName];
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
  updateUserType(id, userType, trans) {
    const sql = `update sso_tenant_users set user_type = ? where user_id = ?`;
    const args = [userType, id];
    return mysql.update(sql, args, trans);
  },
  insertTenantOwner(name, loginId, tenantId, parentTenantId, creator, trans) {
    // todo union with insertPersonnel
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
  getTenantPersonnelCount(tenantId, filters) {
    const args = [tenantId];
    const filterClause = concatFilterSql(filters, args);
    const sql = `select count(user_id) as num from sso_tenant_users as TU inner join
      sso_login as L on login_id = id where tenant_id = ? ${filterClause}`;
    console.log(sql, args);
    return mysql.query(sql, args);
  },
  getPagedPersonnelInCorp(tenantId, current, pageSize, filters, sortField, sortOrder) {
    const args = [tenantId];
    const filterClause = concatFilterSql(filters, args);
    let sortColumn = sortField || 'user_id';
    if (sortColumn === 'role') {
      sortColumn = 'TU.user_type';
    }
    const sortClause = ` order by ${sortColumn} ${sortOrder === 'descend' ? 'desc' : 'asc'} `;
    const sql = `select user_id as \`key\`, username as loginName, phone, email, name, position,
      TU.user_type as role, status, login_id as loginId from sso_tenant_users as TU inner join
      sso_login as L on TU.login_id = L.id where tenant_id = ? ${filterClause} ${sortClause}
      limit ?, ?`;
    args.push((current - 1) * pageSize, pageSize);
    console.log(sql, args);
    return mysql.query(sql, args);
  },
  insertPersonnel(creator, loginId, personnel, tenant, trans) {
    const sql = `insert into sso_tenant_users(tenant_id, parent_tenant_id, login_id, name, position,
      user_type, creater_login_id, status, created_date) values (?, ?, ?, ?, ?, ?, ?, 0, NOW())`;
    const args = [tenant.id, tenant.parentId, loginId, personnel.name,
      personnel.position, personnel.role, creator];
    return mysql.insert(sql, args, trans);
  },
  updatePersonnel(p, trans) {
    const sql = `update sso_tenant_users set name = ?, user_type = ?, position = ? where user_id = ?`;
    const args = [p.name, p.role, p.position, p.key];
    return mysql.update(sql, args, trans);
  },
  deletePersonnel(pid, trans) {
    const sql = 'delete from sso_tenant_users where user_id = ?';
    const args = [pid];
    return mysql.delete(sql, args, trans);
  },
  getPersonnelInfo(pId) {
    const sql = `select user_id as \`key\`, username as loginName, phone, email, name, position,
      TU.user_type as role, status, login_id as loginId from sso_tenant_users as TU inner join
      sso_login as L on TU.login_id = L.id where user_id = ?`;
    const args = [pId];
    return mysql.query(sql, args);
  },
  getTenantUsers(tenantId) {
    const sql = 'select user_id as id, name from sso_tenant_users where tenant_id = ?';
    const args = [tenantId];
    return mysql.query(sql, args);
  }
}
