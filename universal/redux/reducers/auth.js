import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { CPD_LOAD_FAIL } from './corp-domain';
import { ACC_LOAD_SUCCEED } from './account';
const LOGIN = '@@qm-auth/auth/LOGIN';
const LOGIN_SUCCEED = '@@qm-auth/auth/LOGIN_SUCCEED';
const LOGIN_FAIL = '@@qm-auth/auth/LOGIN_FAIL';
const INPUT_CHANGE = '@@qm-auth/auth/INPUT_CHANGE';
const LEAVE_FORGOT_PAGE = '@@qm-auth/auth/LEAVE_FORGOT_PAGE';
const ENTER_FORGOT_PAGE = '@@qm-auth/auth/ENTER_FORGOT_PAGE';
const SMS_REQUEST = '@@qm-auth/auth/SMS_REQUEST';
const SMS_REQUEST_SUCCEED = '@@qm-auth/auth/SMS_REQUEST_SUCCEED';
const SMS_REQUEST_FAIL = '@@qm-auth/auth/SMS_REQUEST_FAIL';
const SMS_VERIFY = '@@qm-auth/auth/SMS_VERIFY';
const SMS_VERIFY_SUCCEED = '@@qm-auth/auth/SMS_VERIFY_SUCCEED';
const SMS_VERIFY_FAIL = '@@qm-auth/auth/SMS_VERIFY_FAIL';
const initialState = {
  username: '',
  password: '',
  remember: false,
  loggingIn: false,
  isAuthed: false,
  verified: false,
  nonTenant: false,
  smsId: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        isAuthed: false,
        loggingIn: true
      };
    case LOGIN_SUCCEED: {
      const userType = action.result.data && action.result.data.userType;
      return {
        ...state,
        loggingIn: false,
        error: null,
        password: '',
        isAuthed: true,
        userType
      };
    }
    case LOGIN_FAIL:
      return {
        ...state,
        loggingIn: false,
        error: {
          code: action.error.error_code,
          message:  action.error.msg
        }
      };
    case INPUT_CHANGE:
      return {
        ...state,
        [action.data.field]: action.data.value
      };
    case ACC_LOAD_SUCCEED:
      return { ...state, isAuthed: true };
    case CPD_LOAD_FAIL:
      return {
        ...state,
        nonTenant: true,
        error: {
          code: 5001,
          message: action.error.msg
        }
      };
    case ENTER_FORGOT_PAGE:
      return { ...state, error: null, smsId: null, verified: false };
    case SMS_REQUEST_SUCCEED:
      return { ...state, error: null, smsId: action.result.data.smsId, userId: action.result.data.userId };
    case SMS_REQUEST_FAIL:
      return { ...state, error: { message: action.error.msg } };
    case SMS_VERIFY_SUCCEED:
      return { ...state, error: null, verified: true };
    case SMS_VERIFY_FAIL:
      return { ...state, error: { message: action.error.msg } };
    default:
      return state;
  }
}

export function submit(userForm) {
  return {
    [CLIENT_API]: {
      types: [LOGIN, LOGIN_SUCCEED, LOGIN_FAIL],
      endpoint: 'public/v1/login',
      method: 'post',
      data: userForm
    }
  };
}

export function setValue(field, value) {
  return {
    type: INPUT_CHANGE,
    data: { field, value }
  };
}

export function requestSms(phone) {
  return {
    [CLIENT_API]: {
      types: [SMS_REQUEST, SMS_REQUEST_SUCCEED, SMS_REQUEST_FAIL],
      endpoint: 'public/v1/sms/code',
      method: 'post',
      data: { phone }
    }
  };
}

export function verifySms(smsId, userId, smsCode, newPwd) {
  return {
    [CLIENT_API]: {
      types: [SMS_VERIFY, SMS_VERIFY_SUCCEED, SMS_VERIFY_FAIL],
      endpoint: 'public/v1/sms/verify',
      method: 'post',
      data: { smsId, userId, smsCode, newPwd }
    }
  };
}

export function leaveForgot() {
  return {
    type: LEAVE_FORGOT_PAGE
  };
}

export function enterForgot() {
  return {
    type: ENTER_FORGOT_PAGE
  };
}
