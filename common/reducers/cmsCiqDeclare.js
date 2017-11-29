import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/ciq/declaration/', [
  'LOAD_CIQ_DECLS', 'LOAD_CIQ_DECLS_SUCCEED', 'LOAD_CIQ_DECLS_FAIL',
  'LOAD_CIQ_DECL_HEAD', 'LOAD_CIQ_DECL_HEAD_SUCCEED', 'LOAD_CIQ_DECL_HEAD_FAIL',
  'LOAD_CIQ_DECL_GOODS', 'LOAD_CIQ_DECL_GOODS_SUCCEED', 'LOAD_CIQ_DECL_GOODS_FAIL',
  'LOAD_CIQ_PARAMS', 'LOAD_CIQ_PARAMS_SUCCEED', 'LOAD_CIQ_PARAMS_FAIL',
  'SHOW_GOODS_MODAL', 'HIDE_GOODS_MODAL',
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
    ports: [],
    currencies: [],
    units: [],
  },
  goodsModal: {
    visible: false,
    data: {},
  },
  ciqDeclHead: {},
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
      return { ...state, ciqParams: { ...action.result.data } };
    case actionTypes.SHOW_GOODS_MODAL:
      return { ...state, goodsModal: { ...state.goodsModal, visible: true, data: action.record } };
    case actionTypes.HIDE_GOODS_MODAL:
      return { ...state, goodsModal: { ...state.goodsModal, visible: false, data: {} } };
    case actionTypes.LOAD_CIQ_DECL_HEAD_SUCCEED:
      return { ...state, ciqDeclHead: action.result.data };
    case actionTypes.LOAD_CIQ_DECL_GOODS_SUCCEED:
      return { ...state, ciqDeclGoods: action.result.data };
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
