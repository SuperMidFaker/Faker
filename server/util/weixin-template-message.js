import weixinConfig from '../../config/weixin.config';
import superagent from 'superagent';

function sendTemplateMessage(data) {
  return superagent.post(weixinConfig.get('CGI_TEMPLATE_MESSAGE_URL')).query({
    access_token: weixinConfig.get('ACCESS_TOKEN'),
  }).send(data);
}

export function sendNewShipMessage(data){
  const data2post = {
    touser: data.openid,
    template_id: "JXWVBqh7JNxMTKCmF1kwrmd7z0epATApDIbaMOdHB8g",
    url: `${weixinConfig.get('WX_DOMAIN')}/weixin${data.url}`,
    data:{
      first: {
        value: data.first||'',
        color: "#000"
      },
      keyword1:{
        value: data.shipmt_no,
        color: "#000"
      },
      keyword2: {
        value: data.time,
        color: "#000"
      },
      keyword3: {
        value: data.status,
        color: "#000"
      },
      keyword4: {
        value: data.consigner_city,
        color: "#000"
      },
      keyword5: {
        value: data.consignee_city,
        color: "#000"
      },
      remark:{
        value: data.remark,
        color: "#000"
      }
    }
  };
  return sendTemplateMessage(data2post);
}
