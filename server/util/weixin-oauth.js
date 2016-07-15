import weixinConfig from '../../config/weixin.config';

export function isWxAccessUrl(url) {
  return url.indexOf('/weixin') === 0;
}

export function getWxCookie(cookies) {
  const wxjson = cookies.get(weixinConfig.get('COOKIE_WX_KEY'));
  let wxcookie = {};
  if (wxjson) {
    const body = new Buffer(wxjson, 'base64').toString('utf8');
    wxcookie = JSON.parse(body);
  }
  return wxcookie;
}

export function setCookie(cookies, openid, loginId) {
  const json = JSON.stringify({ openid, loginId });
  cookies.set(weixinConfig.get('COOKIE_WX_KEY'), new Buffer(json).toString('base64'));
}

export function genCodeUrl(backUrl, state) {
  const authUrl = weixinConfig.get('MP_OAUTH2_URL');
  const appId = weixinConfig.get('APP_ID');
  const redirectUrl = `${weixinConfig.get('WX_DOMAIN')}${backUrl}`;
  return `${authUrl}?appid=${appId}&redirect_uri=${encodeURIComponent(redirectUrl)}&response_type=code&scope=snsapi_userinfo&state=${state || ''}#wechat_redirect`;
}

export function getWebAccessToken(request, code) {
  return request.get(weixinConfig.get('ACCESS_TOKEN_URL')).query({
    appid: weixinConfig.get('APP_ID'),
    secret: weixinConfig.get('APP_SECRET'),
    code,
    grant_type: 'authorization_code',
  });
}

// expire -> refresh token if access_token is used outside middleware
export function refreshAccessToken(request, refreshToken) {
  /*
   * {
   *    "access_token":"ACCESS_TOKEN",
   *    "expires_in":7200,
   *    "refresh_token":"REFRESH_TOKEN",
   *    "openid":"OPENID",
   *    "scope":"SCOPE"
   * }
   */
  return request.get(weixinConfig.get('REFRESH_TOKEN_URL')).query({
    appid: weixinConfig.get('APP_ID'),
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  });
}

export function getSnsUserInfo(request, accessToken, openid) {
  return request.get(weixinConfig.get('SNS_USER_URL')).query({
    access_token: accessToken,
    openid,
    lang: 'zh_CN',
  });
}
