import mysql from '../../reusable/db-util/mysql';
export default {
  getUserByAccount(account, code) {
    const sql = `SELECT id, username, phone, email, user_type, password, unid FROM sso_login WHERE phone = ?
      OR username = ? OR email = ? AND disabled = 0 LIMIT 1`;
    const args = [account, /* account + '@' + code */account, account];
    return mysql.query(sql, args);
  },
  getUserByPhone(phone) {
    const sql = `select id, phone from sso_login where phone = ? and disabled = 0 limit 1`;
    const args = [phone];
    return mysql.query(sql, args);
  },
  getUserById(accountId) {
    const sql = 'select password from sso_login where id = ? limit 1';
    const args = [accountId];
    return mysql.query(sql, args);
  },
  updatePassword(salt, pwdHash, userId) {
    const sql = 'update sso_login set salt = ?, password = ? where id = ?';
    const args = [salt, pwdHash, userId];
    return mysql.update(sql, args);
  },
  insertAccount(username, email, phone, salt, pwdHash, userType, unid, trans) {
    const sql = `insert into sso_login(username, email, phone, salt, password, user_type, created_date, unid)
      values (?, ?, ?, ?, ?, ?, NOW(), ?)`;
    const args = [username, email, phone, salt, pwdHash, userType, unid];
    return mysql.insert(sql, args, trans);
  },
  deleteAccounts(accounts, trans) {
    const sql = `delete from sso_login where id in (?)`;
    const args = [accounts];
    return mysql.delete(sql, args, trans);
  },
  deleteAccount(accountId, trans) {
    const sql = 'delete from sso_login where id = ?';
    const args = [accountId];
    return mysql.delete(sql, args, trans);
  },
  updatePhone(accountId, phone, trans) {
    const sql = 'update sso_login set phone = ? where id = ?';
    const args = [phone, name, accountId];
    return mysql.update(sql, args, trans);
  },
  updateLoginName(lid, phone, name, email, trans) {
    const sql = 'update sso_login set phone = ?, username = ?, email = ? where id = ?';
    const args = [phone, name, email, lid];
    return mysql.update(sql, args, trans);
  },
  getAccountInfo(accountId) {
    const sql = 'select name, corp_id as corpId, parent_corp_id as parentCorpId from sso_corp_accounts where id = ?';
    const args = [accountId];
    return mysql.query(sql, args);
  },
  insertCorpAdmin(username, accountId, corpId, parentCorpId, creator, trans) {
    const sql = `insert into sso_corp_accounts(corp_id, parent_corp_id, id, name, is_admin, created_user_id,
      corp_link, created_date) values (?, ?, ?, ?, true, ?, true, NOW())`;
    const args = [corpId, parentCorpId, accountId, username, creator];
    return mysql.insert(sql, args, trans);
  },
  getCorpAccountId(corpId) {
    const sql = 'select id as accountId from sso_corp_accounts where corp_id = ? and corp_link = 1';
    const args = [corpId];
    return mysql.query(sql, args);
  },
  getCorpUserIds(corpId) {
    const sql = 'select id as accountId from sso_corp_accounts where corp_id = ? or parent_corp_id = ?';
    const args = [corpId, corpId];
    return mysql.query(sql, args);
  },

  getPersonnelInfo(accountId) {
    const sql = `select A.id as accountId, phone, name, department, position from sso_corp_accounts as CA
      inner join sso_login as A on A.id = CA.id where CA.id = ?`;
    const args = [accountId];
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
