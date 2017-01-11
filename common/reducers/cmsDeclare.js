import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/declaration/', [
  'LOAD_CIQ_DECLS', 'LOAD_CIQ_DECLS_SUCCEED', 'LOAD_CIQ_DECLS_FAIL',
  'LOAD_DELG_DECLS', 'LOAD_DELG_DECLS_SUCCEED', 'LOAD_DELG_DECLS_FAIL',
  'CIQ_FINISH', 'CIQ_FINISH_SUCCEED', 'CIQ_FINISH_FAIL',
  'LOAD_DECLHEAD', 'LOAD_DECLHEAD_SUCCEED', 'LOAD_DECLHEAD_FAIL',
  'SET_INSPECT', 'SET_INSPECT_SUCCEED', 'SET_INSPECT_FAIL',
]);

const initialState = {
  listFilter: {
    status: 'all',
    declareType: '',
    name: '',
    sortField: '',
    sortOrder: '',
  },
  ciqdeclList: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: [],
  },
  delgdeclList: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: [],
  },
  decl_heads: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_CIQ_DECLS:
      return { ...state, ciqdeclList: { ...state.ciqdeclList, loading: true } };
    case actionTypes.LOAD_CIQ_DECLS_SUCCEED:
      return { ...state, ciqdeclList: { ...state.ciqdeclList, loading: false, ...action.result.data } };
    case actionTypes.LOAD_CIQ_DECLS_FAIL:
      return { ...state, ciqdeclList: { ...state.ciqdeclList, loading: false } };
    case actionTypes.LOAD_DELG_DECLS:
      return { ...state, delgdeclList: { ...state.delgdeclList, loading: true } };
    case actionTypes.LOAD_DELG_DECLS_SUCCEED:
      return { ...state, delgdeclList: { ...state.delgdeclList, loading: false, ...action.result.data },
        listFilter: JSON.parse(action.params.filter) };
    case actionTypes.LOAD_DELG_DECLS_FAIL:
      return { ...state, delgdeclList: { ...state.delgdeclList, loading: false } };
    case actionTypes.LOAD_DECLHEAD_SUCCEED:
      return { ...state, decl_heads: action.result.data };
    default:
      return state;
  }
}

export function setInspect({ preEntrySeqNo, delgNo, field, enabled }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SET_INSPECT,
        actionTypes.SET_INSPECT_SUCCEED,
        actionTypes.SET_INSPECT_FAIL,
      ],
      endpoint: 'v1/cms/declare/set/inspect',
      method: 'post',
      data: { preEntrySeqNo, delgNo, field, enabled },
    },
  };
}

export function loadDeclHead(delgNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DECLHEAD,
        actionTypes.LOAD_DECLHEAD_SUCCEED,
        actionTypes.LOAD_DECLHEAD_FAIL,
      ],
      endpoint: 'v1/cms/declare/get/declheads',
      method: 'get',
      params: { delgNo },
    },
  };
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

export function loadDelgDecls(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DELG_DECLS,
        actionTypes.LOAD_DELG_DECLS_SUCCEED,
        actionTypes.LOAD_DELG_DECLS_FAIL,
      ],
      endpoint: 'v1/cms/declare/get/delgDecls',
      method: 'get',
      params,
    },
  };
}

export function setCiqFinish(entryId, delgNo) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CIQ_FINISH, actionTypes.CIQ_FINISH_SUCCEED, actionTypes.CIQ_FINISH_FAIL],
      endpoint: 'v1/cms/ciq/finish',
      method: 'post',
      data: { entryId, delgNo },
    },
  };
}
