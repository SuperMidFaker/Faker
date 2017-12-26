import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/declaration/', [
  'LOAD_CUSTOMS_DECLS', 'LOAD_CUSTOMS_DECLS_SUCCEED', 'LOAD_CUSTOMS_DECLS_FAIL',
  'LOAD_CUSTOMSTP', 'LOAD_CUSTOMSTP_SUCCEED', 'LOAD_CUSTOMSTP_FAIL',
  'CIQ_FINISH', 'CIQ_FINISH_SUCCEED', 'CIQ_FINISH_FAIL',
  'LOAD_DECLHEAD', 'LOAD_DECLHEAD_SUCCEED', 'LOAD_DECLHEAD_FAIL',
  'SET_INSPECT', 'SET_INSPECT_SUCCEED', 'SET_INSPECT_FAIL',
  'DELETE_DECL', 'DELETE_DECL_SUCCEED', 'DELETE_DECL_FAIL',
  'SET_REVIEWED', 'SET_REVIEWED_SUCCEED', 'SET_REVIEWED_FAIL',
  'GET_EASIPASS_LIST', 'GET_EASIPASS_LIST_SUCCEED', 'GET_EASIPASS_LIST_FAIL',
  'SHOW_SEND_DECL_MODAL', 'CLEAN_CUSTOMSRES',
  'SEND_DECL', 'SEND_DECL_SUCCEED', 'SEND_DECL_FAIL',
  'LOAD_CLEARANCE_RESULTS', 'LOAD_CLEARANCE_RESULTS_SUCCEED', 'LOAD_CLEARANCE_RESULTS_FAIL',
  'OPEN_DECL_RELEASED_MODAL', 'CLOSE_DECL_RELEASED_MODAL',
  'CLEAR_CUSTOMS', 'CLEAR_CUSTOMS_SUCCEED', 'CLEAR_CUSTOMS_FAIL',
  'SEND_MUTI_DECL', 'SEND_MUTI_DECL_SUCCEED', 'SEND_MUTI_DECL_FAIL',
  'SHOW_BATCH_SEND_MODAL', 'SHOW_BATCH_SEND_MODAL_SUCCEED', 'SHOW_BATCH_SEND_MODAL_FAIL',
  'CLOSE_BATCH_SEND_MODAL', 'SHOW_DECL_LOG', 'HIDE_DECL_LOG',
  'UPDATE_MARK', 'UPDATE_MARK_SUCCEED', 'UPDATE_MARK_FAIL',
  'LOAD_PESEND_RECORDS', 'LOAD_PESEND_RECORDS_SUCCEED', 'LOAD_PESEND_RECORDS_FAIL',
  'LOAD_SEND_RECORDS', 'LOAD_SEND_RECORDS_SUCCEED', 'LOAD_SEND_RECORDS_FAIL',
  'SHOW_DECL_MSG_DOCK', 'HIDE_DECL_MSG_DOCK',
  'SHOW_DECL_MSG_MODAL', 'HIDE_DECL_MSG_MODAL',
  'VALIDATE_ENTRY_ID', 'VALIDATE_ENTRY_ID_SUCCEED', 'VALIDATE_ENTRY_ID_FAIL',
  'LOAD_DECL_LOGS', 'LOAD_DECL_LOGS_SUCCEED', 'LOAD_DECL_LOGS_FAIL',
]);

const initialState = {
  listFilter: {
    status: 'all',
    ietype: 'all',
    viewStatus: 'all',
    clientView: { tenantIds: [], partnerIds: [] },
    filterDate: [],
    declareType: '',
    name: '',
    sortField: '',
    sortOrder: '',
  },
  customslist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  listRequire: {
    customs: [],
    tradeModes: [],
  },
  decl_heads: [],
  sendDeclModal: {
    defaultDecl: { channel: '', dectype: '', appuuid: '' },
    visible: false,
    ietype: '',
    preEntrySeqNo: '',
    delgNo: '',
    agentCustCo: '',
  },
  batchSendModal: {
    visible: false,
    data: {},
    easilist: {},
  },
  visibleClearModal: false,
  clearFillModal: {
    entryNo: '',
    preEntrySeqNo: '',
  },
  customsResults: [],
  customsResultsLoading: false,
  sendRecords: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: [],
  },
  declMsgDock: {
    visible: false,
  },
  declMsgModal: {
    visible: false,
  },
  declLogPanel: {
    visible: false,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_CUSTOMS_DECLS:
      return { ...state, customslist: { ...state.customslist, loading: true } };
    case actionTypes.LOAD_CUSTOMS_DECLS_SUCCEED:
      return {
        ...state,
        customslist: { ...state.customslist, loading: false, ...action.result.data },
        listFilter: JSON.parse(action.params.filter),
        trades: action.result.data.trades,
      };
    case actionTypes.LOAD_CUSTOMS_DECLS_FAIL:
      return { ...state, customslist: { ...state.customslist, loading: false } };
    case actionTypes.LOAD_CUSTOMSTP_SUCCEED:
      return { ...state, listRequire: { ...state.listRequire, ...action.result.data } };
    case actionTypes.LOAD_DECLHEAD_SUCCEED:
      return { ...state, decl_heads: action.result.data };
    case actionTypes.SHOW_SEND_DECL_MODAL:
      return { ...state, sendDeclModal: { ...state.sendDeclModal, ...action.data } };
    case actionTypes.LOAD_CLEARANCE_RESULTS:
      return { ...state, customsResultsLoading: true };
    case actionTypes.LOAD_CLEARANCE_RESULTS_SUCCEED:
      return { ...state, customsResultsLoading: false, customsResults: action.result.data };
    case actionTypes.LOAD_CLEARANCE_RESULTS_FAIL:
      return { ...state, customsResultsLoading: false };
    case actionTypes.CLEAN_CUSTOMSRES:
      return { ...state, customsResults: [] };
    case actionTypes.OPEN_DECL_RELEASED_MODAL:
      return { ...state, visibleClearModal: true, clearFillModal: action.data };
    case actionTypes.CLOSE_DECL_RELEASED_MODAL:
      return { ...state, visibleClearModal: false, clearFillModal: initialState.clearFillModal };
    case actionTypes.SHOW_BATCH_SEND_MODAL:
      return { ...state, batchSendModal: { ...state.batchSendModal, visible: true } };
    case actionTypes.SHOW_BATCH_SEND_MODAL_SUCCEED:
      return {
        ...state,
        batchSendModal: {
          ...state.batchSendModal,
          data: action.result.data.custG,
          easilist: action.result.data.easilist,
        },
      };
    case actionTypes.CLOSE_BATCH_SEND_MODAL:
      return { ...state, batchSendModal: { ...state.batchSendModal, visible: false } };
    case actionTypes.LOAD_SEND_RECORDS_SUCCEED:
      return { ...state, sendRecords: { ...action.result.data } };
    case actionTypes.SHOW_DECL_MSG_DOCK:
      return { ...state, declMsgDock: { ...state.declMsgDock, visible: true } };
    case actionTypes.HIDE_DECL_MSG_DOCK:
      return { ...state, declMsgDock: { ...state.declMsgDock, visible: false } };
    case actionTypes.SHOW_DECL_MSG_MODAL:
      return { ...state, declMsgModal: { ...state.declMsgModal, visible: true } };
    case actionTypes.HIDE_DECL_MSG_MODAL:
      return { ...state, declMsgModal: { ...state.declMsgModal, visible: false } };
    case actionTypes.SHOW_DECL_LOG:
      return { ...state, declLogPanel: { ...state.declLogPanel, visible: true } };
    case actionTypes.HIDE_DECL_LOG:
      return { ...state, declLogPanel: { ...state.declLogPanel, visible: false } };
    default:
      return state;
  }
}

export function setInspect({
  preEntrySeqNo, delgNo, field, enabled,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SET_INSPECT,
        actionTypes.SET_INSPECT_SUCCEED,
        actionTypes.SET_INSPECT_FAIL,
      ],
      endpoint: 'v1/cms/declare/set/inspect',
      method: 'post',
      data: {
        preEntrySeqNo, delgNo, field, enabled,
      },
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

export function loadCustomsDecls(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CUSTOMS_DECLS,
        actionTypes.LOAD_CUSTOMS_DECLS_SUCCEED,
        actionTypes.LOAD_CUSTOMS_DECLS_FAIL,
      ],
      endpoint: 'v1/cms/decl/customs',
      method: 'get',
      params,
    },
  };
}

export function loadTableParams() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CUSTOMSTP,
        actionTypes.LOAD_CUSTOMSTP_SUCCEED,
        actionTypes.LOAD_CUSTOMSTP_FAIL,
      ],
      endpoint: 'v1/cms/manifests/table/params',
      method: 'get',
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

export function setDeclReviewed(declIds, status) {
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

export function sendMutiDecl(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEND_MUTI_DECL,
        actionTypes.SEND_MUTI_DECL_SUCCEED,
        actionTypes.SEND_MUTI_DECL_FAIL,
      ],
      endpoint: 'v1/cms/declare/muti/send',
      method: 'post',
      data,
    },
  };
}

export function showSendDeclModal({
  visible = true, ietype, preEntrySeqNo = '', delgNo = '', agentCustCo, defaultDecl,
}) {
  return {
    type: actionTypes.SHOW_SEND_DECL_MODAL,
    data: {
      visible, ietype, preEntrySeqNo, delgNo, agentCustCo, defaultDecl,
    },
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

export function loadClearanceResults(entryId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CLEARANCE_RESULTS,
        actionTypes.LOAD_CLEARANCE_RESULTS_SUCCEED,
        actionTypes.LOAD_CLEARANCE_RESULTS_FAIL,
      ],
      endpoint: 'v1/cms/customs/results',
      method: 'get',
      params: { entryId },
    },
  };
}

export function clearClearanceResults() {
  return { type: actionTypes.CLEAN_CUSTOMSRES };
}

export function openDeclReleasedModal(entryNo, preEntrySeqNo, delgNo, ietype) {
  return {
    type: actionTypes.OPEN_DECL_RELEASED_MODAL,
    data: {
      preEntrySeqNo, entryNo, delgNo, ietype,
    },
  };
}

export function closeDeclReleasedModal() {
  return {
    type: actionTypes.CLOSE_DECL_RELEASED_MODAL,
  };
}

export function setDeclReleased(clearInfo) {
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

export function showBatchSendModal(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SHOW_BATCH_SEND_MODAL,
        actionTypes.SHOW_BATCH_SEND_MODAL_SUCCEED,
        actionTypes.SHOW_BATCH_SEND_MODAL_FAIL,
      ],
      endpoint: 'v1/cms/declare/batch/send/datas/load',
      method: 'post',
      data,
    },
  };
}

export function closeBatchSendModal() {
  return {
    type: actionTypes.CLOSE_BATCH_SEND_MODAL,
  };
}

export function updateMark(changeVal, entryHeadId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_MARK,
        actionTypes.UPDATE_MARK_SUCCEED,
        actionTypes.UPDATE_MARK_FAIL,
      ],
      endpoint: 'v1/cms/update/mark',
      method: 'post',
      data: { changeVal, entryHeadId },
    },
  };
}

export function loadSendRecords({ searchText, current, pageSize }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SEND_RECORDS,
        actionTypes.LOAD_SEND_RECORDS_SUCCEED,
        actionTypes.LOAD_SEND_RECORDS_FAIL,
      ],
      endpoint: 'v1/cms/send/records/load',
      method: 'get',
      params: { searchText, current, pageSize },
    },
  };
}

export function loadLatestSendRecord(preEntrySeqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PESEND_RECORDS,
        actionTypes.LOAD_PESEND_RECORDS_SUCCEED,
        actionTypes.LOAD_PESEND_RECORDS_FAIL,
      ],
      endpoint: 'v1/cms/send/records/load',
      method: 'get',
      params: { searchText: preEntrySeqNo, current: 1, pageSize: 1 },
    },
  };
}

export function showDeclMsgDock() {
  return {
    type: actionTypes.SHOW_DECL_MSG_DOCK,
  };
}

export function hideDeclMsgDock() {
  return {
    type: actionTypes.HIDE_DECL_MSG_DOCK,
  };
}

export function showDeclMsgModal() {
  return {
    type: actionTypes.SHOW_DECL_MSG_MODAL,
  };
}

export function hideDeclMsgModal() {
  return {
    type: actionTypes.HIDE_DECL_MSG_MODAL,
  };
}

export function validateEntryId(entryNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.VALIDATE_ENTRY_ID,
        actionTypes.VALIDATE_ENTRY_ID_SUCCEED,
        actionTypes.VALIDATE_ENTRY_ID_FAIL,
      ],
      endpoint: 'v1/cms/validate/entry/id',
      method: 'get',
      params: { entryNo },
    },
  };
}

export function showDeclLog() {
  return {
    type: actionTypes.SHOW_DECL_LOG,
  };
}

export function hideDeclLog() {
  return {
    type: actionTypes.HIDE_DECL_LOG,
  };
}

export function loadDeclLogs(preEntrySeqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DECL_LOGS,
        actionTypes.LOAD_DECL_LOGS_SUCCEED,
        actionTypes.LOAD_DECL_LOGS_FAIL,
      ],
      endpoint: 'v1/cms/decl/logs/load',
      method: 'get',
      params: { preEntrySeqNo },
    },
  };
}
