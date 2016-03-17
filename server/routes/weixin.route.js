import request from 'superagent';
import renderHtml from '../../universal/html-render';
import weixinDao from '../models/weixin.db';
import weixinOAuth from '../../reusable/node-util/weixin-oauth';

// onEnter bind
// wxcode
//
// onEnter business page
// openid loadWeixinAuth
// expire -> refresh token auto

function *redirectMpOAuth() {
  const query = this.request.query;
  const wxUrlCode = query.code;
  if (wxUrlCode === '') {
    // 未通过微信公众号授权
    this.redirect(weixinOAuth.genCodeUrl('/weixin/oauth'));
  } else {
    const openid = weixinOAuth.getOpenIdBy(this.cookies);
    if (openid === '') {
      // 未登录
      const resp = yield weixinOAuth.getAccessToken(request, wxUrlCode);
      // todo getweixinuserinfo for unionid
      yield weixinDao.upsertAuth(
        resp.openid, resp.access_token,
        resp.expires_in, resp.refresh_token,
        new Date()
      );
      this.redirect('/weixin/bind');
    } else {
      // 已绑定可以申请解绑
      this.redirect('/weixin/unbind');
    }
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

export default [
  ['get', '/weixin/oauth', redirectMpOAuth],
  ['get', '/weixin/bind', renderBindPage]
]
