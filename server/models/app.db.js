import mysql from '../db-util/mysql';

export default {
  getAppInfo(appId, appSecret) {
    const sql = 'select * from m_app where appid = ? and app_secret = ?';
    const args = [appId, appSecret];
    return mysql.query(sql, args);
  }
}
