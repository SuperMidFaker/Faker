import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const initialState = {
  loaded: false, // used by isLoad action
  name: '',
  code: '',
  logo: '',
  subdomain: '', // set by server request query
};

const actions = [
  'CPD_LOAD', 'CPD_LOAD_SUCCEED', 'CPD_LOAD_FAIL',
  'CHECK_CORP_DOMAIN', 'CHECK_DOMAIN_SUCCEED', 'CHECK_DOMAIN_FAIL',
];
const domain = '@@welogix/corpd/';
const actionTypes = createActionTypes(domain, actions);

export const CPD_LOAD_FAIL = actionTypes.CPD_LOAD_FAIL;

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.CPD_LOAD_SUCCEED:
      return { ...state, loaded: true, ...action.result.data };
    default:
      return state;
  }
}

export function checkCorpDomain(subdomain, tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CHECK_CORP_DOMAIN, actionTypes.CHECK_DOMAIN_SUCCEED, actionTypes.CHECK_DOMAIN_FAIL],
      endpoint: 'v1/user/corp/check/subdomain',
      method: 'get',
      params: { domain: subdomain, tenantId },
    },
  };
}

export function loadCorpByDomain(subdomain) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CPD_LOAD, actionTypes.CPD_LOAD_SUCCEED, actionTypes.CPD_LOAD_FAIL],
      endpoint: 'public/v1/subdomain/corp',
      method: 'get',
      params: { subdomain },
    },
  };
}
