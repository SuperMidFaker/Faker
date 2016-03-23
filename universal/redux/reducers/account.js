import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';
const initialState = {
  loaded: false, // used by isLoad action
  loginId: -1,
  username: '',
  type: '',
  code: '',
  subdomain: '',
  tenantId: 0,
  aspect: 0,
  categoryId: 0,
  modules: 0
};

const PWD_CHANGE = '@@qm-auth/auth/PWD_CHANGE';
const PWD_CHANGE_SUCCEED = '@@qm-auth/auth/PWD_CHANGE_SUCCEED';
const PWD_CHANGE_FAIL = '@@qm-auth/auth/PWD_CHANGE_FAIL';
const actions = ['ACC_LOAD', 'ACC_LOAD_SUCCEED', 'ACC_LOAD_FAIL'];
const domain = '@@welogix/account/';
const actionTypes = createActionTypes(domain, actions);

export const ACC_LOAD_SUCCEED = actionTypes.ACC_LOAD_SUCCEED;
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.ACC_LOAD_SUCCEED:
      return {...state, loaded: true, ...action.result.data};
    case PWD_CHANGE_SUCCEED:
      action.history.goBack(); // todo change to componentWillReceiveProps
      return state;
    default:
      return state;
  }
}

export function loadAccount(cookie) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ACC_LOAD, actionTypes.ACC_LOAD_SUCCEED, actionTypes.ACC_LOAD_FAIL],
      endpoint: `v1/user/account`,
      method: 'get',
      cookie
    }
  };
}

export function changePassword(oldPwd, newPwd, history) {
  return {
    [CLIENT_API]: {
      types: [PWD_CHANGE, PWD_CHANGE_SUCCEED, PWD_CHANGE_FAIL],
      endpoint: 'v1/user/password',
      method: 'put',
      history,
      data: { oldPwd, newPwd }
    }
  };
}

