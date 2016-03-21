import request from 'superagent';
import renderHtml from '../../universal/html-render';
import weixinDao from 'reusable/models/weixin.db';
import * as weixinOAuth from '../../reusable/node-util/weixin-oauth';

// onEnter business page
// openid loadWeixinAuth
// jwtkey redirect to bind
// todo loginid not exist redirect to bind page
// expire -> refresh token auto

function *redirectMPAccount() {
  const loginId = weixinOAuth.getLoginIdFrom(this.cookies);
  if (loginId > 0) {
    // 已绑定可以申请解绑
    this.redirect('/weixin/welogix/account');
  } else {
    this.redirect('/weixin/bind');
  }
}
function *redirectMPOAuth() {
  const ua = this.request.get('user-agent');
  const isWeixin = ua.match(/MicroMessenger/i) === "micromessenger";
  console.log(isWeixin, ua);
  const openid = weixinOAuth.getWxCookie(this.cookies);
  if (!openid) {
    const query = this.request.query;
    const wxUrlCode = query.code;
    // 未登录
    const resp = yield weixinOAuth.getWebAccessToken(request, wxUrlCode);
    // todo resp.body err_code
    // todo getweixinuserinfo for unionid
    yield weixinDao.upsertAuth(
      resp.body.openid, resp.body.access_token,
      resp.body.expires_in, resp.body.refresh_token,
      new Date()
    );
    weixinOAuth.setCookie(this.cookies, openid);
    this.redirect('/weixin/bind');
  } else {
    this.redirect('/weixin/welogix/account');
  }
}

function *renderBindPage() {
  try {
    this.body = yield renderHtml(this.request);
  } catch (e) {
    console.log('wewms plain render cause ', e, e.stack);
    if (e.length === 2 && e[0] === 301) {
      this.redirect(e[1].pathname + e[1].search);
    }
  }
}

function *renderBusinessPage() {
}

export default [
  ['get', '/weixin/account', redirectMPAccount],
  ['get', '/weixin/oauth', redirectMPOAuth],
  ['get', '/weixin/bind', renderBindPage],
  ['get', '/weixin/welogix/account', renderBindPage],
  ['get', '/weixin/welogix/businesss', renderBusinessPage]
]
