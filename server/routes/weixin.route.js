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
  this.body = 'user ' + weixinOAuth.getLoginIdFrom(this.cookies) + ' ' + weixinOAuth.getOpenIdBy(this.cookies);
}

function *renderBusinessPage() {
}

export default [
  ['get', '/weixin/account', redirectMPAccount],
  ['get', '/weixin/bind', renderBindPage],
  ['get', '/weixin/welogix/account', renderWxAccountPage],
  ['get', '/weixin/welogix/businesss', renderBusinessPage]
]
