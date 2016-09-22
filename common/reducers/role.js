import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const initialState = {
  loaded: false,
  loading: false,
  list: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: [],
  },
};

const actions = [
  'LOAD_ROLES', 'LOAD_ROLES_SUCCEED', 'LOAD_ROLES_FAIL',
];
const domain = '@@welogix/role/';
const actionTypes = createActionTypes(domain, actions);

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_ROLES:
      return { ...state, loading: true };
    case actionTypes.LOAD_ROLES_FAIL:
      return { ...state, loading: false, loaded: true };
    case actionTypes.LOAD_ROLES_SUCCEED:
      return { ...state, loaded: true, loading: false, list: action.result.data };
    default:
      return state;
  }
}

export function loadRoles(params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.LOAD_ROLES, actionTypes.LOAD_ROLES_SUCCEED, actionTypes.LOAD_ROLES_FAIL],
      endpoint: 'v1/user/tenantroles',
      method: 'get',
      params,
    },
  };
}

