import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/ciq/declaration/', [
  'LOAD_CIQ_DECLS', 'LOAD_CIQ_DECLS_SUCCEED', 'LOAD_CIQ_DECLS_FAIL',
  'LOAD_CIQ_DECL_HEAD', 'LOAD_CIQ_DECL_HEAD_SUCCEED', 'LOAD_CIQ_DECL_HEAD_FAIL',
  'LOAD_CIQ_DECL_GOODS', 'LOAD_CIQ_DECL_GOODS_SUCCEED', 'LOAD_CIQ_DECL_GOODS_FAIL',
  'LOAD_CIQ_PARAMS', 'LOAD_CIQ_PARAMS_SUCCEED', 'LOAD_CIQ_PARAMS_FAIL',
  'SHOW_GOODS_MODAL', 'HIDE_GOODS_MODAL',
  'SEARCH_ORGANIZATIONS', 'SEARCH_ORGANIZATIONS_SUCCEED', 'SEARCH_ORGANIZATIONS_FAIL',
  'SEARCH_WORLDPORTS', 'SEARCH_WORLDPORTS_SUCCEED', 'SEARCH_WORLDPORTS_FAIL',
  'SEARCH_CHINAPORTS', 'SEARCH_CHINAPORTS_SUCCEED', 'SEARCH_CHINAPORTS_FAIL',
  'SEARCH_COUNTRIES', 'SEARCH_COUNTRIES_SUCCEED', 'SEARCH_COUNTRIES_FAIL',
  'UPDATE_CIQ_HEAD', 'UPDATE_CIQ_HEAD_SUCCEED', 'UPDATE_CIQ_HEAD_FAIL',
  'SET_FIXED_COUNTRY', 'SET_FIXED_ORGANIZATIONS', 'SET_FIXED_WORLDPORTS',
  'UPDATE_CIQ_HEAD_FIELD', 'UPDATE_CIQ_HEAD_FIELD_SUCCEED', 'UPDATE_CIQ_HEAD_FIELD_FAIL',
  'CIQ_HEAD_CHANGE',
  'UPDATE_CIQ_GOOD', 'UPDATE_CIQ_GOOD_SUCCEED', 'UPDATE_CIQ_GOOD_FAIL',
  'EXTEND_COUNTRY_CODE', 'EXTEND_COUNTRY_CODE_SUCCEED', 'EXTEND_COUNTRY_CODE_FAIL',
  'SEARCH_CUSTOMS', 'SEARCH_CUSTOMS_SUCCEED', 'SEARCH_CUSTOMS_FAIL',
]);

const initialState = {
  ciqdeclList: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  cjqListFilter: {
    ieType: 'all',
  },
  ciqParams: {
    organizations: [],
    countries: [],
    worldPorts: [],
    chinaPorts: [],
    currencies: [],
    units: [],
    customs: [],
    fixedCountries: [],
    fixedOrganizations: [],
    fixedWorldPorts: [],
  },
  goodsModal: {
    visible: false,
    data: {},
  },
  ciqDeclHead: {
    head: [],
    entries: [],
  },
  ciqDeclGoods: [],
  ciqHeadChangeTimes: 0,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_CIQ_DECLS:
      return { ...state, ciqdeclList: { ...state.ciqdeclList, loading: true } };
    case actionTypes.LOAD_CIQ_DECLS_SUCCEED:
      return { ...state,
        ciqdeclList: { ...state.ciqdeclList, loading: false, ...action.result.data },
        cjqListFilter: JSON.parse(action.params.filter) };
    case actionTypes.LOAD_CIQ_DECLS_FAIL:
      return { ...state, ciqdeclList: { ...state.ciqdeclList, loading: false } };
    case actionTypes.LOAD_CIQ_PARAMS_SUCCEED:
      return { ...state,
        ciqParams: { ...state.ciqParams,
          units: [...action.result.data.units],
          currencies: [...action.result.data.currencies],
          chinaPorts: [...action.result.data.chinaPorts],
          customs: [...action.result.data.customs],
          organizations: [...action.result.data.organizations, ...state.ciqParams.fixedOrganizations],
          countries: [...action.result.data.countries, ...state.ciqParams.countries],
          worldPorts: [...action.result.data.worldPorts, ...state.ciqParams.worldPorts] } };
    case actionTypes.SHOW_GOODS_MODAL:
      return { ...state, goodsModal: { ...state.goodsModal, visible: true, data: action.record } };
    case actionTypes.HIDE_GOODS_MODAL:
      return { ...state, goodsModal: { ...state.goodsModal, visible: false, data: {} } };
    case actionTypes.LOAD_CIQ_DECL_HEAD_SUCCEED:
      return { ...state,
        ciqDeclHead: { head: action.result.data.head, entries: action.result.data.entries },
        ciqParams: { ...state.ciqParams,
          organizations: [...state.ciqParams.organizations, ...action.result.data.organizations],
          countries: [...state.ciqParams.countries, ...action.result.data.countries],
          worldPorts: [...state.ciqParams.worldPorts, ...action.result.data.worldports],
          customs: [...state.ciqParams.customs, ...action.result.data.customs],
          fixedOrganizations: [...action.result.data.organizations],
          fixedCountries: [...action.result.data.countries],
          fixedWorldPorts: [...action.result.data.worldports],
        } };
    case actionTypes.LOAD_CIQ_DECL_GOODS_SUCCEED:
      return { ...state, ciqDeclGoods: action.result.data };
    case actionTypes.SEARCH_ORGANIZATIONS_SUCCEED:
      return { ...state, ciqParams: { ...state.ciqParams, organizations: [...action.result.data, ...state.ciqParams.fixedOrganizations] } };
    case actionTypes.SEARCH_WORLDPORTS_SUCCEED:
      return { ...state, ciqParams: { ...state.ciqParams, worldPorts: [...action.result.data, ...state.ciqParams.fixedWorldPorts] } };
    case actionTypes.SEARCH_CHINAPORTS_SUCCEED:
      return { ...state, ciqParams: { ...state.ciqParams, chinaPorts: [...action.result.data] } };
    case actionTypes.SEARCH_COUNTRIES_SUCCEED:
      return { ...state, ciqParams: { ...state.ciqParams, countries: [...action.result.data, ...state.ciqParams.fixedCountries] } };
    case actionTypes.SEARCH_CUSTOMS_SUCCEED:
      return { ...state, ciqParams: { ...state.ciqParams, customs: [...action.result.data] } };
    case actionTypes.SET_FIXED_COUNTRY:
      return { ...state, ciqParams: { ...state.ciqParams, fixedCountries: [...action.records] } };
    case actionTypes.SET_FIXED_ORGANIZATIONS:
      return { ...state, ciqParams: { ...state.ciqParams, fixedOrganizations: [...action.records] } };
    case actionTypes.SET_FIXED_WORLDPORTS:
      return { ...state, ciqParams: { ...state.ciqParams, fixedWorldPorts: [...action.records] } };
    case actionTypes.CIQ_HEAD_CHANGE:
      return { ...state, ciqHeadChangeTimes: state.ciqHeadChangeTimes + 1 };
    case actionTypes.UPDATE_CIQ_HEAD_SUCCEED:
      return { ...state, ciqHeadChangeTimes: 0 };
    case actionTypes.EXTEND_COUNTRY_CODE_SUCCEED:
      return { ...state, ciqParams: { ...state.ciqParams, countries: [...state.ciqParams.countries, action.result.data] } };
    default:
      return state;
  }
}

export function loadCiqDecls(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CIQ_DECLS,
        actionTypes.LOAD_CIQ_DECLS_SUCCEED,
        actionTypes.LOAD_CIQ_DECLS_FAIL,
      ],
      endpoint: 'v1/cms/declare/get/ciqDecls',
      method: 'get',
      params,
    },
  };
}

export function loadCiqDeclHead(preEntrySeqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CIQ_DECL_HEAD,
        actionTypes.LOAD_CIQ_DECL_HEAD_SUCCEED,
        actionTypes.LOAD_CIQ_DECL_HEAD_FAIL,
      ],
      endpoint: 'v1/cms/ciq/decl/head/load',
      method: 'get',
      params: { preEntrySeqNo },
    },
  };
}

export function loadCiqDeclGoods(preEntrySeqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CIQ_DECL_GOODS,
        actionTypes.LOAD_CIQ_DECL_GOODS_SUCCEED,
        actionTypes.LOAD_CIQ_DECL_GOODS_FAIL,
      ],
      endpoint: 'v1/cms/ciq/decl/goods/load',
      method: 'get',
      params: { preEntrySeqNo },
    },
  };
}

export function loadCiqParams() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CIQ_PARAMS,
        actionTypes.LOAD_CIQ_PARAMS_SUCCEED,
        actionTypes.LOAD_CIQ_PARAMS_FAIL,
      ],
      endpoint: 'v1/cms/ciq/params/load',
      method: 'get',
    },
  };
}

export function showGoodsModal(record) {
  return {
    type: actionTypes.SHOW_GOODS_MODAL,
    record,
  };
}

export function hideGoodsModal() {
  return {
    type: actionTypes.HIDE_GOODS_MODAL,
  };
}

export function searchOrganizations(searchText) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEARCH_ORGANIZATIONS,
        actionTypes.SEARCH_ORGANIZATIONS_SUCCEED,
        actionTypes.SEARCH_ORGANIZATIONS_FAIL,
      ],
      endpoint: 'v1/cms/ciq/organizations/search',
      method: 'get',
      params: { searchText },
    },
  };
}

export function searchWorldPorts(searchText) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEARCH_WORLDPORTS,
        actionTypes.SEARCH_WORLDPORTS_SUCCEED,
        actionTypes.SEARCH_WORLDPORTS_FAIL,
      ],
      endpoint: 'v1/cms/ciq/worldports/search',
      method: 'get',
      params: { searchText },
    },
  };
}

export function searchChinaPorts(searchText) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEARCH_CHINAPORTS,
        actionTypes.SEARCH_CHINAPORTS_SUCCEED,
        actionTypes.SEARCH_CHINAPORTS_FAIL,
      ],
      endpoint: 'v1/cms/ciq/chinaports/search',
      method: 'get',
      params: { searchText },
    },
  };
}

export function searchCountries(searchText) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEARCH_COUNTRIES,
        actionTypes.SEARCH_COUNTRIES_SUCCEED,
        actionTypes.SEARCH_COUNTRIES_FAIL,
      ],
      endpoint: 'v1/cms/ciq/countries/search',
      method: 'get',
      params: { searchText },
    },
  };
}

export function searchCustoms(searchText) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEARCH_CUSTOMS,
        actionTypes.SEARCH_CUSTOMS_SUCCEED,
        actionTypes.SEARCH_CUSTOMS_FAIL,
      ],
      endpoint: 'v1/cms/ciq/customs/search',
      method: 'get',
      params: { searchText },
    },
  };
}

export function updateCiqHead(preEntrySeqNo, data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_CIQ_HEAD,
        actionTypes.UPDATE_CIQ_HEAD_SUCCEED,
        actionTypes.UPDATE_CIQ_HEAD_FAIL,
      ],
      endpoint: 'v1/cms/ciq/head/update',
      method: 'post',
      data: { preEntrySeqNo, data },
    },
  };
}

export function setFixedCountry(records) {
  return {
    type: actionTypes.SET_FIXED_COUNTRY,
    records,
  };
}

export function setFixedOrganizations(records) {
  return {
    type: actionTypes.SET_FIXED_ORGANIZATIONS,
    records,
  };
}

export function setFixedWorldPorts(records) {
  return {
    type: actionTypes.SET_FIXED_WORLDPORTS,
    records,
  };
}

export function updateCiqHeadField(field, value, preEntrySeqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_CIQ_HEAD_FIELD,
        actionTypes.UPDATE_CIQ_HEAD_FIELD_SUCCEED,
        actionTypes.UPDATE_CIQ_HEAD_FIELD_FAIL,
      ],
      endpoint: 'v1/cms/ciq/head/field/update',
      method: 'post',
      data: { field, value, preEntrySeqNo },
    },
  };
}

export function ciqHeadChange() {
  return {
    type: actionTypes.CIQ_HEAD_CHANGE,
  };
}

export function updateCiqGood(id, data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_CIQ_GOOD,
        actionTypes.UPDATE_CIQ_GOOD_SUCCEED,
        actionTypes.UPDATE_CIQ_GOOD_FAIL,
      ],
      endpoint: 'v1/cms/ciq/good/update',
      method: 'post',
      data: { id, data },
    },
  };
}

export function extendCountryParam(code) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EXTEND_COUNTRY_CODE,
        actionTypes.EXTEND_COUNTRY_CODE_SUCCEED,
        actionTypes.EXTEND_COUNTRY_CODE_FAIL,
      ],
      endpoint: 'v1/cms/extend/country/param',
      method: 'get',
      params: { code },
    },
  };
}
