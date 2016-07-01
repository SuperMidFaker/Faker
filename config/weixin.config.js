const config = new Map();
import superagent from 'superagent';
const env = process.env.NODE_ENV = (process.env.NODE_ENV || 'development').trim();

config.set('APP_ID', 'wx07781f4171259039');
config.set('APP_SECRET', 'a414f1733cabc1e24cb262a6761eb4e0');
config.set('COOKIE_WX_KEY', 'wx-key');
config.set('MP_OAUTH2_URL', 'https://open.weixin.qq.com/connect/oauth2/authorize');
config.set('ACCESS_TOKEN_URL', 'https://api.weixin.qq.com/sns/oauth2/access_token');
config.set('REFRESH_TOKEN_URL', 'https://api.weixin.qq.com/sns/oauth2/refresh_token');
config.set('SNS_USER_URL', 'https://api.weixin.qq.com/sns/userinfo');
config.set('WX_DOMAIN', 'https://wx.welogix.cn');
config.set('CGI_TICKET_URL', 'https://api.weixin.qq.com/cgi-bin/ticket/getticket');
config.set('CGI_TOKEN_URL', 'https://api.weixin.qq.com/cgi-bin/token');
config.set('CGI_TEMPLATE_MESSAGE_URL', 'https://api.weixin.qq.com/cgi-bin/message/template/send');
config.set('ACCESS_TOKEN', '');
config.set('JSAPI_TICKET', '');

if (env === 'production') {
	getAccessToken();
	setInterval(getAccessToken, 7200*1000);
}

function getAccessToken()
{
  superagent.get(config.get('CGI_TOKEN_URL')).query({
    grant_type: 'client_credential',
    appid: config.get('APP_ID'),
    secret: config.get('APP_SECRET'),
  }).end(function(err, res){
    if (!err && res.body.access_token) {
      config.set('ACCESS_TOKEN', res.body.access_token);
      getJsapiTicket(res.body.access_token);
    } else {
      setTimeout(() => {
        getAccessToken()
      }, 30*1000);
    }
  });
}

function getJsapiTicket(accessToken)
{
  superagent.get(config.get('CGI_TICKET_URL')).query({
    access_token: accessToken,
    type: 'jsapi',
  }).end(function(err, res){
    if (!err && res.body.ticket) {
      config.set('JSAPI_TICKET', res.body.ticket);
    } else {
      setTimeout(() => {
        getJsapiTicket(accessToken);
      }, 30*1000);
    }
  });
}

export default config;
