import renderHtml from '../../universal/html-render';
import weixinDao from 'reusable/models/weixin.db';
import * as weixinOAuth from '../../reusable/node-util/weixin-oauth';

// onEnter business page
// expire -> refresh token auto

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

function *renderWxAccountPage() {
  const wxcookie = weixinOAuth.getWxCookie(this.cookies);
  this.body = 'user ' + wxcookie.loginId + ' ' + wxcookie.openid;
}

function *renderBusinessPage() {
}

export default [
  ['get', '/weixin/bind', renderBindPage],
  ['get', '/weixin/account', renderWxAccountPage],
  ['get', '/weixin/welogix/businesss', renderBusinessPage]
]
