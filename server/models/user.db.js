import mysql from '../../reusable/db-util/mysql';
export default {
  getUserByAccount(account) {
    const sql = `SELECT account_id, username, phone, email, user_type, password, unid FROM sso_accounts WHERE phone = ?
      OR username = ? OR email = ? AND disabled = 0 LIMIT 1`;
    const args = [account, account, account];
    return mysql.query(sql, args);
  },
  getUserByPhone(phone) {
    const sql = `select account_id, phone from sso_accounts where phone = ? and disabled = 0 limit 1`;
    const args = [phone];
    return mysql.query(sql, args);
  },
  getUserById(accountId) {
    const sql = 'select password from sso_accounts where account_id = ? limit 1';
    const args = [accountId];
    return mysql.query(sql, args);
  },
  updatePassword(salt, pwdHash, userId) {
    const sql = 'update sso_accounts set salt = ?, password = ? where account_id = ?';
    const args = [salt, pwdHash, userId];
    return mysql.update(sql, args);
  },
  insertAccount(phone, salt, pwdHash, userType, unid, trans) {
    const sql = `insert into sso_accounts(phone, salt, password, user_type, created_date, unid)
      values (?, ?, ?, ?, NOW(), ?)`;
    const args = [phone, salt, pwdHash, userType, unid];
    return mysql.insert(sql, args, trans);
  },
  deleteAccounts(accounts, trans) {
    const sql = `delete from sso_accounts where account_id in (?)`;
    const args = [accounts];
    return mysql.delete(sql, args, trans);
  },
  deleteAccount(accountId, trans) {
    const sql = 'delete from sso_accounts where account_id = ?';
    const args = [accountId];
    return mysql.delete(sql, args, trans);
  },
  updatePhone(accountId, phone, trans) {
    const sql = 'update sso_accounts set phone = ? where account_id = ?';
    const args = [phone, accountId];
    return mysql.update(sql, args, trans);
  },
  getAccountInfo(accountId) {
    const sql = 'select name, corp_id as corpId, parent_corp_id as parentCorpId from sso_corp_accounts where account_id = ?';
    const args = [accountId];
    return mysql.query(sql, args);
  },
  insertCorpAdmin(username, accountId, corpId, parentCorpId, creator, trans) {
    const sql = `insert into sso_corp_accounts(corp_id, parent_corp_id, account_id, name, is_admin, created_user_id,
      corp_link, created_date) values (?, ?, ?, ?, true, ?, true, NOW())`;
    const args = [corpId, parentCorpId, accountId, username, creator];
    return mysql.insert(sql, args, trans);
  },
  getCorpAccountId(corpId) {
    const sql = 'select account_id as accountId from sso_corp_accounts where corp_id = ? and corp_link = 1';
    const args = [corpId];
    return mysql.query(sql, args);
  },
  getCorpUserIds(corpId) {
    const sql = 'select account_id as accountId from sso_corp_accounts where corp_id = ? or parent_corp_id = ?';
    const args = [corpId, corpId];
    return mysql.query(sql, args);
  },
  deleteCorpUsers(corpId, trans) {
    const sql = 'delete from sso_corp_accounts where corp_id = ? or parent_corp_id = ?';
    const args = [corpId, corpId];
    return mysql.delete(sql, args, trans);
  },
  getCorpPersonnelCount(creator) {
    const sql = `select count(id) as num from sso_corp_accounts where created_user_id = ?`;
    const args = [creator];
    return mysql.query(sql, args);
  },
  getPagedPersonnelInCorp(createdUserid, current, pageSize) {
    const sql = `select id as \`key\`, A.account_id as accountId, phone, name, department, position, is_admin as isAdmin from
      sso_corp_accounts as CA inner join sso_accounts as A on CA.account_id = A.account_id where created_user_id = ?
      limit ?, ?`;
    const args = [createdUserid, (current - 1) * pageSize, pageSize];
    return mysql.query(sql, args);
  },
  insertPersonnel(createUserid, accountId, personnel, trans) {
    const sql = `insert into sso_corp_accounts(corp_id, parent_corp_id, account_id, name, department, position,
      created_user_id, created_date) values (?, ?, ?, ?, ?, ?, ?, NOW())`;
    const args = [personnel.corpId, personnel.parentCorpId, accountId, personnel.name,
      personnel.department, personnel.position, createUserid];
    return mysql.insert(sql, args, trans);
  },
  updatePersonnel(p, trans) {
    const sql = `update sso_corp_accounts set name = ?, department = ?, position = ? where id = ?`;
    const args = [p.name, p.department, p.position, p.id];
    return mysql.update(sql, args, trans);
  },
  deletePersonnel(pid, trans) {
    const sql = 'delete from sso_corp_accounts where id = ?';
    const args = [pid];
    return mysql.delete(sql, args, trans);
  },

  getPersonnelInfo(accountId) {
    const sql = `select A.account_id as accountId, phone, name, department, position from sso_corp_accounts as CA
      inner join sso_accounts as A on A.account_id = CA.account_id where CA.account_id = ?`;
    const args = [accountId];
    return mysql.query(sql, args);
  },
  getPersonnelCorpInfo(accountId) {
    const sql = `select A.account_id as accountId, A.user_type as userType, name, corp_id as corpId,
      parent_corp_id as parentCorpId from sso_corp_accounts as CA inner join sso_accounts as A
      on A.account_id = CA.created_user_id where CA.account_id = ?`;
    const args = [accountId];
    return mysql.query(sql, args);
  }
}
