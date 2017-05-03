import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/declaration/', [
  'LOAD_CIQ_DECLS', 'LOAD_CIQ_DECLS_SUCCEED', 'LOAD_CIQ_DECLS_FAIL',
  'LOAD_DELG_DECLS', 'LOAD_DELG_DECLS_SUCCEED', 'LOAD_DELG_DECLS_FAIL',
  'CIQ_FINISH', 'CIQ_FINISH_SUCCEED', 'CIQ_FINISH_FAIL',
  'LOAD_DECLHEAD', 'LOAD_DECLHEAD_SUCCEED', 'LOAD_DECLHEAD_FAIL',
  'SET_INSPECT', 'SET_INSPECT_SUCCEED', 'SET_INSPECT_FAIL',
  'DELETE_DECL', 'DELETE_DECL_SUCCEED', 'DELETE_DECL_FAIL',
  'SET_REVIEWED', 'SET_REVIEWED_SUCCEED', 'SET_REVIEWED_FAIL',
  'GET_EASIPASS_LIST', 'GET_EASIPASS_LIST_SUCCEED', 'GET_EASIPASS_LIST_FAIL',
  'SHOW_SEND_DECL_MODAL', 'CLEAN_CUSTOMSRES',
  'SEND_DECL', 'SEND_DECL_SUCCEED', 'SEND_DECL_FAIL',
  'LOAD_CUSTOMSRES', 'LOAD_CUSTOMSRES_SUCCEED', 'LOAD_CUSTOMSRES_FAIL',
  'OPEN_CLEARFILL_MODAL', 'CLOSE_CLEARFILL_MODAL',
  'CLEAR_CUSTOMS', 'CLEAR_CUSTOMS_SUCCEED', 'CLEAR_CUSTOMS_FAIL',
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
    pageSize: 20,
    data: [],
  },
  delgdeclList: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  decl_heads: [],
  customs: [],
  sendDeclModal: {
    visible: false,
    preEntrySeqNo: '',
    delgNo: '',
    agentCustCo: '',
  },
  visibleClearModal: false,
  clearFillModal: {
    entryNo: '',
    preEntrySeqNo: '',
  },
  customsResults: [],
  customsResultsLoading: false,
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
        listFilter: JSON.parse(action.params.filter), customs: action.result.data.customs };
    case actionTypes.LOAD_DELG_DECLS_FAIL:
      return { ...state, delgdeclList: { ...state.delgdeclList, loading: false } };
    case actionTypes.LOAD_DECLHEAD_SUCCEED:
      return { ...state, decl_heads: action.result.data };
    case actionTypes.SHOW_SEND_DECL_MODAL:
      return { ...state, sendDeclModal: { ...state.sendDeclModal, ...action.data } };
    case actionTypes.LOAD_CUSTOMSRES:
      return { ...state, customsResultsLoading: true };
    case actionTypes.LOAD_CUSTOMSRES_SUCCEED:
      return { ...state, customsResultsLoading: false, customsResults: action.result.data };
    case actionTypes.LOAD_CUSTOMSRES_FAIL:
      return { ...state, customsResultsLoading: false };
    case actionTypes.CLEAN_CUSTOMSRES:
      return { ...state, customsResults: [] };
    case actionTypes.OPEN_CLEARFILL_MODAL:
      return { ...state, visibleClearModal: true, clearFillModal: action.data };
    case actionTypes.CLOSE_CLEARFILL_MODAL:
      return { ...state, visibleClearModal: false, clearFillModal: initialState.clearFillModal };
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

export function deleteDecl(declId, delgNo, billNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_DECL,
        actionTypes.DELETE_DECL_SUCCEED,
        actionTypes.DELETE_DECL_FAIL,
      ],
      endpoint: 'v1/cms/declare/delete',
      method: 'post',
      data: { declId, delgNo, billNo },
    },
  };
}

export function setFilterReviewed(declIds, status) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SET_REVIEWED,
        actionTypes.SET_REVIEWED_SUCCEED,
        actionTypes.SET_REVIEWED_FAIL,
      ],
      endpoint: 'v1/cms/declare/set/reviewed',
      method: 'post',
      data: { declIds, status },
    },
  };
}

export function sendDecl(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEND_DECL,
        actionTypes.SEND_DECL_SUCCEED,
        actionTypes.SEND_DECL_FAIL,
      ],
      endpoint: 'v1/cms/declare/send',
      method: 'post',
      data,
    },
  };
}

export function showSendDeclModal({ visible = true, preEntrySeqNo = '', delgNo = '', agentCustCo }) {
  return {
    type: actionTypes.SHOW_SEND_DECL_MODAL,
    data: { visible, preEntrySeqNo, delgNo, agentCustCo },
  };
}

export function getEasipassList(tenantId, agentCustCo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GET_EASIPASS_LIST,
        actionTypes.GET_EASIPASS_LIST_SUCCEED,
        actionTypes.GET_EASIPASS_LIST_FAIL,
      ],
      endpoint: 'v1/platform/integration/easipassList',
      method: 'get',
      params: { tenantId, agentCustCo },
    },
  };
}

export function loadCustomsResults(entryId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CUSTOMSRES,
        actionTypes.LOAD_CUSTOMSRES_SUCCEED,
        actionTypes.LOAD_CUSTOMSRES_FAIL,
      ],
      endpoint: 'v1/cms/customs/results',
      method: 'get',
      params: { entryId },
    },
  };
}

export function cleanCustomsResults() {
  return { type: actionTypes.CLEAN_CUSTOMSRES };
}

export function openClearFillModal(entryNo, preEntrySeqNo, delgNo) {
  return {
    type: actionTypes.OPEN_CLEARFILL_MODAL,
    data: { preEntrySeqNo, entryNo, delgNo },
  };
}

export function closeClearFillModal() {
  return {
    type: actionTypes.CLOSE_CLEARFILL_MODAL,
  };
}

export function clearCustoms(clearInfo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CLEAR_CUSTOMS,
        actionTypes.CLEAR_CUSTOMS_SUCCEED,
        actionTypes.CLEAR_CUSTOMS_FAIL,
      ],
      endpoint: 'v1/cms/customs/clear',
      method: 'post',
      data: clearInfo,
    },
  };
}
