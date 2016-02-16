import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/partner/', [
  'PARTNERS_LOAD', 'PARTNERS_LOAD_SUCCEED', 'PARTNERS_LOAD_FAIL',
  'PARTNERSHIP_TYPE_LOAD', 'PARTNERSHIP_TYPE_LOAD_SUCCEED', 'PARTNERSHIP_TYPE_LOAD_FAIL',
  'OFFLINE_PARTNER', 'OFFLINE_PARTNER_SUCCEED', 'OFFLINE_PARTNER_FAIL'
]);

const initialState = {
  loaded: false,
  loading: false,
  partnershipTypes: [
    /* { key:, name: } */
  ],
  tenants: [
    /* { id:, name: } */
  ],
  partnerlist: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: [
      /* { key:, name:, types: [{key:, name:}], other db column } */
    ]
  }
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.PARTNERS_LOAD:
      return { ...state, loading: true };
    case actionTypes.PARTNERS_LOAD_SUCCEED:
      return { ...state, ...action.result.data, loading: false, loaded: true };
    case actionTypes.PARTNERS_LOAD_FAIL:
      return { ...state, loading: false, loaded: true };
    case actionTypes.PARTNERSHIP_TYPE_LOAD_SUCCEED:
      return { ...state, partnershipTypes: action.result.data };
    default:
      return state;
  }
}

export function loadPartners(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PARTNERS_LOAD, actionTypes.PARTNERS_LOAD_SUCCEED, actionTypes.PARTNERS_LOAD_FAIL],
      endpoint: 'v1/cooperation/partners',
      method: 'get',
      params,
      cookie
    }
  };
}

export function loadPartnershipTypes(cookie) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PARTNERSHIP_TYPE_LOAD, actionTypes.PARTNERSHIP_TYPE_LOAD_SUCCEED,
        actionTypes.PARTNERS_LOAD_FAIL],
      endpoint: 'v1/cooperation/partnership/types',
      method: 'get',
      cookie
    }
  };
}
