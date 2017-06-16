import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/shftz/', [
  'ENTRY_REG_LOAD', 'ENTRY_REG_LOAD_SUCCEED', 'ENTRY_REG_LOAD_FAIL',
  'ENTRY_DETAILS_LOAD', 'ENTRY_DETAILS_LOAD_SUCCEED', 'ENTRY_DETAILS_LOAD_FAIL',
  'RELEASE_REG_LOAD', 'RELEASE_REG_LOAD_SUCCEED', 'RELEASE_REG_LOAD_FAIL',
  'PARAMS_LOAD', 'PARAMS_LOAD_SUCCEED', 'PARAMS_LOAD_FAIL',
  'PRODUCT_CARGO_LOAD', 'PRODUCT_CARGO_LOAD_SUCCEED', 'PRODUCT_CARGO_LOAD_FAIL',
  'UPDATE_CARGO_RULE', 'UPDATE_CARGO_RULE_SUCCEED', 'UPDATE_CARGO_RULE_FAIL',
]);

const initialState = {
  entryList: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  releaseList: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  cargolist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  cargoRule: {},
  loading: false,
  listFilter: {
    status: 'pending',
    filterNo: '',
    ownerView: 'all',
  },
  entryData: {},
  entryDetails: {},
  params: {
    currencies: [],
    units: [],
    tradeCountries: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.ENTRY_REG_LOAD_SUCCEED:
      return { ...state, entryList: action.result.data, listFilter: JSON.parse(action.params.filter) };
    case actionTypes.ENTRY_DETAILS_LOAD_SUCCEED:
      return { ...state, entryDetails: action.result.data.detailG, entryData: action.result.data.entryData };
    case actionTypes.PARAMS_LOAD_SUCCEED:
      return { ...state, params: action.result.data };
    case actionTypes.RELEASE_REG_LOAD_SUCCEED:
      return { ...state, releaseList: action.result.data, listFilter: JSON.parse(action.params.filter) };
    case actionTypes.PRODUCT_CARGO_LOAD:
      return { ...state, listFilter: JSON.parse(action.params.filter), loading: true };
    case actionTypes.PRODUCT_CARGO_LOAD_SUCCEED:
      return { ...state, cargolist: action.result.data.list, cargoRule: action.result.data.rule, loading: false };
    default:
      return state;
  }
}

export function loadEntryRegDatas(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ENTRY_REG_LOAD,
        actionTypes.ENTRY_REG_LOAD_SUCCEED,
        actionTypes.ENTRY_REG_LOAD_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/entryreg/load',
      method: 'get',
      params,
    },
  };
}

export function loadReleaseRegDatas(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RELEASE_REG_LOAD,
        actionTypes.RELEASE_REG_LOAD_SUCCEED,
        actionTypes.RELEASE_REG_LOAD_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/releasereg/load',
      method: 'get',
      params,
    },
  };
}

export function loadEntryDetails(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ENTRY_DETAILS_LOAD,
        actionTypes.ENTRY_DETAILS_LOAD_SUCCEED,
        actionTypes.ENTRY_DETAILS_LOAD_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/entryreg/details/load',
      method: 'get',
      params,
    },
  };
}

export function loadParams() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.PARAMS_LOAD,
        actionTypes.PARAMS_LOAD_SUCCEED,
        actionTypes.PARAMS_LOAD_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/params/load',
      method: 'get',
    },
  };
}

export function loadProductCargo(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.PRODUCT_CARGO_LOAD,
        actionTypes.PRODUCT_CARGO_LOAD_SUCCEED,
        actionTypes.PRODUCT_CARGO_LOAD_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/product/cargo/load',
      method: 'get',
      params,
    },
  };
}

export function updateCargoRule(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_CARGO_RULE,
        actionTypes.UPDATE_CARGO_RULE_SUCCEED,
        actionTypes.UPDATE_CARGO_RULE_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/product/cargo/rule/update',
      method: 'post',
      data,
    },
  };
}
