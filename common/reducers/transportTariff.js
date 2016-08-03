import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/tariff/', [
  'LOAD_TARIFF', 'LOAD_TARIFF_SUCCEED', 'LOAD_TARIFF_FAIL',
  'LOAD_PARTNERS', 'LOAD_PARTNERS_SUCCEED', 'LOAD_PARTNERS_FAIL',
  'LOAD_FORMPARAMS', 'LOAD_FORMPARAMS_SUCCEED', 'LOAD_FORMPARAMS_FAIL',
  'SUBMIT_AGREEMENT', 'SUBMIT_AGREEMENT_SUCCEED', 'SUBMIT_AGREEMENT_FAIL',
  'SUBMIT_RATESRC', 'SUBMIT_RATESRC_SUCCEED', 'SUBMIT_RATESRC_FAIL',
  'LOAD_RATESRC', 'LOAD_RATESRC_SUCCEED', 'LOAD_RATESRC_FAIL',
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
  tariffId: '57a15a03fd2b1c34451eb13f',
  agreement: {
    intervals: [],
  },
  ratesRefAgreement: {},
  ratesSourceLoading: false,
  ratesSourceList: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: [],
  },
  rateSourceId: '',
  ratesEndLoading: false,
  ratesEndList: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: [],
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
    case actionTypes.SUBMIT_AGREEMENT_SUCCEED:
      return { ...state, tariffId: action.result.data,
        ratesRefAgreement: action.data };
    case actionTypes.LOAD_RATESRC:
      return { ...state, ratesSourceLoading: true };
    case actionTypes.LOAD_RATESRC_SUCCEED:
      return { ...state, ratesSourceLoading: false, ratesSourceList: action.result.data };
    case actionTypes.LOAD_RATESRC_FAIL:
      return { ...state, ratesSourceLoading: false };
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

export function submitAgreement(forms) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SUBMIT_AGREEMENT,
        actionTypes.SUBMIT_AGREEMENT_SUCCEED,
        actionTypes.SUBMIT_AGREEMENT_FAIL,
      ],
      endpoint: 'v1/transport/tariff',
      method: 'post',
      data: forms,
      origin: 'mongo',
    },
  };
}

export function submitRateSource(tariffId, code, region) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SUBMIT_RATESRC,
        actionTypes.SUBMIT_RATESRC_SUCCEED,
        actionTypes.SUBMIT_RATESRC_FAIL,
      ],
      endpoint: 'v1/transport/tariff/ratesource',
      method: 'post',
      data: { tariffId, code, region },
      origin: 'mongo',
    },
  };
}

export function loadRatesSources(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_RATESRC,
        actionTypes.LOAD_RATESRC_SUCCEED,
        actionTypes.LOAD_RATESRC_FAIL,
      ],
      endpoint: 'v1/transport/tariff/ratesources',
      method: 'get',
      params,
      origin: 'mongo',
    },
  };
}
