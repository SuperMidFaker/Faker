/**
 * Copyright (c) 2012-2015 Qeemo Ltd. All Rights Reserved.
 */
/**
 * User: Kurten
 * Date: 2015-03-12
 * Time: 08:38
 * Version: 1.0
 * Description:
 */
const HttpStatus = {
    OK: 200,
    CREATED: 201,
    NOT_MODIFIED: 304,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOTFOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    INTERNAL_SERVER_ERROR: 500,
    NOT_IMPLEMENTED: 501,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504
};

const ErrorCode = {
    PASSWORD_NOT_VALID: 1001,
    PARAM_ERROR: 4001,
    PARAM_TYPE_ERROR: 4002,
    EXISTS: 4003,
    ACCESS_DATA_FORBIDDEN: 4030,
    HTTP_AUTH_ERROR: 4031,
    NOT_FOUND_REQUEST_URL: 4040,
    SERVER_ERROR: 5001
};

export default {
  HttpStatus,
  ErrorCode,
  /**
   * 返回ok结构的数据
   */
  ok(res, data, timestamp) {
    const obj = {
      status: HttpStatus.OK,
      timestamp: timestamp || Date.now(),
      data
    };
    if (!!res && typeof res.json === 'function') {
      return res.json(obj);
    }
    return obj;
  },
  /**
   * data   =>   返回数据
   * dataSize => 返回数据size
   * totalNum => 总数
   */
  page(res, data, dataSize, totalNum) {
    const obj = {
      status: HttpStatus.OK,
      timestamp: Date.now(),
      data,
      data_size: dataSize,
      total_num: totalNum
    };
    if (!!res && typeof res.json === 'function') {
      return res.json(obj);
    }
    return obj;
  },
  /**
   * status     =>     http status
   * errorCode  =>     具体错误代码
   * msg        =>     错误消息
   */
  error(res, status, errorCode, msg) {
    const obj = {
      status: status || HttpStatus.BAD_REQUEST,
      error_code: errorCode || ErrorCode.SERVER_ERROR,
      msg,
      timestamp: Date.now()
    };
    if (!!res && typeof res.json === 'function') {
      return res.json(obj);
    }
    return obj;
  },
  notFound(res, msg) {
    const obj = {
      status: HttpStatus.NOTFOUND,
      error_code: ErrorCode.NOT_FOUND_REQUEST_URL,
      msg: !msg ? 'not found' : msg,
      timestamp: Date.now()
    };
    if (!!res && typeof res.json === 'function') {
      return res.json(obj);
    }
    return obj;
  },
  forbidden(res) {
    const obj = {
      status: HttpStatus.FORBIDDEN,
      error_code: ErrorCode.ACCESS_DATA_FORBIDDEN,
      msg: 'Forbidden, please login first',
      timestamp: Date.now()
    };
    if (!!res && typeof res.json === 'function') {
      return res.json(obj);
    }
    return obj;
  },
  internalServerError(res, msg) {
    const obj = {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      error_code: ErrorCode.SERVER_ERROR,
      msg: msg || 'Internal Server Error',
      timestamp: Date.now()
    };
    // valid res
    if (!!res && typeof res.json === 'function') {
      return res.json(obj);
    }
    return obj;
  },

  // 请求参数
  paramError(res, msg) {
    const obj = {
      status: HttpStatus.BAD_REQUEST,
      error_code: ErrorCode.PARAM_ERROR,
      msg: msg || 'Param has Error !',
      timestamp: Date.now()
    };
    if (!!res && typeof res.json === 'function') {
      return res.json(obj);
    }
    return obj;
  },
  // 访问权限
  authError(res, msg) {
    const obj = {
      status: HttpStatus.UNAUTHORIZED,
      error_code: ErrorCode.HTTP_AUTH_ERROR,
      msg: msg || 'auth token error',
      timestamp: Date.now()
    };
    if (!!res && typeof res.json === 'function') {
      return res.json(obj);
    }
    return obj;
  }
};

export function patch(app) {
  /* eslint-disable no-param-reassign */
  app.context.json = app.response.json = function json(obj) {
    this.charset = this.charset || 'utf-8';
    this.set('Content-Type', `application/json; charset=${this.charset}`);
    this.body = JSON.stringify(obj);
  };
  /* eslint-enable no-param-reassign */
}
