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
  const openid = weixinOAuth.getOpenIdBy(this.cookies);
  if (!openid) {
    return Result.ParamError(this, '请在微信客户端访问');
  }
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
        weixinOAuth.setCookie(this.cookies, openid, user.id);
        yield weixinDao.updateAuthLoginId(openid, user.id);
        Result.OK(this, { code: 302, url: '/weixin/welogix/account' });
      }
    } else {
      return Result.NotFound(this, '用户不存在');
    }
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, e.message);
  }
}

export default [
   ['post', '/public/v1/weixin/bind', bindWxUserP],
]
