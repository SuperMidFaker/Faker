import superagent from 'superagent';
import weixinDao from '../models/weixin.db';
import * as weixinOAuth from '../util/weixin-oauth';
import { genJwtCookie } from '../util/jwt-kit';

export default () => {
  return function *weixinMPAuthMw(next) {
    const ua = this.request.get('user-agent');
    const isWeixin = ua.match(/MicroMessenger/i) === 'micromessenger';
    if (!isWeixin && !weixinOAuth.isWxAccessUrl(this.request.url)) {
      yield next;
      return;
    }
    const wxcookie = weixinOAuth.getWxCookie(this.cookies);
    const wxUrlCode = this.request.query.code;
    let openid = wxcookie.openid;
    if (!openid && !wxUrlCode) {
      // 认为是第一次访问,跳转至公众号授权地址, 返回为请求地址
      this.redirect(weixinOAuth.genCodeUrl(this.request.path));
    } else {
      if (!openid) {
        // 微信授权返回,根据code获取openid/access_token
        try {
          const resp = yield weixinOAuth.getWebAccessToken(superagent, wxUrlCode);
          const body = JSON.parse(resp.text);
          if (body.errcode !== undefined && body.errcode !== 0) {
            throw new Error(`An error happened requesting weixin api: ${body.errmsg}`);
          }
          openid = body.openid;
          yield weixinDao.upsertAuth(
            openid, body.unionid, body.access_token,
            body.expires_in, body.refresh_token, new Date()
          );
          // bind page will have openid cookie when make ajax
          weixinOAuth.setCookie(this.cookies, openid, wxcookie.loginId);
        } catch (e) {
          this.throw(403, {
            msg: e.message
          });
        }
      }
      let loginId = wxcookie.loginId;
      if ((loginId === undefined || loginId <= 0) && this.request.path !== '/weixin/bind') {
        try {
          const wus = yield weixinDao.getAuthUser(openid);
          if (wus.length === 1 && wus[0].loginId > 0) {
            loginId = wus[0].loginId;
            genJwtCookie(this.cookies, loginId);
            weixinOAuth.setCookie(this.cookies, openid, loginId);
            this.redirect(this.request.path); // 使用新cookie重新请求页面
          } else {
            // 用户不存在,需登录绑定
            this.redirect(`/weixin/bind?next=${encodeURIComponent(this.request.path)}`);
          }
        } catch (e) {
          this.throw(403, {
            msg: e.message
          });
        }
      } else {
        yield next;
      }
    }
  };
}
