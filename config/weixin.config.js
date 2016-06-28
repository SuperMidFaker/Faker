const config = new Map();

config.set('APP_ID', 'wx07781f4171259039');
config.set('APP_SECRET', 'a414f1733cabc1e24cb262a6761eb4e0');
config.set('COOKIE_WX_KEY', 'wx-key');
config.set('MP_OAUTH2_URL', 'https://open.weixin.qq.com/connect/oauth2/authorize');
config.set('ACCESS_TOKEN_URL', 'https://api.weixin.qq.com/sns/oauth2/access_token');
config.set('REFRESH_TOKEN_URL', 'https://api.weixin.qq.com/sns/oauth2/refresh_token');
config.set('SNS_USER_URL', 'https://api.weixin.qq.com/sns/userinfo');
config.set('WX_DOMAIN', 'https://wx.welogix.cn');

export default config;
