import request from 'superagent';
import moment from 'moment';
import SmsConfig from '../../config/sms.config';
import bCryptUtil from './BCryptUtil';
export default {
  sendSms(phone, code) {
    const cloopen = SmsConfig.cloopen;
    return sendSMS([phone], [code], cloopen.templateId);
  },
  sendSmsTrackingDetailMessage(phones, data) {
    return sendSMS(phones, data, '100309');
  },
};

function sendSMS(phones, datas, templateId) {
  const cloopen = SmsConfig.cloopen;
  return (done) => {
    const timestamp = moment().format('YYYYMMDDHHmmss');
    const sig = cloopen.accountSid + cloopen.authToken + timestamp;
    const sign = bCryptUtil.md5(sig);
    const url = `${cloopen.url}:${cloopen.port}/${cloopen.ver}/Accounts/${cloopen.accountSid}/SMS/TemplateSMS?sig=${sign.toUpperCase()}`;
    const auth = bCryptUtil.base64Encode(cloopen.accountSid + ':' + timestamp);
    const body = { 'to': phones.join(','), templateId,
      datas, 'appId': cloopen.appid };
    request.post(url).accept('json').set('Content-Type', 'application/json;charset=utf-8')
    .set('Authorization', auth).send(body)
    .end((err, resp) => {
      if (err) {
        done(err);
      } else {
        done(null, resp.body);
      }
    });
    // options.rejectUnauthorized = false;
  };
}
