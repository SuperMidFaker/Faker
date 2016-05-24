import mysql from '../util/mysql';
export default {
  getUserByAccount(account, code) {
    const sql = `SELECT id, username, phone, email, password, unid FROM sso_login WHERE phone = ?
      OR username = ? OR email = ? AND disabled = 0 LIMIT 1`;
    const args = [account, account + '@' + code, account];
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
  insertAccount(username, email, phone, salt, pwdHash, unid, trans) {
    const sql = `insert into sso_login(username, email, phone, salt, password, created_date, unid)
      values (?, ?, ?, ?, ?, NOW(), ?)`;
    const args = [username, email, phone, salt, pwdHash, unid];
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
  updateUserProfile(lid, phone, avatar, name, email, trans) {
    const sql = 'update sso_login set phone = ?, avatar = ?, username = ?, email = ? where id = ?';
    const args = [phone, avatar, name, email, lid];
    return mysql.update(sql, args, trans);
  }
}
