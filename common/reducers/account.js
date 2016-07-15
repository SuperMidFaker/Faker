import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
const initialState = {
  loaded: false, // used by isLoad action
  loginId: -1,
  username: '',
  code: '',
  subdomain: '',
  tenantId: 0,
  aspect: 0,
  categoryId: 0,
  modules: 0,
  type: '', // user type ADMIN PERSONNEL ENTERP BRANCH
  tenantName: '',
  profile: {
    // name(same as outter username), username(loginName without @), phone, email, role
  },
};

const actions = [
  'ACC_LOAD', 'ACC_LOAD_SUCCEED', 'ACC_LOAD_FAIL',
  'PWD_CHANGE', 'PWD_CHANGE_SUCCEED', 'PWD_CHANGE_FAIL',
  'PROFILE_UPDATE', 'PROFILE_UPDATE_SUCCEED', 'PROFILE_UPDATE_FAIL',
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
      return { ...state, profile: {
        ...state.profile, ...action.data.profile,
      } };
    default:
      return state;
  }
}

export function loadAccount(cookie) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ACC_LOAD, actionTypes.ACC_LOAD_SUCCEED, actionTypes.ACC_LOAD_FAIL],
      endpoint: 'v1/user/account',
      method: 'get',
      cookie,
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
