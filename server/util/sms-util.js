import request from 'superagent';
import moment from 'moment';
import SmsConfig from './sms.config';
import bCryptUtil from './BCryptUtil';
export default {
  sendSms(phone, code) {
    const cloopen = SmsConfig.cloopen;
    return (done) => {
      if (!__DEV__) {
        return done(null, { data: true });
      }
      const timestamp = moment().format('YYYYMDHmss');
      console.log('timestamp', timestamp);
      const sig = cloopen.accountSid + cloopen.authToken + timestamp;
      const sign = bCryptUtil.md5(sig);
      const url = `${cloopen.url}:${cloopen.port}/${cloopen.ver}/Accounts/${cloopen.accountSid}/SMS/TemplateSMS?sig=${sign.toUpperCase()}`;
      const auth = bCryptUtil.base64Encode(cloopen.accountSid + ':' + timestamp);
      const body = {'to': phone, 'templateId': cloopen.templateId,
        'datas': [code], 'appId': cloopen.appid};
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
    }
  }
}

