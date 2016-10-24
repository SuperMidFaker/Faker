import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/delegation/', [
  'LOAD_ACCEPT', 'LOAD_ACCEPT_SUCCEED', 'LOAD_ACCEPT_FAIL',
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
  'RETURN_DELEGATE', 'RETURN_DELEGATE_SUCCEED', 'RETURN_DELEGATE_FAIL',
  'SHOW_SEND_DELEGATE_MODAL', 'SHOW_SEND_DELEGATE_MODAL_SUCCEED', 'SHOW_SEND_DELEGATE_MODAL_FAIL',
  'CUS_CREATE_DELGCCB', 'CUS_CREATE_DELGCCB_SUCCEED', 'CUS_CREATE_DELGCCB_FAIL',
  'SHOW_PREVIEWER', 'SHOW_PREVIEWER_SUCCEED', 'SHOW_PREVIEWER_FAILED',
  'HIDE_PREVIEWER', 'LOAD_SUBDELG', 'LOAD_SUBDELG_SUCCEED', 'LOAD_SUBDELG_FAIL',
  'LOAD_BILLMAKE', 'LOAD_BILLMAKE_SUCCEED', 'LOAD_BILLMAKE_FAIL', 'SET_MODAL_FALSE',
  'OPEN_EF_MODAL', 'CLOSE_EF_MODAL', 'SET_DISP_STATUS',
  'FILL_ENTRYNO', 'FILL_ENTRYNO_SUCCEED', 'FILL_ENTRYNO_FAIL',
  'LOAD_DELGDISP', 'LOAD_DELGDISP_SUCCEED', 'LOAD_DELGDISP_FAIL',
  'DELG_DISP_SAVE', 'DELG_DISP_SAVE_SUCCEED', 'DELG_DISP_SAVE_FAIL',
  'DEL_DISP', 'DEL_DISP_SUCCEED', 'DEL_DISP_FAIL',
  'LOAD_DISP', 'LOAD_DISP_SUCCEED', 'LOAD_DISP_FAIL', 'SET_SAVED_STATUS', 'SET_PREW_STATUS',
  'LOAD_CIQ', 'LOAD_CIQ_SUCCEED', 'LOAD_CIQ_FAIL',
]);

const initialState = {
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
  delgBillsMap: {
  },
  listFilter: {
    sortField: '',
    sortOrder: '',
    status: 'all',
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
  previewer: {
    visible: false,
    tabKey: 'basic',
    delegation: {},
    files: [],
    delegateTracking: {},
    clearanceTracking: [],
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
  delgDispShow: false,
  saved: false,
  delgDisp: {},
  dispatch: {},
  partners: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_ACCEPT:
      return { ...state, delegationlist: { ...state.delegationlist, loading: true } };
    case actionTypes.LOAD_ACCEPT_SUCCEED: {
      const delgBillsMap = {};
      const delgList = action.result.data;
      delgList.data.forEach((delg) => {
        delgBillsMap[delg.delg_no] = [];
      });
      return { ...state, delegationlist: { ...state.delegationlist, loading: false,
        ...delgList }, delgBillsMap, listFilter: JSON.parse(action.params.filter) };
    }
    case actionTypes.LOAD_CIQ_SUCCEED: {
      return { ...state, ciqlist: { ...action.result.data, loading: false }, listFilter: JSON.parse(action.params.filter) };
    }
    case actionTypes.LOAD_ACCEPT_FAIL:
      return { ...state, delegationlist: { ...state.delegationlist, loading: false }, delgBillsMap: {} };
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
    case actionTypes.LOAD_BILLMAKE:
      return { ...state, billMakeModal: { ...state.billMakeModal, type: action.modalType } };
    case actionTypes.LOAD_BILLMAKE_SUCCEED:
      return { ...state, billMakeModal: { ...state.billMakeModal, visible: true, ...action.result.data } };
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
      return { ...state, formRequire: action.result.data };
    case actionTypes.CREATE_DELGCCB:
    case actionTypes.EDIT_DELGCCB:
      return { ...state, submitting: true };
    case actionTypes.EDIT_DELGCCB_SUCCEED:
    case actionTypes.CREATE_DELGCCB_SUCCEED:
    case actionTypes.CUS_CREATE_DELGCCB_SUCCEED:
    case actionTypes.EDIT_DELGCCB_FAIL:
    case actionTypes.CREATE_DELGCCB_FAIL:
      return { ...state, submitting: false };
    case actionTypes.SEND_DELEGATE_SUCCEED:
      return { ...state, sendPanel: initialState.sendPanel };
    case actionTypes.RETURN_DELEGATE_SUCCEED:
      return { ...state, delegateListFilter: { ...state.delegateListFilter, status: 'undelg' } };
    case actionTypes.SHOW_SEND_DELEGATE_MODAL_SUCCEED:
      if (action.visible) {
        return { ...state, sendPanel: { visible: action.visible, delegations: action.delegations }, formRequire: action.result.data };
      } else {
        return { ...state, sendPanel: { ...initialState.sendPanel, visible: action.visible } };
      }
    case actionTypes.SHOW_PREVIEWER_SUCCEED:
      return { ...state, previewer: {
        ...state.previewer,
        visible: action.visible,
        status: action.status,
        ...action.result.data }, preStatus: '' };
    case actionTypes.HIDE_PREVIEWER:
      return { ...state, previewer: { ...state.previewer, visible: action.visible } };
    case actionTypes.OPEN_EF_MODAL:
      return { ...state, visibleEfModal: true, efModal: action.data };
    case actionTypes.CLOSE_EF_MODAL:
      return { ...state, visibleEfModal: false, efModal: initialState.efModal };
    case actionTypes.SET_DISP_STATUS:
      return { ...state, ...action.data };
    case actionTypes.LOAD_DELGDISP_SUCCEED:
      return { ...state, delgDisp: action.result.data.delegation, saved: false,
        dispatch: action.result.data.dispatch, partners: action.result.data.partners };
    case actionTypes.LOAD_DISP_SUCCEED:
      return { ...state, delgDisp: action.result.data.delegation, saved: true,
        dispatch: action.result.data.dispatch, partners: action.result.data.partners };
    case actionTypes.SET_SAVED_STATUS:
      return { ...state, ...action.data };
    case actionTypes.SET_PREW_STATUS:
      return { ...state, ...action.data };
    default:
      return state;
  }
}

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
export function setSavedStatus(params) {
  return {
    type: actionTypes.SET_SAVED_STATUS,
    data: params,
  };
}
export function loadDelgDisp(delgNo, tenantId, typeCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DELGDISP,
        actionTypes.LOAD_DELGDISP_SUCCEED,
        actionTypes.LOAD_DELGDISP_FAIL,
      ],
      endpoint: 'v1/cms/loadDelgDisp',
      method: 'get',
      params: { delgNo, tenantId, typeCode },
    },
  };
}

export function loadDisp(delgNo, tenantId, typeCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DISP,
        actionTypes.LOAD_DISP_SUCCEED,
        actionTypes.LOAD_DISP_FAIL,
      ],
      endpoint: 'v1/cms/loadDisp',
      method: 'get',
      params: { delgNo, tenantId, typeCode },
    },
  };
}

export function delgDispSave(delgDisp, dispatch, partner) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELG_DISP_SAVE,
        actionTypes.DELG_DISP_SAVE_SUCCEED,
        actionTypes.DELG_DISP_SAVE_FAIL,
      ],
      endpoint: 'v1/cms/delegation/dispsave',
      method: 'post',
      data: { delgDisp, dispatch, partner },
    },
  };
}

export function delDisp(delgNo, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DEL_DISP,
        actionTypes.DEL_DISP_SUCCEED,
        actionTypes.DEL_DISP_FAIL,
      ],
      endpoint: 'v1/cms/dispatch/del',
      method: 'post',
      data: { delgNo, tenantId },
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

export function acceptDelg(loginId, loginName, dispId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ACPT_DELG,
        actionTypes.ACPT_DELG_SUCCEED,
        actionTypes.ACPT_DELG_FAIL,
      ],
      method: 'post',
      endpoint: 'v1/cms/delegation/accept',
      data: { loginId, loginName, dispId },
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

export function createDelegationByCUS(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CUS_CREATE_DELGCCB,
        actionTypes.CUS_CREATE_DELGCCB_SUCCEED,
        actionTypes.CUS_CREATE_DELGCCB_FAIL,
      ],
      endpoint: 'v1/cms/cus/delegation',
      method: 'post',
      data,
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
      params: { ...params, partershipType: 'CUS' },
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
        endpoint: 'v1/cms/delegation/form/requires',
        method: 'get',
        params: { ...params, partershipType: 'CCB' },
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

export function loadFormRequire(cookie, tenantId, ieType, partershipType) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_REQUIRE,
        actionTypes.LOAD_REQUIRE_SUCCEED,
        actionTypes.LOAD_REQUIRE_FAIL,
      ],
      endpoint: 'v1/cms/delegation/form/requires',
      method: 'get',
      params: { tenantId, ieType, partershipType },
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

export function returnDelegate(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RETURN_DELEGATE,
        actionTypes.RETURN_DELEGATE_SUCCEED,
        actionTypes.RETURN_DELEGATE_FAIL,
      ],
      endpoint: 'v1/cms/delegation/return',
      method: 'post',
      data,
    },
  };
}

export function showPreviewer(params, status) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SHOW_PREVIEWER,
        actionTypes.SHOW_PREVIEWER_SUCCEED,
        actionTypes.SHOW_PREVIEWER_FAILED,
      ],
      endpoint: 'v1/cms/delegate/previewer',
      method: 'get',
      params,
      visible: true,
      status,
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

export function closeEfModal() {
  return {
    type: actionTypes.CLOSE_EF_MODAL,
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
