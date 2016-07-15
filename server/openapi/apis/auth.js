/**
 * Copyright (c) 2012-2016 Qeemo Ltd. All Rights Reserved.
 */
/**
 * User: Kurten
 * Date: 2016-03-17
 * Time: 11:22
 * Version: 1.0
 * Description:
 */
import parse from 'co-body';
import util from 'util';


import appDao from '../../models/app.db';
import codes from '../codes';
import bcrypt from '../../util/BCryptUtil';

const KEY = 'lkasdjo9q23u54120934il.mZD;fljopwu2-341';
const DEFAULT_INTERVAL = 2592000;  // one month seconds

function genToken(appid, appSecret, ip) {
  const s = util.format('%s%s%s%s%s', appid, Date.now(), appSecret, KEY, ip);
  const atoken = bcrypt.hashs(s);
  const refreshToken = bcrypt.hashs(util.format('%s%s%s%s', atoken, Date.now(), KEY, ip), 'sha1');

  return {
    access_token: atoken,
    refresh_token: refreshToken,
    expires_in: DEFAULT_INTERVAL,
  };
}

function *token() {
  const b = yield parse(this.req);
  if (b.grant_type === 'client_credential') {
    let res = yield appDao.getAppInfo(b.appid, b.app_secret);
    if (res.length === 0) {
      return this.forbidden(codes.appid_secret_not_valid);
    }
    const app = res[0];
    const ip = this.ip || '127.0.0.1';
    const t = genToken(b.appid, b.app_secret, ip);
    res = yield appDao.getAuthByAppid(b.appid, b.app_secret);
    if (res.length === 0) {
      yield appDao.addAuth(util._extend({
        appid: b.appid,
        app_secret: b.app_secret,
        tenant_id: app.tenant_id,
        ip,
      }, t));
    } else {
      yield appDao.updateAuth(util._extend({
        appid: b.appid,
        app_secret: b.app_secret,
        tenant_id: app.tenant_id,
        ip,
      }, t));
    }

    return this.json(t);
  }
  return this.forbidden(codes.grant_type_not_valid);
}

function *authorize() {

}


export default [
  ['post', '/token', token, 'generate_token_url'],
  ['post', '/authorize', authorize, 'grant_authorization_url'],
];
