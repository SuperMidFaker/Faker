import renderHtml from '../htmlRender';
import weixinDao from '../../models/weixin.db';
import * as weixinOAuth from '../../util/weixin-oauth';

function *renderWxPage() {
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
  ['get', '/weixin/bind', renderWxPage],
  ['get', '/weixin/account', renderWxPage],
  ['get', '/weixin/welogix/businesss', renderBusinessPage]
];
