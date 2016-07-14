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
import { _extend } from 'util';

// todo cleanup the return value status, err_code msg logic
export default {
  ok(data) {
    return {
      status: 200,
      data
    };
  },
  forbidden(obj) {
    return _extend({status: 403}, obj);
  },
  error(obj, errMsg) {
    return _extend({status: 400, err_msg: errMsg}, obj);
  },
  notFound(obj) {
    return _extend({status: 404}, obj);
  },
  not_found: {
    err_code: 40401,
    msg: 'not found your request url, maybe your request method not valid'
  },
  internal_server_error: {
    status: 500,
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
  missing_content_type: {
    err_code: 41501,
    msg: 'Content-Type is missing'
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
