import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';

const initialState = {
  loaded: false, // used by isLoad action
  name: '',
  code: '',
  logo: ''
};

const actions = ['CPD_LOAD', 'CPD_LOAD_SUCCEED', 'CPD_LOAD_FAIL'];
const domain = '@@welogix/corpd/';
const actionTypes = createActionTypes(domain, actions);

export const CPD_LOAD_FAIL = actionTypes.CPD_LOAD_FAIL;

export default function reducer(state = initialState, action) {
  switch (action.type) {
  case actionTypes.CPD_LOAD_SUCCEED:
    return {...state, loaded: true, ...action.result.data};
  default:
    return state;
  }
}

export function loadCorpByDomain(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CPD_LOAD, actionTypes.CPD_LOAD_SUCCEED, actionTypes.CPD_LOAD_FAIL],
      endpoint: 'public/v1/subdomain/corp',
      method: 'get',
      params,
      cookie
    }
  };
}
