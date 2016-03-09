import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';
import { CPD_RELOAD } from './corp-domain';
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

const actions = ['ACC_LOAD', 'ACC_LOAD_SUCCEED', 'ACC_LOAD_FAIL'];
const domain = '@@welogix/account/';
const actionTypes = createActionTypes(domain, actions);

export const ACC_LOAD_SUCCEED = actionTypes.ACC_LOAD_SUCCEED;
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case CPD_RELOAD:
      return { ...state, subdomain: action.params.subdomain };
    case actionTypes.ACC_LOAD_SUCCEED:
      return {...state, loaded: true, ...action.result.data};
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
