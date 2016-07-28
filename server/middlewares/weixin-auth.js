import superagent from 'superagent';

function isWxAccessUrl(url) {
  return url.indexOf('/weixin') === 0;
}
// 微信公众平台页面访问对openid与loginid的中间处理
export default () =>
  function* weixinMPAuthMw(next) {
    yield next;
    if (!isWxAccessUrl(this.request.url)) {
      yield next;
      return;
    }
    const authRes = yield superagent.get(`${API_ROOTS.default}public/v1/weixin/auth`)
      .set('cookie', this.header.cookie || '')
      .query({ code: this.request.query.code, url: this.request.path });
    const result = authRes.body.data;
    if (result.code === 'unauthed') {
      // 认为是第一次访问,跳转至公众号授权地址, 返回为请求地址
      this.redirect(result.redirectUrl);
    } else if (result.code === 'exceptional') {
      this.throw(403, {
        msg: result.message,
      });
    } else {
      const cookie = authRes.header['set-cookie'];
      this.append('Set-Cookie', cookie);
      if (result.code === 'rebind') {
        // 用户不存在,需登录绑定
        this.redirect(`/weixin/bind?next=${encodeURIComponent(this.request.path)}`);
      } else if (result.code === 'resend') {
        this.redirect(this.request.path); // 使用新cookie重新请求页面
      } else {
        yield next;
      }
    }
  };
