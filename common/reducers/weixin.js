import { CLIENT_API } from '../requester';
import { createActionTypes } from 'client/common/redux-actions';
const initialState = {
  error: '',
  profile: {
    loaded: false
    /* name, phone, email, position */
  }
};

const actions = [
  'WX_BIND', 'WX_BIND_SUCCEED', 'WX_BIND_FAIL',
  'WX_UNBIND', 'WX_UNBIND_SUCCEED', 'WX_UNBIND_FAIL',
  'WX_PROFILE_LOAD', 'WX_PROFILE_LOAD_SUCCEED', 'WX_PROFILE_LOAD_FAIL'
];
const domain = '@@welogix/weixin/';
const actionTypes = createActionTypes(domain, actions);

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.WX_PROFILE_LOAD_SUCCEED:
      return { ...state, profile: { loaded: true, ...action.result.data }};
    case actionTypes.WX_UNBIND_SUCCEED:
      return { ...state, profile: { loaded: false }};
    case actionTypes.WX_BIND_FAIL:
      return { ...state, error: action.error.msg };
    default:
      return state;
  }
}

export function loginBind(form) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.WX_BIND, actionTypes.WX_BIND_SUCCEED, actionTypes.WX_BIND_FAIL],
      endpoint: 'public/v1/weixin/bind',
      method: 'post',
      data: form
    }
  };
}

export function loadWelogixProfile(cookie) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.WX_PROFILE_LOAD,
        actionTypes.WX_PROFILE_LOAD_SUCCEED,
        actionTypes.WX_PROFILE_LOAD_FAIL
      ],
      endpoint: 'v1/weixin/welogix/profile',
      method: 'get',
      cookie
    }
  };
}

export function unbindAccount() {
  return {
    [CLIENT_API]: {
      types: [actionTypes.WX_UNBIND, actionTypes.WX_UNBIND_SUCCEED, actionTypes.WX_UNBIND_FAIL],
      endpoint: 'v1/weixin/unbind',
      method: 'post'
    }
  };
}
