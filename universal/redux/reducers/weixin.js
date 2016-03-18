import { CLIENT_API } from 'reusable/redux-middlewares/api';
import { createActionTypes } from 'reusable/common/redux-actions';
const initialState = {
  error: '',
  loginId: -1,
  openid: ''
};

const actions = [
  'WX_BIND', 'WX_BIND_SUCCEED', 'WX_BIND_FAIL',
  'WX_LOAD', 'WX_LOAD_SUCCEED', 'WX_LOAD_FAIL'
];
const domain = '@@welogix/weixin/';
const actionTypes = createActionTypes(domain, actions);

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.WX_LOAD_SUCCEED:
      return { ...state, ...action.result.data };
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
