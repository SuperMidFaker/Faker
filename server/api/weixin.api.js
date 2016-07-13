import cobody from 'co-body';
import Result from '../util/responseResult';
import mysql from '../util/mysql';
import weixinDao from '../models/weixin.db';
import bCryptUtil from '../util/BCryptUtil';
import * as weixinOAuth from '../util/weixin-oauth';
import { genJwtCookie } from '../util/jwt-kit';

function *bindWxUserP() {
  const body = yield cobody(this);
  const username = body.username;
  const password = body.password;
  if (!username || !password) {
    return Result.paramError(this, '手机号或密码为空');
  }
  try {
    const users = yield weixinDao.getUserByPhone(username);
    if (users.length > 0) {
      const user = users[0];
      const checkpwd = bCryptUtil.checkpw(password, user.password) ||
        bCryptUtil.checkpw(bCryptUtil.md5(password), user.password);
      if (checkpwd) {
        genJwtCookie(this.cookies, user.id);
        // weixin-auth mw guarantee openid exist
        const openid = weixinOAuth.getWxCookie(this.cookies).openid;
        weixinOAuth.setCookie(this.cookies, openid, user.id);
        yield weixinDao.updateAuthLoginId(openid, user.id);
        return Result.ok(this);
      }
    } else {
      return Result.notFound(this, '用户不存在');
    }
  } catch (e) {
    console.log(e);
    return Result.internalServerError(this, e.message);
  }
}

function *wlProfileG() {
  const loginId = this.state.user.userId;
  try {
    const wls = yield weixinDao.getWlProfile(loginId);
    if (wls.length === 0) {
      throw new Error('user not exist');
    }
    return Result.ok(this, wls[0]);
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *unbindWxUserP() {
  try {
    const openid = weixinOAuth.getWxCookie(this.cookies).openid;
    yield weixinDao.updateAuthLoginId(openid, -1);
    weixinOAuth.setCookie(this.cookies, openid, undefined);
    return Result.ok(this);
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

export default [
   ['post', '/public/v1/weixin/bind', bindWxUserP],
   ['get', '/v1/weixin/welogix/profile', wlProfileG],
   ['post', '/v1/weixin/unbind', unbindWxUserP],
];
