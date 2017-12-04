import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/delegation/', [
  'LOAD_PARTNERS', 'LOAD_PARTNERS_SUCCEED', 'LOAD_PARTNERS_FAIL',
  'LOAD_ACCEPT', 'LOAD_ACCEPT_SUCCEED', 'LOAD_ACCEPT_FAIL',
  'RELOAD_DELG_LIST',
  'ACPT_DELG', 'ACPT_DELG_SUCCEED', 'ACPT_DELG_FAIL',
  'CREATE_DELGCCB', 'CREATE_DELGCCB_SUCCEED', 'CREATE_DELGCCB_FAIL',
  'LOAD_DELG', 'LOAD_DELG_SUCCEED', 'LOAD_DELG_FAIL',
  'EDIT_DELGCCB', 'EDIT_DELGCCB_SUCCEED', 'EDIT_DELGCCB_FAIL',
  'SET_CLIENT_FORM', 'NEW_FORM',
  // 'SEARCH_PARAM', 'SEARCH_PARAM_SUCCEED', 'SEARCH_PARAM_FAIL',
  'DEL_DELG', 'DEL_DELG_SUCCEED', 'DEL_DELG_FAIL',
  'LOAD_REQUIRE', 'LOAD_REQUIRE_SUCCEED', 'LOAD_REQUIRE_FAIL',
  'ENSURE_MANIFESTMETA', 'ENSURE_MANIFESTMETA_SUCCEED', 'ENSURE_MANIFESTMETA_FAIL',
  'OPEN_EF_MODAL', 'CLOSE_EF_MODAL', 'SET_DISP_STATUS',
  'LOAD_DELGDISP', 'LOAD_DELGDISP_SUCCEED', 'LOAD_DELGDISP_FAIL',
  'DELG_DISP_SAVE', 'DELG_DISP_SAVE_SUCCEED', 'DELG_DISP_SAVE_FAIL',
  'DEL_DISP', 'DEL_DISP_SUCCEED', 'DEL_DISP_FAIL',
  // 'LOAD_DISP', 'LOAD_DISP_SUCCEED', 'LOAD_DISP_FAIL',
  'LOAD_CIQ', 'LOAD_CIQ_SUCCEED', 'LOAD_CIQ_FAIL',
  'OPEN_CIQ_MODAL', 'CLOSE_CIQ_MODAL',
  'FILL_CUSTOMSNO', 'FILL_CUSTOMSNO_SUCCEED', 'FILL_CUSTOMSNO_FAIL',
  'CIQ_FINISH_SET', 'CIQ_FINISH_SET_SUCCEED', 'CIQ_FINISH_SET_FAIL',
  // 'LOAD_CIQSUB', 'LOAD_CIQSUB_SUCCEED', 'LOAD_CIQSUB_FAIL',
  'SHOW_DISPMODAL', 'SHOW_DISPMODAL_SUCCEED', 'SHOW_DISPMODAL_FAILED',
  'CIQ_DISP_SAVE', 'CIQ_DISP_SAVE_SUCCEED', 'CIQ_DISP_SAVE_FAIL',
  'RECALL_DELG_ASSIGN', 'RECALL_DELG_ASSIGN_SUCCEED', 'RECALL_DELG_ASSIGN_FAILED',
]);

const initialState = {
  delegationsReload: false,
  delegationlist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  ciqlist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  listFilter: {
    sortField: '',
    sortOrder: '',
    status: 'all',
    viewStatus: 'all',
    ietype: 'all',
    filterNo: '',
    clientView: { tenantIds: [], partnerIds: [] },
    acptDate: [],
  },
  formRequire: {
    clients: [],
    tradeModes: [],
    transModes: [],
    customs: [],
  },
  formData: {
    customer_tenant_id: -1,
    customer_partner_id: -1,
    create_time: null,
  },
  delgFiles: [],
  submitting: false,
  delegateListFilter: {
    sortField: '',
    sortOrder: '',
    status: 'unaccepted',
  },
  sendPanel: {
    visible: false,
    delegations: [],
  },
  visibleEfModal: false,
  efModal: {
    entryHeadId: -1,
    billSeqNo: '',
    delgNo: '',
  },
  visibleCiqModal: false,
  ciqModal: {
    delgNo: '',
  },
  assign: {
    delgDisp: {},
    dispatch: {},
    partners: [],
    ciqSups: [],
    delgDispShow: false,
    ciqDispShow: false,
  },
  suppliers: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_ACCEPT:
      return { ...state,
        delegationlist: { ...state.delegationlist, loading: true },
        delegationsReload: false,
        listFilter: JSON.parse(action.params.filter) };
    case actionTypes.LOAD_ACCEPT_SUCCEED: {
      return { ...state, delegationlist: { ...action.result.data, loading: false } };
    }
    case actionTypes.LOAD_ACCEPT_FAIL:
      return { ...state, delegationlist: { ...state.delegationlist, loading: false } };
    case actionTypes.RELOAD_DELG_LIST:
      return { ...state, delegationsReload: true };
    case actionTypes.LOAD_CIQ:
      return { ...state,
        ciqlist: { ...state.ciqlist, loading: true },
        listFilter: JSON.parse(action.params.filter) };
    case actionTypes.LOAD_CIQ_SUCCEED: {
      return { ...state, ciqlist: { ...action.result.data, loading: false } };
    }
    case actionTypes.LOAD_CIQ_FAIL:
      return { ...state, ciqlist: { ...state.ciqlist, loading: false } };
    case actionTypes.LOAD_DELG:
      return { ...state, formData: initialState.formData, delgFiles: [] };
    case actionTypes.LOAD_DELG_SUCCEED:
      return { ...state,
        formData: action.result.data.delegation,
        delgFiles: action.result.data.files,
        formRequire: action.result.data.formRequire,
      };
    // case actionTypes.SEARCH_PARAM_SUCCEED:
    //   return { ...state, formRequire: { ...state.formRequire, ...action.result.data } };
    case actionTypes.SET_CLIENT_FORM:
      return { ...state, formData: { ...state.formData, ...action.data } };
    case actionTypes.NEW_FORM:
      return { ...state, formData: { ...initialState.formData, create_time: new Date() } };
    case actionTypes.LOAD_REQUIRE_SUCCEED:
      return { ...state,
        formRequire: action.result.data,
        formData: initialState.formData,
        delgFiles: initialState.delgFiles };
    case actionTypes.CREATE_DELGCCB:
    case actionTypes.EDIT_DELGCCB:
      return { ...state, submitting: true };
    case actionTypes.EDIT_DELGCCB_SUCCEED:
    case actionTypes.CREATE_DELGCCB_SUCCEED:
    case actionTypes.EDIT_DELGCCB_FAIL:
    case actionTypes.CREATE_DELGCCB_FAIL:
      return { ...state, submitting: false };
    case actionTypes.SHOW_DISPMODAL_SUCCEED:
      return { ...state,
        assign: {
          ...state.assign,
          delgDisp: action.result.data.delegation,
          dispatch: action.result.data.dispatch,
          partners: action.result.data.partners,
          ciqSups: action.result.data.ciqSups,
          delgDispShow: true },
      };
    case actionTypes.OPEN_EF_MODAL:
      return { ...state, visibleEfModal: true, efModal: action.data };
    case actionTypes.CLOSE_EF_MODAL:
      return { ...state, visibleEfModal: false, efModal: initialState.efModal };
    case actionTypes.OPEN_CIQ_MODAL:
      return { ...state, visibleCiqModal: true, ciqModal: action.data };
    case actionTypes.CLOSE_CIQ_MODAL:
      return { ...state, visibleCiqModal: false, ciqModal: initialState.ciqModal };
    case actionTypes.SET_DISP_STATUS:
      return { ...state, assign: { ...state.assign, ...action.data } };
    // case actionTypes.LOAD_DELGDISP:
    //   return { ...state, delgDisp: initialState.delegation,
    //     dispatch: initialState.dispatch, partners: initialState.partners };
    // case actionTypes.LOAD_DELGDISP_SUCCEED:
    //   return { ...state, delgDisp: action.result.data.delegation, saved: false,
    //     dispatch: action.result.data.dispatch, partners: action.result.data.partners };
    // case actionTypes.LOAD_DISP_SUCCEED:
    //   return { ...state, assign: { ...state.assign, delgDisp: action.result.data.delegation,
    //     dispatch: action.result.data.dispatch, delgDispShow: true, saved: true } };
    // case actionTypes.BROKERS_LOAD_SUCCEED:
    //   return { ...state, brokers: action.result.data.brokers };
    case actionTypes.LOAD_PARTNERS_SUCCEED:
      return { ...state, assign: { ...state.assign, ciqSups: action.result.data } };
    default:
      return state;
  }
}

export function delgAssignRecall(delgNo, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RECALL_DELG_ASSIGN,
        actionTypes.RECALL_DELG_ASSIGN_SUCCEED,
        actionTypes.RECALL_DELG_ASSIGN_FAILED,
      ],
      endpoint: 'v1/cms/delegation/assignment/recall',
      method: 'get',
      params: { delgNo, tenantId },
    },
  };
}

export function loadciqSups(tenantId, type) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARTNERS,
        actionTypes.LOAD_PARTNERS_SUCCEED,
        actionTypes.LOAD_PARTNERS_FAIL,
      ],
      endpoint: 'v1/cms/delegation/getciqSups',
      method: 'post',
      data: { tenantId, type },
    },
  };
}

// export function loadCiqSubTable(params) {
//   return {
//     [CLIENT_API]: {
//       types: [
//         actionTypes.LOAD_CIQSUB,
//         actionTypes.LOAD_CIQSUB_SUCCEED,
//         actionTypes.LOAD_CIQSUB_FAIL,
//       ],
//       endpoint: 'v1/cms/ciq/bills',
//       method: 'get',
//       params,
//     },
//   };
// }

export function setCiqFinish(delgNo) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CIQ_FINISH_SET, actionTypes.CIQ_FINISH_SET_SUCCEED, actionTypes.CIQ_FINISH_SET_FAIL],
      endpoint: 'v1/cms/set/ciq/finish',
      method: 'get',
      params: { delgNo },
    },
  };
}

// export function loadCertBrokers(tenantId) {
//   return {
//     [CLIENT_API]: {
//       types: [actionTypes.BROKERS_LOAD, actionTypes.BROKERS_LOAD_SUCCEED, actionTypes.BROKERS_LOAD_FAIL],
//       endpoint: 'v1/cms/cert/brokers',
//       method: 'get',
//       params: { tenantId },
//     },
//   };
// }

export function loadDelegationList(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ACCEPT,
        actionTypes.LOAD_ACCEPT_SUCCEED,
        actionTypes.LOAD_ACCEPT_FAIL,
      ],
      endpoint: 'v1/cms/delegations',
      method: 'get',
      params,
    },
  };
}

export function reloadDelegationList() {
  return {
    type: actionTypes.RELOAD_DELG_LIST,
  };
}

export function loadCiqTable(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CIQ,
        actionTypes.LOAD_CIQ_SUCCEED,
        actionTypes.LOAD_CIQ_FAIL,
      ],
      endpoint: 'v1/cms/load/ciq',
      method: 'get',
      params,
    },
  };
}

export function ensureManifestMeta(delger) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ENSURE_MANIFESTMETA,
        actionTypes.ENSURE_MANIFESTMETA_SUCCEED,
        actionTypes.ENSURE_MANIFESTMETA_FAIL,
      ],
      endpoint: 'v1/cms/manifest/meta',
      method: 'post',
      data: delger,
    },
  };
}

export function setDispStatus(params) {
  return {
    type: actionTypes.SET_DISP_STATUS,
    data: params,
  };
}
export function loadDelgDisp(delgNo, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DELGDISP,
        actionTypes.LOAD_DELGDISP_SUCCEED,
        actionTypes.LOAD_DELGDISP_FAIL,
      ],
      endpoint: 'v1/cms/loadDelgDisp',
      method: 'get',
      params: { delgNo, tenantId },
    },
  };
}

// export function loadDisp(delgNo, tenantId) {
//   return {
//     [CLIENT_API]: {
//       types: [
//         actionTypes.LOAD_DISP,
//         actionTypes.LOAD_DISP_SUCCEED,
//         actionTypes.LOAD_DISP_FAIL,
//       ],
//       endpoint: 'v1/cms/loadDisp',
//       method: 'get',
//       params: { delgNo, tenantId },
//     },
//   };
// }

export function ciqDispSave(dispatch, ciqSup) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CIQ_DISP_SAVE,
        actionTypes.CIQ_DISP_SAVE_SUCCEED,
        actionTypes.CIQ_DISP_SAVE_FAIL,
      ],
      endpoint: 'v1/cms/ciq/dispsave',
      method: 'post',
      data: { dispatch, ciqSup },
    },
  };
}

export function delgDispSave(delgDisp, dispatch, partner, ciqSup, loginId, loginName) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELG_DISP_SAVE,
        actionTypes.DELG_DISP_SAVE_SUCCEED,
        actionTypes.DELG_DISP_SAVE_FAIL,
      ],
      endpoint: 'v1/cms/delegation/dispsave',
      method: 'post',
      data: { delgDisp, dispatch, partner, ciqSup, loginId, loginName },
    },
  };
}

export function delDisp(delgDisp, dispatch, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DEL_DISP,
        actionTypes.DEL_DISP_SUCCEED,
        actionTypes.DEL_DISP_FAIL,
      ],
      endpoint: 'v1/cms/dispatch/del',
      method: 'post',
      data: { delgDisp, dispatch, tenantId },
    },
  };
}

export function acceptDelg(loginId, loginName, dispIds, delgNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ACPT_DELG,
        actionTypes.ACPT_DELG_SUCCEED,
        actionTypes.ACPT_DELG_FAIL,
      ],
      method: 'post',
      endpoint: 'v1/cms/delegation/accept',
      data: { loginId, loginName, dispIds, delgNo },
    },
  };
}

export function createDelegationByCCB({
  delegation, tenantId, loginId, username,
  ietype, source, tenantName, attachments,
  accepted,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_DELGCCB,
        actionTypes.CREATE_DELGCCB_SUCCEED,
        actionTypes.CREATE_DELGCCB_FAIL,
      ],
      endpoint: 'v1/cms/ccb/delegation',
      method: 'post',
      data: {
        delegation,
        tenantId,
        loginId,
        username,
        ietype,
        source,
        tenantName,
        attachments,
        accepted,
      },
    },
  };
}

export function loadDelg(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DELG,
        actionTypes.LOAD_DELG_SUCCEED,
        actionTypes.LOAD_DELG_FAIL,
      ],
      endpoint: 'v1/cms/delegation',
      method: 'get',
      cookie,
      params: { ...params },
    },
  };
}

export function editDelegation(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_DELGCCB,
        actionTypes.EDIT_DELGCCB_SUCCEED,
        actionTypes.EDIT_DELGCCB_FAIL,
      ],
      endpoint: 'v1/cms/delegation/edit',
      method: 'post',
      data,
    },
  };
}

export function setClientForm({ customer_tenant_id, customer_partner_id }) {
  return {
    type: actionTypes.SET_CLIENT_FORM,
    data: { customer_tenant_id, customer_partner_id },
  };
}

// export function searchParams(field, searched, tenantId, ieType) {
//   return {
//     [CLIENT_API]: {
//       types: [
//         actionTypes.SEARCH_PARAM,
//         actionTypes.SEARCH_PARAM_SUCCEED,
//         actionTypes.SEARCH_PARAM_FAIL,
//       ],
//       endpoint: 'v1/cms/delegation/params',
//       method: 'get',
//       params: { tenantId, searched, field, ieType },
//     },
//   };
// }

export function delDelg(delgNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DEL_DELG,
        actionTypes.DEL_DELG_SUCCEED,
        actionTypes.DEL_DELG_FAIL,
      ],
      endpoint: 'v1/cms/delegation/del',
      method: 'post',
      data: { delgNo },
    },
  };
}

export function loadNewForm() {
  return {
    type: actionTypes.NEW_FORM,
  };
}

export function loadFormRequire(tenantId, ieType) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_REQUIRE,
        actionTypes.LOAD_REQUIRE_SUCCEED,
        actionTypes.LOAD_REQUIRE_FAIL,
      ],
      endpoint: 'v1/cms/delegation/form/requires',
      method: 'get',
      params: { tenantId, ieType },
    },
  };
}

export function showDispModal(delgNo, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SHOW_DISPMODAL,
        actionTypes.SHOW_DISPMODAL_SUCCEED,
        actionTypes.SHOW_DISPMODAL_FAILED,
      ],
      endpoint: 'v1/cms/loadDelgDisp',
      method: 'get',
      params: { delgNo, tenantId },
    },
  };
}

export function openEfModal({ entryHeadId, delgNo, billSeqNo }) {
  return {
    type: actionTypes.OPEN_EF_MODAL,
    data: { entryHeadId, delgNo, billSeqNo },
  };
}
export function openCiqModal({ entryHeadId, delgNo }) {
  return {
    type: actionTypes.OPEN_CIQ_MODAL,
    data: { entryHeadId, delgNo },
  };
}

export function closeEfModal() {
  return {
    type: actionTypes.CLOSE_EF_MODAL,
  };
}
export function closeCiqModal() {
  return {
    type: actionTypes.CLOSE_CIQ_MODAL,
  };
}

export function fillCustomsNo({ entryNo, entryHeadId, delgNo }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FILL_CUSTOMSNO,
        actionTypes.FILL_CUSTOMSNO_SUCCEED,
        actionTypes.FILL_CUSTOMSNO_FAIL,
      ],
      endpoint: 'v1/cms/fill/customsno',
      method: 'post',
      data: { entryNo, entryHeadId, delgNo },
    },
  };
}
