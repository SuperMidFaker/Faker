import mysql from '../util/mysql';
import { STRING, INTEGER, DATE, TEXT, NOW } from 'sequelize';
import sequelize from './sequelize';

export default {
  upsertAuth(openid, unionid, accToken, expiresIn, refreshToken, createdAt) {
    const sql = `insert into sso_weixin_auth (openid, access_token, unionid,
      expires_in, refresh_token, created_date) values (?) on duplicate key update
      access_token = ?, unionid = ?, expires_in = ?, refresh_token = ?, created_date = ?`;
    const args = [
      [openid, accToken, unionid, expiresIn, refreshToken, createdAt],
      accToken, unionid, expiresIn, refreshToken, createdAt,
    ];
    return mysql.insert(sql, args);
  },
  getUserByPhone(phone) {
    const sql = 'select id, password, username from sso_login where phone = ? limit 1';
    const args = [phone];
    return mysql.query(sql, args);
  },
  getAuthUser(openid) {
    const sql = 'select login_id as loginId from sso_weixin_auth where openid = ?';
    const args = [openid];
    return mysql.query(sql, args);
  },
  getWlProfile(loginId) {
    const sql = `select name, phone, email, position from sso_tenant_users as TU inner join
      (select id, phone, email from sso_login where id = ?) as L on TU.login_id = L.id`;
    const args = [loginId];
    return mysql.query(sql, args);
  },
  updateAuthLoginId(openid, loginId) {
    const sql = 'update sso_weixin_auth set login_id = ? where openid = ?';
    const args = [loginId, openid];
    return mysql.update(sql, args);
  },
};

export const WeixinUser = sequelize.define('sso_weixin_auth', {
  openid: {
    type: STRING,
    primaryKey: true,
  },
  access_token: STRING,
  expires_in: INTEGER,
  refresh_token: STRING,
  login_id: INTEGER,
  unionid: STRING,
  created_date: DATE,
}, {
  freezeTableName: true,
});
