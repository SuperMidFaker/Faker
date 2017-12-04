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
    case actionTypes.SET_FIXED_COUNTRY:
      return { ...state, ciqParams: { ...state.ciqParams, fixedCountries: [...action.records] } };
    case actionTypes.SET_FIXED_ORGANIZATIONS:
      return { ...state, ciqParams: { ...state.ciqParams, fixedOrganizations: [...action.records] } };
    case actionTypes.SET_FIXED_WORLDPORTS:
      return { ...state, ciqParams: { ...state.ciqParams, fixedWorldPorts: [...action.records] } };
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
