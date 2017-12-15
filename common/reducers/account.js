import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const initialState = {
  loaded: false, // used by isLoad action
  loginId: -1,
  username: '',
  code: '',
  customsCode: '',
  subdomain: '',
  tenantId: 0,
  parentTenantId: null,
  aspect: 0,
  categoryId: 0,
  tenantName: '',
  tenantLevel: -1,
  logo: '',
  role_id: '',
  role_name: '',
  profile: {
    // name(same as outter username), username(loginName without @), phone, email,
  },
  modules: [],
  privileges: {}, // module_id: true(全部功能) || { feature_id: true || { action_id: true }}
  userMembers: [],
};

const actions = [
  'ACC_LOAD', 'ACC_LOAD_SUCCEED', 'ACC_LOAD_FAIL',
  'PWD_CHANGE', 'PWD_CHANGE_SUCCEED', 'PWD_CHANGE_FAIL',
  'PROFILE_UPDATE', 'PROFILE_UPDATE_SUCCEED', 'PROFILE_UPDATE_FAIL',
  'LOGOUT', 'LOGOUT_SUCCEED', 'LOGOUT_FAIL',
];
const domain = '@@welogix/account/';
const actionTypes = createActionTypes(domain, actions);

export const ACC_LOAD_SUCCEED = actionTypes.ACC_LOAD_SUCCEED;
export const PROFILE_UPDATE_SUCCEED = actionTypes.PROFILE_UPDATE_SUCCEED;
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.ACC_LOAD_SUCCEED:
      return { ...state, loaded: true, ...action.result.data };
    case actionTypes.PROFILE_UPDATE_SUCCEED:
      return {
        ...state,
        profile: {
          ...state.profile, ...action.data.profile,
        },
      };
    default:
      return state;
  }
}

export function loadAccount() {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ACC_LOAD, actionTypes.ACC_LOAD_SUCCEED, actionTypes.ACC_LOAD_FAIL],
      endpoint: 'v1/user/account',
      method: 'get',
    },
  };
}

export function changePassword(oldPwd, newPwd) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PWD_CHANGE, actionTypes.PWD_CHANGE_SUCCEED, actionTypes.PWD_CHANGE_FAIL],
      endpoint: 'v1/user/password',
      method: 'put',
      data: { oldPwd, newPwd },
    },
  };
}

export function updateProfile(profile, code, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.PROFILE_UPDATE,
        actionTypes.PROFILE_UPDATE_SUCCEED,
        actionTypes.PROFILE_UPDATE_FAIL,
      ],
      endpoint: 'v1/user/profile',
      method: 'put',
      data: { profile, code, tenantId },
    },
  };
}

export function logout() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOGOUT,
        actionTypes.LOGOUT_SUCCEED,
        actionTypes.LOGOUT_FAIL,
      ],
      endpoint: 'v1/logout',
      method: 'post',
    },
  };
}
