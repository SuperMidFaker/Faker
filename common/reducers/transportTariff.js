import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/tariff/', [
  'LOAD_TARIFF', 'LOAD_TARIFF_SUCCEED', 'LOAD_TARIFF_FAIL',
  'LOAD_PARTNERS', 'LOAD_PARTNERS_SUCCEED', 'LOAD_PARTNERS_FAIL',
  'LOAD_FORMPARAMS', 'LOAD_FORMPARAMS_SUCCEED', 'LOAD_FORMPARAMS_FAIL',
]);

const initialState = {
  loaded: false,
  loading: false,
  filters: [
    { name: 'name', value: '' },
  ],
  tarifflist: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: [],
  },
  formData: {
    limits: [],
  },
  partners: [],
  formParams: {
    transModes: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_TARIFF:
      return { ...state, loading: true };
    case actionTypes.LOAD_TARIFF_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_TARIFF_SUCCEED:
      return { ...state, loading: false,
        loaded: true, tarifflist: action.result.data,
        filters: JSON.parse(action.params.filters),
      };
    case actionTypes.LOAD_PARTNERS_SUCCEED:
     return { ...state, partners: action.result.data };
    case actionTypes.LOAD_FORMPARAMS_SUCCEED:
      return { ...state, formParams: action.result.data };
    default:
      return state;
  }
}

export function loadTable(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TARIFF,
        actionTypes.LOAD_TARIFF_SUCCEED,
        actionTypes.LOAD_TARIFF_FAIL,
      ],
      endpoint: 'v1/transport/tariffs',
      method: 'get',
      params,
      origin: 'mongo',
    },
  };
}

export function loadPartners(tenantId, typeCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARTNERS,
        actionTypes.LOAD_PARTNERS_SUCCEED,
        actionTypes.LOAD_PARTNERS_FAIL,
      ],
      endpoint: 'v1/cooperation/type/partners',
      method: 'get',
      params: { tenantId, typeCode },
    },
  };
}

export function loadFormParams(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FORMPARAMS,
        actionTypes.LOAD_FORMPARAMS_SUCCEED,
        actionTypes.LOAD_FORMPARAMS_FAIL,
      ],
      endpoint: 'v1/transport/tariff/params',
      method: 'get',
      params: { tenantId },
    },
  };
}
