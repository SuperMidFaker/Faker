import mysql from '../../reusable/db-util/mysql';
function packColumnArgs(item) {
  const columns = ['code', 'type', 'name', 'telephone', 'mobile', 'foundation', 'province', 'city', 'district',
   'address', 'business_licence_pic', 'business_licence_verified', 'transport_licence_pic', 'transport_licence_verified',
   'auth_pic', 'auth_verified', 'owner_idcard_pic', 'owner_idcard_verified'];
   const args = [];
   columns.forEach((c) => {
     if (c in item) {
       if (c === 'foundation') {
         args.push(new Date(item[c]));
       } else {
         args.push(item[c]);
       }
     } else {
       args.push(null);
     }
   });
   return args;
}
export default {
  getCorpCountByCreator(creatorId) {
    const sql = 'select count(corp_id) as num from sso_corps where created_user_id = ?';
    const args = [creatorId];
    return mysql.query(sql, args);
  },
  getPagedCorpsByCreator(creatorId, current, pageSize) {
    const start = (current - 1) * pageSize;
    const sql = `select corp_id as \`key\`, code, type, name, telephone, mobile, foundation, province, city, district,
      address, business_licence_pic, business_licence_verified, transport_licence_pic, transport_licence_verified,
      auth_pic, auth_verified, owner_idcard_pic, owner_idcard_verified, status from sso_corps where created_user_id = ? limit ?, ?`;
    const args = [creatorId, start, pageSize];
    return mysql.query(sql, args);
  },
  insertCorp(corp, parentCorpId, creator, status, trans) {
    const sql = `insert into sso_corps (code, type, name, telephone, mobile, foundation, province, city, district,
      address, business_licence_pic, business_licence_verified, transport_licence_pic, transport_licence_verified,
      auth_pic, auth_verified, owner_idcard_pic, owner_idcard_verified, parent_corp_id, created_user_id, status,
      created_date) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
    const args = packColumnArgs(corp);
    args.push(parentCorpId, creator, status);
    return mysql.insert(sql, args, trans);
  },
  deleteCorp(corpid, trans) {
    const sql = `delete from sso_corps where corp_id = ? or parent_corp_id = ?`;
    const args = [corpid, corpid];
    return mysql.delete(sql, args, trans);
  },
  updateCorp(corp, trans) {
    const sql = `update sso_corps set code = ?, type = ?, name = ?, telephone = ?, mobile = ?, foundation = ?, province = ?,
      city = ?, district = ?, address = ?, business_licence_pic = ?, business_licence_verified = ?, transport_licence_pic = ?,
      transport_licence_verified = ?, auth_pic = ?, auth_verified = ?, owner_idcard_pic = ?, owner_idcard_verified = ?,
      status = ? where corp_id = ?`;
    const args = packColumnArgs(corp);
    args.push(corp.status, corp.key);
    return mysql.update(sql, args, trans);
  },

  getAdminCorps() {
    const sql = `select C.corp_id as corpid, code, type, name, telephone, mobile, foundation, province, city, district,
      address, business_licence_pic, business_licence_verified, transport_licence_pic, transport_licence_verified,
      account_id as accountId, auth_pic, auth_verified, owner_idcard_pic, owner_idcard_verified, status, che, tms, app
      from sso_corps as C inner join sso_tenant as T on C.corp_id = T.corp_id where parent_corp_id = 0`;
    return mysql.query(sql);
  },
  getCorpInfo(corpId) {
    const sql = `select type, status, parent_corp_id as parentCorpId, che, tms, app from
      sso_corps as C inner join sso_tenant as T on C.corp_id = T.corp_id where C.corp_id = ? limit 1`;
    const args = [corpId];
    return mysql.query(sql, args);
  },
  getAccountCorpInfo(accountId) {
    const sql = `select corp_id as corpid, type, name, parent_corp_id as parentCorpId, status
      from sso_corps where account_id = ? limit 1`;
    const args = [accountId];
    return mysql.query(sql, args);
  },
  getEnterpriseAccountCorp(accountId) {
    const sql = `select C.corp_id as corpid, code, type, name, telephone, mobile, foundation, province, city, district,
      address, business_licence_pic, business_licence_verified, transport_licence_pic,
      transport_licence_verified, account_id as accountId, parent_corp_id as parentCorpId,
      auth_pic, auth_verified, owner_idcard_pic, owner_idcard_verified, status, che, tms, app from sso_corps as C inner
      join sso_tenant as T on C.corp_id = T.corp_id where account_id = ? limit 1`;
    const args = [accountId];
    return mysql.query(sql, args);
  },
  getBranchAccountCorp(accountId) {
    const sql = `select corp_id as corpid, code, name, telephone, mobile, foundation, province, city, district,
      address, business_licence_pic, business_licence_verified, transport_licence_pic, transport_licence_verified,
      account_id as accountId, parent_corp_id as parentCorpId, auth_pic, auth_verified, owner_idcard_pic,
      owner_idcard_verified from sso_corps where account_id = ? limit 1`;
    const args = [accountId];
    return mysql.query(sql, args);
  },
  getBranches(parentCorpId) {
    const sql = `select corp_id as corpid, code, type, name, telephone, mobile, foundation, province, city, district,
      address, business_licence_pic, business_licence_verified, transport_licence_pic, transport_licence_verified, account_id as accountId,
      auth_pic, auth_verified, owner_idcard_pic, owner_idcard_verified from sso_corps where parent_corp_id = ?`;
    const args = [parentCorpId];
    return mysql.query(sql, args);
  }
}
