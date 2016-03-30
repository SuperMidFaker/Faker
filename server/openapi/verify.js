/**
 * Copyright (c) 2012-2015 Qeemo Ltd. All Rights Reserved.
 */
/**
 * User: Kurten
 * Date: 2016-03-16
 * Time: 14:49
 * Version: 1.0
 * Description:
 */

import parse from 'co-body';
import codes from './codes';
import appDao from '../../reusable/models/app.db';

const ignores = ['/v1/token', '/v1/authorize']

export default function *apiAuth(next) {
  if (~ignores.indexOf(this.path)) {
    return yield next;
  } else {
    if (this.method === 'GET') {
      this.reqbody = this.query;
    } else {
      if (!this.header['content-type']) {
        return this.error(codes.missing_content_type);
      }
      this.reqbody = yield parse(this.req);
      if (!this.reqbody.access_token) {
        return this.forbidden(codes.access_token_not_valid);
      }
    }

    const res = yield appDao.getAuthByAccessToken(this.reqbody.access_token);
    if (res.length === 0) {
      return this.forbidden(codes.access_token_not_valid);
    }

    this.tenant_id = res[0].tenant_id;
    return yield next;
  }
}
