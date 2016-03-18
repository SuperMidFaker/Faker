/**
 * Copyright (c) 2012-2016 Qeemo Ltd. All Rights Reserved.
 */
/**
 * User: Kurten
 * Date: 2016-03-17
 * Time: 16:52
 * Version: 1.0
 * Description:
 */
import util from 'util';

export default {
  ok(data) {
    return {
      status: 200,
      data
    };
  },
  frobidden(obj) {
    return util._extend({status: 403}, obj);
  },
  error(obj) {
    return util._extend({status: 400}, obj);
  },
  internal_server_error: {
    err_code: 50001,
    msg: 'internal server error, maybe your request params not valid'
  },
  access_token_not_valid: {
    err_code: 40301,
    msg: 'access_token is not valid'
  },
  appid_secret_not_valid: {
    err_code: 40302,
    msg: 'appid or app_secret is not valid'
  },
  grant_type_not_valid: {
    err_code: 40302,
    msg: 'grant_type is not valid'
  },
  params_error: {
    err_code: 40001,
    msg: 'parameters is not valid'
  },
  Statuses: {
    200: 'OK',
    400: 'Bad Request',
    403: 'Forbidden',
    500: 'Internal Server Error'
  }
};
