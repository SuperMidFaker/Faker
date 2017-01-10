import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/delegation/', [
  'LOAD_PARTNERS', 'LOAD_PARTNERS_SUCCEED', 'LOAD_PARTNERS_FAIL',
  'LOAD_ACCEPT', 'LOAD_ACCEPT_SUCCEED', 'LOAD_ACCEPT_FAIL',
  'OPEN_ACCEPT_MODAL', 'CLOSE_ACCEPT_MODAL',
  'LOAD_DELGOPERATOR', 'LOAD_DELGOPERATOR_SUCCEED', 'LOAD_DELGOPERATOR_FAIL',
  'ACPT_DELG', 'ACPT_DELG_SUCCEED', 'ACPT_DELG_FAIL',
  'CREATE_DELGCCB', 'CREATE_DELGCCB_SUCCEED', 'CREATE_DELGCCB_FAIL',
  'LOAD_DELG', 'LOAD_DELG_SUCCEED', 'LOAD_DELG_FAIL',
  'EDIT_DELGCCB', 'EDIT_DELGCCB_SUCCEED', 'EDIT_DELGCCB_FAIL',
  'SET_CLIENT_FORM', 'NEW_FORM',
  'SEARCH_PARAM', 'SEARCH_PARAM_SUCCEED', 'SEARCH_PARAM_FAIL',
  'DEL_DELG', 'DEL_DELG_SUCCEED', 'DEL_DELG_FAIL',
  'LOAD_REQUIRE', 'LOAD_REQUIRE_SUCCEED', 'LOAD_REQUIRE_FAIL',
  'LOAD_DELEGATE', 'LOAD_DELEGATE_SUCCEED', 'LOAD_DELEGATE_FAIL',
  'SEND_DELEGATE', 'SEND_DELEGATE_SUCCEED', 'SEND_DELEGATE_FAIL',
  'SHOW_SEND_DELEGATE_MODAL', 'SHOW_SEND_DELEGATE_MODAL_SUCCEED', 'SHOW_SEND_DELEGATE_MODAL_FAIL',
  'SHOW_PREVIEWER', 'SHOW_PREVIEWER_SUCCEED', 'SHOW_PREVIEWER_FAILED',
  'HIDE_PREVIEWER', 'LOAD_SUBDELG', 'LOAD_SUBDELG_SUCCEED', 'LOAD_SUBDELG_FAIL',
  'LOAD_BILLMAKE', 'LOAD_BILLMAKE_SUCCEED', 'LOAD_BILLMAKE_FAIL', 'SET_MODAL_FALSE',
  'OPEN_EF_MODAL', 'CLOSE_EF_MODAL', 'SET_DISP_STATUS',
  'FILL_ENTRYNO', 'FILL_ENTRYNO_SUCCEED', 'FILL_ENTRYNO_FAIL',
  'LOAD_DELGDISP', 'LOAD_DELGDISP_SUCCEED', 'LOAD_DELGDISP_FAIL',
  'DELG_DISP_SAVE', 'DELG_DISP_SAVE_SUCCEED', 'DELG_DISP_SAVE_FAIL',
  'DEL_DISP', 'DEL_DISP_SUCCEED', 'DEL_DISP_FAIL',
  'LOAD_DISP', 'LOAD_DISP_SUCCEED', 'LOAD_DISP_FAIL', 'SET_PREW_STATUS',
  'LOAD_CIQ', 'LOAD_CIQ_SUCCEED', 'LOAD_CIQ_FAIL', 'SET_PREW_TABKEY',
  'OPEN_CIQ_MODAL', 'CLOSE_CIQ_MODAL',
  'FILL_CUSTOMSNO', 'FILL_CUSTOMSNO_SUCCEED', 'FILL_CUSTOMSNO_FAIL',
  'LOAD_DECLWAY', 'LOAD_DECLWAY_SUCCEED', 'LOAD_DECLWAY_FAIL',
  'MATCH_QUOTE', 'MATCH_QUOTE_SUCCEED', 'MATCH_QUOTE_FAIL',
  'LOAD_CERT', 'LOAD_CERT_SUCCEED', 'LOAD_CERT_FAIL',
  'LOAD_MQPARAM', 'LOAD_MQPARAM_SUCCEED', 'LOAD_MQPARAM_FAIL',
  'MATCH_CIQ_QUOTE', 'MATCH_CIQ_QUOTE_SUCCEED', 'MATCH_CIQ_QUOTE_FAIL',
  'CIQ_FINISH_SET', 'CIQ_FINISH_SET_SUCCEED', 'CIQ_FINISH_SET_FAIL',
  'LOAD_CIQSUB', 'LOAD_CIQSUB_SUCCEED', 'LOAD_CIQSUB_FAIL',
  'LOAD_DELG_PANEL', 'LOAD_DELG_PANEL_SUCCEED', 'LOAD_DELG_PANEL_FAILED',
  'SHOW_DISPMODAL', 'SHOW_DISPMODAL_SUCCEED', 'SHOW_DISPMODAL_FAILED',
  'SET_OPERATOR', 'SET_OPERATOR_SUCCEED', 'SET_OPERATOR_FAIL',
  'CIQ_DISP_SAVE', 'CIQ_DISP_SAVE_SUCCEED', 'CIQ_DISP_SAVE_FAIL',
  'UPDATE_BLNO', 'UPDATE_BLNO_SUCCEED', 'UPDATE_BLNO_FAIL',
  'UPDATE_CERT_PARAM', 'UPDATE_CERT_PARAM_SUCCEED', 'UPDATE_CERT_PARAM_FAIL',
  'RECALL_DELG_ASSIGN', 'RECALL_DELG_ASSIGN_SUCCEED', 'RECALL_DELG_ASSIGN_FAILED',
]);

const initialState = {
  listView: 'delegation',
  delegationlist: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: [],
  },
  ciqlist: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: [],
  },
  certlist: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: [],
  },
  delgBillsMap: {
  },
  ciqBillsMap: {
  },
  ciqBills: [{
    decl_way_code: '',
    manual_no: '',
    pack_count: null,
    gross_wt: null,
  }],
  listFilter: {
    sortField: '',
    sortOrder: '',
    status: 'all',
    viewStatus: 'my',
  },
  formRequire: {
    clients: [],
    tradeModes: [],
    transModes: [],
    declareWayModes: [],
  },
  formData: {
    customer_tenant_id: -1,
    customer_partner_id: -1,
    create_time: null,
  },
  delgFiles: [],
  delgBills: [{
    decl_way_code: '',
    manual_no: '',
    pack_count: null,
    gross_wt: null,
  }],
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
  acceptModal: {
    visible: false,
    tenantId: 0,
    delgDispIds: [],
    delgOperators: [],
  },
  previewer: {
    visible: false,
    tabKey: 'basic',
    delegation: {},
    files: [],
    delgDispatch: {},
    activities: [],
  },
  preStatus: '',
  billMakeModal: {
    visible: false,
    type: 'make',
    bills: [],
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
    saved: false,
  },
  matchParam: {},
  matchStatus: {},
  cMQParams: [],
  brokers: [],
  relatedDisps: [],
  suppliers: [],
  delgPanel: {
    bills: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_ACCEPT:
      return { ...state, delegationlist: { ...state.delegationlist, loading: true },
        listView: 'delegation', listFilter: JSON.parse(action.params.filter) };
    case actionTypes.LOAD_ACCEPT_SUCCEED: {
      const delgBillsMap = {};
      const delgList = action.result.data;
      delgList.data.forEach((delg) => {
        delgBillsMap[delg.delg_no] = [];
      });
      return { ...state, delegationlist: { ...state.delegationlist, loading: false,
        ...delgList }, delgBillsMap };
    }
    case actionTypes.LOAD_ACCEPT_FAIL:
      return { ...state, delegationlist: { ...state.delegationlist, loading: false }, delgBillsMap: {} };
    case actionTypes.LOAD_CIQ:
      return { ...state, ciqlist: { ...state.ciqlist, loading: true }, listView: 'ciq',
        listFilter: JSON.parse(action.params.filter) };
    case actionTypes.LOAD_CIQ_SUCCEED: {
      const ciqBillsMap = {};
      const ciqList = action.result.data;
      ciqList.data.forEach((delg) => {
        ciqBillsMap[delg.delg_no] = [];
      });
      return { ...state, ciqlist: { ...action.result.data, loading: false }, ciqBillsMap };
    }
    case actionTypes.LOAD_CIQ_FAIL:
      return { ...state, ciqlist: { ...state.ciqlist, loading: false }, ciqBillsMap: {} };
    case actionTypes.LOAD_CERT_SUCCEED: {
      return { ...state, certlist: { ...action.result.data, loading: false }, listFilter: JSON.parse(action.params.filter) };
    }
    case actionTypes.LOAD_SUBDELG: {
      const delgBillsMap = { ...state.delgBillsMap };
      delgBillsMap[action.params.delg_no] = [];
      delgBillsMap[action.params.delg_no].loading = true;
      return { ...state, delgBillsMap };
    }
    case actionTypes.LOAD_SUBDELG_SUCCEED: {
      const delgBillsMap = { ...state.delgBillsMap };
      delgBillsMap[action.params.delg_no] = action.result.data;
      delgBillsMap[action.params.delg_no].loading = false;
      return { ...state, delgBillsMap };
    }
    case actionTypes.LOAD_SUBDELG_FAIL: {
      const delgBillsMap = { ...state.delgBillsMap };
      delgBillsMap[action.params.delg_no] = [];
      delgBillsMap[action.params.delg_no].loading = false;
      return { ...state, delgBillsMap };
    }
    case actionTypes.LOAD_CIQSUB: {
      const ciqBillsMap = { ...state.ciqBillsMap };
      ciqBillsMap[action.params.delg_no] = [];
      ciqBillsMap[action.params.delg_no].loading = true;
      return { ...state, ciqBillsMap };
    }
    case actionTypes.LOAD_CIQSUB_SUCCEED: {
      const ciqBillsMap = { ...state.ciqBillsMap };
      ciqBillsMap[action.params.delg_no] = action.result.data;
      ciqBillsMap[action.params.delg_no].loading = false;
      return { ...state, ciqBillsMap };
    }
    case actionTypes.LOAD_CIQSUB_FAIL: {
      const ciqBillsMap = { ...state.ciqBillsMap };
      ciqBillsMap[action.params.delg_no] = [];
      ciqBillsMap[action.params.delg_no].loading = false;
      return { ...state, ciqBillsMap };
    }
    case actionTypes.LOAD_BILLMAKE:
      return { ...state, billMakeModal: { ...state.billMakeModal, visible: false, type: action.modalType } };
    case actionTypes.LOAD_BILLMAKE_SUCCEED: {
      return { ...state, billMakeModal: { ...state.billMakeModal, visible: true, ...action.result.data } };
    }
    case actionTypes.SET_MODAL_FALSE:
      return { ...state, billMakeModal: initialState.billMakeModal };
    case actionTypes.LOAD_DELEGATE_SUCCEED:
      return { ...state, delegationlist: { ...state.delegationlist, loading: false,
        ...action.result.data }, delegateListFilter: JSON.parse(action.params.filter) };
    case actionTypes.LOAD_DELG:
      return { ...state, formData: initialState.formData, delgFiles: [] };
    case actionTypes.LOAD_DELG_SUCCEED:
      return { ...state, formData: action.result.data.delegation,
        delgFiles: action.result.data.files, delgBills: action.result.data.delgBills.rows, formRequire: action.result.data.formRequire,
      };
    case actionTypes.SEARCH_PARAM_SUCCEED:
      return { ...state, formRequire: { ...state.formRequire, ...action.result.data } };
    case actionTypes.SET_CLIENT_FORM:
      return { ...state, formData: { ...state.formData, ...action.data } };
    case actionTypes.NEW_FORM:
      return { ...state, formData: { ...initialState.formData, create_time: new Date() } };
    case actionTypes.LOAD_REQUIRE_SUCCEED:
      return { ...state, formRequire: action.result.data, formData: initialState.formData,
        delgFiles: initialState.delgFiles, delgBills: initialState.delgBills };
    case actionTypes.CREATE_DELGCCB:
    case actionTypes.EDIT_DELGCCB:
      return { ...state, submitting: true };
    case actionTypes.EDIT_DELGCCB_SUCCEED:
    case actionTypes.CREATE_DELGCCB_SUCCEED:
    case actionTypes.EDIT_DELGCCB_FAIL:
    case actionTypes.CREATE_DELGCCB_FAIL:
      return { ...state, submitting: false };
    case actionTypes.SEND_DELEGATE_SUCCEED:
      return { ...state, sendPanel: initialState.sendPanel };
    case actionTypes.SHOW_SEND_DELEGATE_MODAL_SUCCEED:
      if (action.visible) {
        return { ...state, sendPanel: { visible: action.visible, delegations: action.delegations }, suppliers: action.result.data };
      } else {
        return { ...state, sendPanel: { ...initialState.sendPanel, visible: action.visible } };
      }
    case actionTypes.SHOW_PREVIEWER_SUCCEED: {
      let tabKey = 'customsDecl';
      if (action.result.data.delgDispatch.status === 0) {
        tabKey = 'basic';
      }
      return { ...state, previewer: {
        ...state.previewer,
        tabKey: action.payload.tabKey || tabKey,
        visible: action.visible,
        delgNo: action.payload.delgNo,
        ...action.result.data }, preStatus: '' };
    }
    case actionTypes.SHOW_DISPMODAL_SUCCEED:
      return { ...state, assign: {
        ...state.assign, delgDisp: action.result.data.delegation,
        dispatch: action.result.data.dispatch, partners: action.result.data.partners,
        ciqSups: action.result.data.ciqSups, delgDispShow: true, saved: false },
      };
    case actionTypes.HIDE_PREVIEWER:
      return { ...state, previewer: { ...state.previewer, visible: action.visible } };
    case actionTypes.LOAD_DELG_PANEL_SUCCEED:
      return { ...state, delgPanel: action.result.data };
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
    case actionTypes.LOAD_DISP_SUCCEED:
      return { ...state, assign: { ...state.assign, delgDisp: action.result.data.delegation,
        dispatch: action.result.data.dispatch, delgDispShow: true, saved: true } };
    case actionTypes.SET_PREW_STATUS:
      return { ...state, ...action.data };
    case actionTypes.SET_PREW_TABKEY:
      return { ...state, previewer: { ...state.previewer, tabKey: action.data } };
    case actionTypes.LOAD_DECLWAY_SUCCEED:
      return { ...state, matchParam: action.result.data };
    case actionTypes.MATCH_QUOTE_SUCCEED:
      return { ...state, matchStatus: action.result.data };
    case actionTypes.LOAD_MQPARAM_SUCCEED:
      return { ...state, cMQParams: action.result.data };
    case actionTypes.BROKERS_LOAD_SUCCEED:
      return { ...state, brokers: action.result.data.brokers };
    case actionTypes.OPEN_ACCEPT_MODAL:
      return { ...state, acceptModal: { visible: true, ...action.data } };
    case actionTypes.CLOSE_ACCEPT_MODAL:
      return { ...state, acceptModal: { visible: false } };
    case actionTypes.LOAD_DELGOPERATOR_SUCCEED:
      return { ...state, acceptModal: { ...state.acceptModal, operators: action.result.data } };
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

export function updateCertParam(delgNo, dispId, cert, qty) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_CERT_PARAM,
        actionTypes.UPDATE_CERT_PARAM_SUCCEED,
        actionTypes.UPDATE_CERT_PARAM_FAIL,
      ],
      endpoint: 'v1/cms/delegation/update/certParam',
      method: 'get',
      params: { delgNo, dispId, cert, qty },
      origin: 'mongo',
    },
  };
}

export function exchangeBlNo(delgNo, blNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_BLNO,
        actionTypes.UPDATE_BLNO_SUCCEED,
        actionTypes.UPDATE_BLNO_FAIL,
      ],
      endpoint: 'v1/cms/delegation/exchange',
      method: 'post',
      data: { delgNo, blNo },
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

export function loadCiqSubTable(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CIQSUB,
        actionTypes.LOAD_CIQSUB_SUCCEED,
        actionTypes.LOAD_CIQSUB_FAIL,
      ],
      endpoint: 'v1/cms/ciq/bills',
      method: 'get',
      params,
    },
  };
}

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

export function loadAcceptanceTable(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ACCEPT,
        actionTypes.LOAD_ACCEPT_SUCCEED,
        actionTypes.LOAD_ACCEPT_FAIL,
      ],
      endpoint: 'v1/cms/acceptance/delegations',
      method: 'get',
      params,
    },
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
export function loadCertTable(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CERT,
        actionTypes.LOAD_CERT_SUCCEED,
        actionTypes.LOAD_CERT_FAIL,
      ],
      endpoint: 'v1/cms/load/cert',
      method: 'get',
      params,
    },
  };
}
export function loadDeclareWay(row) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DECLWAY,
        actionTypes.LOAD_DECLWAY_SUCCEED,
        actionTypes.LOAD_DECLWAY_FAIL,
      ],
      endpoint: 'v1/cms/load/declareWay',
      method: 'get',
      params: row,
    },
  };
}
export function matchQuote(param) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.MATCH_QUOTE,
        actionTypes.MATCH_QUOTE_SUCCEED,
        actionTypes.MATCH_QUOTE_FAIL,
      ],
      endpoint: 'v1/cms/match/quote',
      method: 'post',
      data: param,
      origin: 'mongo',
    },
  };
}
export function loadCMQParams(tenantId, delgNo, type) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_MQPARAM,
        actionTypes.LOAD_MQPARAM_SUCCEED,
        actionTypes.LOAD_MQPARAM_FAIL,
      ],
      endpoint: 'v1/cms/load/mqParams',
      method: 'get',
      params: { tenantId, delgNo, type },
    },
  };
}

export function matchCQuote(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.MATCH_CIQ_QUOTE,
        actionTypes.MATCH_CIQ_QUOTE_SUCCEED,
        actionTypes.MATCH_CIQ_QUOTE_FAIL,
      ],
      endpoint: 'v1/cms/match/ciq/quote',
      method: 'post',
      data: params,
      origin: 'mongo',
    },
  };
}

export function loadSubdelgsTable(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SUBDELG,
        actionTypes.LOAD_SUBDELG_SUCCEED,
        actionTypes.LOAD_SUBDELG_FAIL,
      ],
      endpoint: 'v1/cms/subdelgs',
      method: 'get',
      params,
    },
  };
}

export function loadBillMakeModal(params, type) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILLMAKE,
        actionTypes.LOAD_BILLMAKE_SUCCEED,
        actionTypes.LOAD_BILLMAKE_FAIL,
      ],
      endpoint: 'v1/cms/billmodal',
      method: 'get',
      params,
      modalType: type,
    },
  };
}
export function setPreviewTabkey(tabkey) {
  return {
    type: actionTypes.SET_PREW_TABKEY,
    data: tabkey,
  };
}

export function setPreviewStatus(status) {
  return {
    type: actionTypes.SET_PREW_STATUS,
    data: status,
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

export function loadDisp(delgNo, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DISP,
        actionTypes.LOAD_DISP_SUCCEED,
        actionTypes.LOAD_DISP_FAIL,
      ],
      endpoint: 'v1/cms/loadDisp',
      method: 'get',
      params: { delgNo, tenantId },
    },
  };
}

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

export function delgDispSave(delgDisp, dispatch, partner, ciqSup) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELG_DISP_SAVE,
        actionTypes.DELG_DISP_SAVE_SUCCEED,
        actionTypes.DELG_DISP_SAVE_FAIL,
      ],
      endpoint: 'v1/cms/delegation/dispsave',
      method: 'post',
      data: { delgDisp, dispatch, partner, ciqSup },
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

export function closeBillMakeModal() {
  return {
    type: actionTypes.SET_MODAL_FALSE,
  };
}

export function loadDelegateTable(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DELEGATE,
        actionTypes.LOAD_DELEGATE_SUCCEED,
        actionTypes.LOAD_DELEGATE_FAIL,
      ],
      endpoint: 'v1/cms/delegate/delegations',
      method: 'get',
      params,
      cookie,
    },
  };
}

export function loadDelgOperators(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DELGOPERATOR,
        actionTypes.LOAD_DELGOPERATOR_SUCCEED,
        actionTypes.LOAD_DELGOPERATOR_FAIL,
      ],
      endpoint: 'v1/cms/delegate/operators',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function openAcceptModal(modal) {
  return {
    type: actionTypes.OPEN_ACCEPT_MODAL,
    data: modal,
  };
}

export function closeAcceptModal() {
  return {
    type: actionTypes.CLOSE_ACCEPT_MODAL,
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

export function setOpetaor(loginId, loginName, dispIds) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SET_OPERATOR,
        actionTypes.SET_OPERATOR_SUCCEED,
        actionTypes.SET_OPERATOR_FAIL,
      ],
      method: 'post',
      endpoint: 'v1/cms/delegation/set/operator',
      data: { loginId, loginName, dispIds },
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
        delegation, tenantId, loginId, username,
        ietype, source, tenantName, attachments,
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

export function toggleSendDelegateModal(visible = true, params = {}, delegations = []) {
  if (visible) {
    return {
      [CLIENT_API]: {
        types: [
          actionTypes.SHOW_SEND_DELEGATE_MODAL,
          actionTypes.SHOW_SEND_DELEGATE_MODAL_SUCCEED,
          actionTypes.SHOW_SEND_DELEGATE_MODAL_FAIL,
        ],
        endpoint: 'v1/cms/suppliers',
        method: 'get',
        params,
        visible,
        delegations,
      },
    };
  } else {
    return {
      type: actionTypes.SHOW_SEND_DELEGATE_MODAL_SUCCEED,
      visible,
    };
  }
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

export function searchParams(field, searched, tenantId, ieType) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEARCH_PARAM,
        actionTypes.SEARCH_PARAM_SUCCEED,
        actionTypes.SEARCH_PARAM_FAIL,
      ],
      endpoint: 'v1/cms/delegation/params',
      method: 'get',
      params: { tenantId, searched, field, ieType },
    },
  };
}

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

export function loadFormRequire(cookie, tenantId, ieType) {
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
      cookie,
    },
  };
}

export function sendDelegate(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEND_DELEGATE,
        actionTypes.SEND_DELEGATE_SUCCEED,
        actionTypes.SEND_DELEGATE_FAIL,
      ],
      endpoint: 'v1/cms/delegation/send',
      method: 'post',
      data,
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

export function showPreviewer(tenantId, delgNo, tabKey) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SHOW_PREVIEWER,
        actionTypes.SHOW_PREVIEWER_SUCCEED,
        actionTypes.SHOW_PREVIEWER_FAILED,
      ],
      endpoint: 'v1/cms/delegate/previewer',
      method: 'get',
      params: { tenantId, delgNo },
      visible: true,
      payload: { delgNo, tabKey },
    },
  };
}

export function loadCustPanel(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DELG_PANEL,
        actionTypes.LOAD_DELG_PANEL_SUCCEED,
        actionTypes.LOAD_DELG_PANEL_FAILED,
      ],
      endpoint: 'v1/cms/delegate/load/custPanel',
      method: 'get',
      params,
    },
  };
}

export function hidePreviewer(delgNo) {
  return {
    type: actionTypes.HIDE_PREVIEWER,
    delgNo,
    visible: false,
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
export function fillEntryId({ entryNo, entryHeadId, billSeqNo, delgNo }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FILL_ENTRYNO,
        actionTypes.FILL_ENTRYNO_SUCCEED,
        actionTypes.FILL_ENTRYNO_FAIL,
      ],
      endpoint: 'v1/cms/fill/declno',
      method: 'post',
      data: { entryNo, entryHeadId, billSeqNo, delgNo },
    },
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
