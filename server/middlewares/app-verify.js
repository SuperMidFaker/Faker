import appDao from '../models/app.db';

export default () => {
  const middleware = function *verifyAppToken(next) {
    const appId = this.request.query.app_id;
    const appSecret = this.request.query.app_secret;
    if (!(appId && appSecret)) {
      return yield* next;
    }
    let result;
    try {
      result = yield appDao.getAppInfo(appId, appSecret);
    } catch (e) {
      this.throw(402, {
        code: 5002,
        msg: '获取app信息失败:' + e.message,
      });
    }
    if (result && result.length > 0) {
      this.skipJwt = true;
      this.app = {
        corpId: result[0].corp_id,
        tenantId: result[0].tenant_id,
      };
      yield next;
    } else {
      this.throw(402, {
        code: 5003,
        msg: 'app未授权',
      });
    }
  };
  return middleware;
};
