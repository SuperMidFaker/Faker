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
  insert(corpId, trans) {
    const sql = `insert into sso_tenant (corp_id, branch_count, user_count, time_start) values (?, 1, 1, NOW())`;
    const args = [corpId];
    return mysql.insert(sql, args, trans);
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
