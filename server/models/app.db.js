import mysql from '../db-util/mysql';

export default {
  getAppInfo(appId, appSecret) {
    const sql = 'select * from m_app where appid = ? and app_secret = ?';
    const args = [appId, appSecret];
    return mysql.query(sql, args);
  },
  getAuthByAccessToken(token) {
    return mysql.query('select * from m_app_auth where access_token = ?', [token]);
  },
  getAuthByAppid(appid, appSecret) {
    return mysql.query('select * from m_app_auth where appid = ? and app_secret = ?', [appid, appSecret]);
  },
  addAuth(a) {
    const sql = 'insert into m_app_auth(appid, app_secret, type, access_token, expires_in, refresh_token, ip, tenant_id, created_date) values (?, ?, ?, ?, ?, ?, ?, ?, NOW())';
    const args = [a.appid, a.app_secret, a.type || 0, a.access_token, (a.expires_in * 1000 + Date.now()), a.refresh_token, a.ip, a.tenant_id];
    return mysql.insert(sql, args);
  },
  updateAuth(a) {
    const sql = 'update m_app_auth set type = ?, access_token = ?, expires_in = ?, refresh_token = ?, ip = ?, updated_date = NOW() where appid = ? and app_secret = ?';
    const args = [a.type || 0, a.access_token, (a.expires_in * 1000 + Date.now()), a.refresh_token, a.ip, a.appid, a.app_secret];
    return mysql.update(sql, args);
  }
};
