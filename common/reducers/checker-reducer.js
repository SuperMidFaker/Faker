import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
import messages from 'common/message.i18n';
const actionTypes = createActionTypes(
  '@@welogix/reusable/checker/',
  ['CHECK_LOGINNAME', 'CHECK_LOGINNAME_SUCCEED', 'CHECK_LOGINNAME_FAIL']
);

export function checkLoginName(loginName, loginId, tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CHECK_LOGINNAME, actionTypes.CHECK_LOGINNAME_SUCCEED, actionTypes.CHECK_LOGINNAME_FAIL],
      endpoint: 'v1/user/check/loginname',
      method: 'get',
      params: { loginName, loginId, tenantId },
    },
  };
}

export function isLoginNameExist(
  name, code, loginId, tenantId, callback, message,
  checkerDispatchFn, formatFn
) {
  if (!name) {
    return callback(new Error(formatFn(messages, 'userNameRequired')));
  }
  if (name.indexOf('@') >= 0) {
    return callback(new Error(formatFn(messages, 'userNameNoSymbolAt')));
  }
  // 判断主租户下用户名是否重复
  checkerDispatchFn(`${name}@${code}`, loginId, tenantId).then((result) => {
    if (result.error) {
      message.error(result.error.message, 10);
      callback();
    } else if (result.data.exist) {
      callback(new Error(formatFn(messages, 'userNameExist')));
    } else {
      callback();
    }
  });
}
