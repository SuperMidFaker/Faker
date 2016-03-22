import cobody from 'co-body';
import kJwt from 'koa-jwt';
import fs from 'fs';
import path from 'path';
import Result from '../../reusable/node-util/response-result';
import mysql from '../../reusable/db-util/mysql';
import weixinDao from 'reusable/models/weixin.db';
import bCryptUtil from '../../reusable/node-util/BCryptUtil';
import config from '../../reusable/node-util/server.config';
import * as weixinOAuth from '../../reusable/node-util/weixin-oauth';

const privateKey = fs.readFileSync(path.resolve(__dirname, '..', '..', 'reusable', 'keys', 'qm.rsa'));
function *bindWxUserP() {
  const body = yield cobody(this);
  const username = body.username;
  const password = body.password;
  if (!username || !password) {
    return Result.ParamError(this, '手机号或密码为空');
  }
  try {
    const users = yield weixinDao.getUserByPhone(username);
    if (users.length > 0) {
      const user = users[0];
      const checkpwd = bCryptUtil.checkpw(password, user.password) || bCryptUtil.checkpw(bCryptUtil.md5(password), user.password);
      if (checkpwd) {
        const claims = { userId: user.id };
        const opts = Object.assign({}, config.get('jwt_crypt'), { expiresIn: config.get('jwt_expire_seconds') });
        const jwtoken = kJwt.sign(claims, privateKey, opts);
        const remember = body.remember;
        const ONE_DAY = 24 * 60 * 60;
        this.cookies.set(config.get('jwt_cookie_key'), jwtoken, {
          httpOnly : __DEV__ ? false : true,
          expires: remember ? new Date(Date.now() + config.get('jwt_expire_seconds') * 1000) : new Date(Date.now() + ONE_DAY * 1000),
          domain: !__PROD__ ? undefined : config.get('jwt_cookie_domain')
        });
        // weixin-auth mw guarantee openid exist
        const openid = weixinOAuth.getWxCookie(this.cookies).openid;
        weixinOAuth.setCookie(this.cookies, openid, user.id);
        yield weixinDao.updateAuthLoginId(openid, user.id);
        return Result.OK(this, { redirect: true, url: this.request.query.next || '/weixin/account?v=1.0' });
      }
    } else {
      return Result.NotFound(this, '用户不存在');
    }
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, e.message);
  }
}

function *wlProfileG() {
  const loginId = this.state.userId;
  try {
    const wls = yield weixinDao.getWlProfile(loginId);
    if (wls.length === 0) {
      throw new Error('user not exist');
    }
    return Result.OK(this, wls[0]);
  } catch (e) {
    return Result.InternalServerError(this, e.message);
  }
}

function *unbindWxUserP() {
  try {
    const openid = weixinOAuth.getWxCookie(this.cookies).openid;
    yield weixinDao.updateAuthLoginId(openid, -1);
    weixinOAuth.setCookie(this.cookies, undefined, undefined);
    return Result.OK(this);
  } catch (e) {
    return Result.InternalServerError(this, e.message);
  }
}

export default [
   ['post', '/public/v1/weixin/bind', bindWxUserP],
   ['get', '/v1/weixin/welogix/profile', wlProfileG],
   ['post', '/v1/weixin/unbind', unbindWxUserP]
]
