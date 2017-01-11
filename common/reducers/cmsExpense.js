import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/delegation/', [
  'EXP_PANE_LOAD', 'EXP_PANE_LOAD_SUCCEED', 'EXP_PANE_LOAD_FAIL',
  'DECL_EXPS_LOAD', 'DECL_EXPS_LOAD_SUCCEED', 'DECL_EXPS_LOAD_FAIL',
  'EXP_LOAD', 'EXP_LOAD_SUCCEED', 'EXP_LOAD_FAIL',
  'CLOSE_ADVFEE_MODAL',
  // 'CLOSE_IN_MODAL', 'OPEN_IN_MODAL',
  'CURRENCY_LOAD', 'CURRENCY_LOAD_SUCCEED', 'CURRENCY_LOAD_FAIL',
  // 'LOAD_SUBTABLE', 'LOAD_SUBTABLE_SUCCEED', 'LOAD_SUBTABLE_FAIL',
  'CLOSE_MARK_MODAL', 'OPEN_MARK_MODAL',
  // 'MARK_SAVE', 'MARK_SAVE_SUCCEED', 'MARK_SAVE_FAIL',
  'CLOSE_CERT_MODAL', 'OPEN_CERT_MODAL',
  // 'EXP_CERT_LOAD', 'EXP_CERT_LOAD_SUCCEED', 'EXP_CERT_LOAD_FAIL',
  'CERT_FEES_SAVE', 'CERT_FEES_SAVE_SUCCEED', 'CERT_FEES_SAVE_FAIL',
  // 'OPEN_DECL_INPUT_MODAL', 'CLOSE_DECL_INPUT_MODAL',
  'LOAD_ADVPARTIES', 'LOAD_ADVPARTIES_SUCCEED', 'LOAD_ADVPARTIES_FAIL',
  /*
  'SHOW_PREVIEWER', 'SHOW_PREVIEWER_SUCCEED', 'SHOW_PREVIEWER_FAILED',
  'HIDE_PREVIEWER', */
  'LOAD_DELGADVFEES', 'LOAD_DELGADVFEES_SUCCEED', 'LOAD_DELGADVFEES_FAIL',
  'COMPUTE_DELGADVFEES', 'COMPUTE_DELGADVFEES_SUCCEED', 'COMPUTE_DELGADVFEES_FAIL',
  'LOAD_DECLADVPARTIES', 'LOAD_DECLADVPARTIES_SUCCEED', 'LOAD_DECLADVPARTIES_FAIL',
  'COMPUTE_DECLADVFEES', 'COMPUTE_DECLADVFEES_SUCCEED', 'COMPUTE_DECLADVFEES_FAIL',
  'CERT_PANEL_LOAD', 'CERT_PANEL_LOAD_SUCCEED', 'CERT_PANEL_LOAD_FAIL',
  'LOAD_FILTER_PARTNERS', 'LOAD_FILTER_PARTNERS_SUCCEED', 'LOAD_FILTER_PARTNERS_FAIL',
]);

const initialState = {
  expenses: {
    revenue: [],
    allcost: [],
    parameters: [],
  },
  expslist: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: [],
  },
  declexps: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: [],
    fields: [],
  },
  listFilter: {
    status: 'all',
    viewStatus: 'both',
    acptDate: { en: false },
    cleanDate: { en: false },
  },
  // showInputModal: false,
  currencies: [],
  expFeesMap: {},
  // showMarkModal: false,
  saved: false,
  // showCertModal: false,
  // certExp: {},
  // declInModal: {
  // },
  // declAdvanceParties: [],
  showDeclInputModal: false,
  advanceParties: [],
  /*
  previewer: {
    customs: {
      provider: '',
      data: [],
    },
    ciq: {
      provider: '',
      data: [],
    },
    cert: {
      provider: '',
      data: [],
    },
    visible: false,
  }, */
  advanceFeeModal: {
    visible: false,
    fees: [],
  },
  /* certPanel: {
    fees: [],
  }, */
  partners: {
    customer: [],
    supplier: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.EXP_PANE_LOAD:
      return { ...state, expenses: initialState.expenses };
    case actionTypes.EXP_PANE_LOAD_SUCCEED:
      return { ...state, expenses: { ...state.expenses, ...action.result.data } };
    case actionTypes.EXP_LOAD:
      return { ...state, expslist: { ...initialState.expslist, loading: true }, saved: false };
    case actionTypes.EXP_LOAD_SUCCEED: {
      const expFeesMap = {};
      const exps = action.result.data;
      exps.data.forEach((exp) => {
        expFeesMap[exp.delg_no] = {};
      });
      return { ...state, expslist: { ...state.expslist, ...exps, loading: false },
        expFeesMap, listFilter: JSON.parse(action.params.filter) };
    }
    case actionTypes.DECL_EXPS_LOAD:
      return { ...state, declexps: { ...state.declexps, loading: true }, saved: false };
    case actionTypes.DECL_EXPS_LOAD_SUCCEED:
      return { ...state, declexps: { ...state.declexps, ...action.result.data, loading: false } };
    case actionTypes.CURRENCY_LOAD_SUCCEED:
      return { ...state, currencies: action.result.data };
    case actionTypes.CLOSE_IN_MODAL:
      return { ...state, showInputModal: false };
        /*
    case actionTypes.OPEN_IN_MODAL:
      return { ...state, showInputModal: true };
    case actionTypes.CLOSE_MARK_MODAL:
      return { ...state, showMarkModal: false };
    case actionTypes.OPEN_MARK_MODAL:
      return { ...state, showMarkModal: true };
    case actionTypes.CLOSE_CERT_MODAL:
      return { ...state, showCertModal: false };
    case actionTypes.OPEN_CERT_MODAL:
      return { ...state, showCertModal: true };
    case actionTypes.LOAD_SUBTABLE: {
      const expFeesMap = { ...state.expFeesMap };
      expFeesMap[action.params.delgNo] = {};
      expFeesMap[action.params.delgNo].loading = true;
      return { ...state, expFeesMap };
    }
    case actionTypes.LOAD_SUBTABLE_SUCCEED: {
      const expFeesMap = { ...state.expFeesMap };
      expFeesMap[action.params.delgNo] = action.result.data;
      expFeesMap[action.params.delgNo].loading = false;
      return { ...state, expFeesMap };
    }
    case actionTypes.LOAD_SUBTABLE_FAIL: {
      const expFeesMap = { ...state.expFeesMap };
      expFeesMap[action.params.delgNo] = {};
      expFeesMap[action.params.delgNo].loading = false;
      return { ...state, expFeesMap };
    }
    case actionTypes.MARK_SAVE_SUCCEED:
      return { ...state, saved: true };
    case actionTypes.EXP_CERT_LOAD_SUCCEED:
      return { ...state, certExp: action.result.data };
    case actionTypes.OPEN_DECL_INPUT_MODAL:
      return { ...state, declInModal: action.data, showDeclInputModal: true };
    case actionTypes.CLOSE_DECL_INPUT_MODAL:
      return { ...state, declInModal: initialState.declInModal, showDeclInputModal: false };
    */
    case actionTypes.CLOSE_ADVFEE_MODAL:
      return { ...state, advanceFeeModal: { ...state.advanceFeeModal, visible: false } };
    case actionTypes.LOAD_ADVPARTIES_SUCCEED:
      return { ...state, advanceParties: action.result.data, advanceFeeModal: {
        ...state.advanceFeeModal, visible: true, direction: action.params.direction,
        delg_no: action.params.delgNo,
      } };
        /*
    case actionTypes.SHOW_PREVIEWER:
      return { ...state, previewer: {
        ...state.previewer,
        visible: action.visible } };
    case actionTypes.SHOW_PREVIEWER_SUCCEED:
      return { ...state, previewer: {
        ...state.previewer,
        visible: action.visible,
        ...action.result.data } };
    case actionTypes.HIDE_PREVIEWER:
      return { ...state, previewer: { ...state.previewer, visible: action.visible } };
      */
    case actionTypes.LOAD_DELGADVFEES_SUCCEED:
      return { ...state, advanceFeeModal: { ...state.advanceFeeModal, fees: action.result.data } };
    case actionTypes.COMPUTE_DELGADVFEES_SUCCEED:
      return { ...state, saved: true };
    case actionTypes.LOAD_DECLADVPARTIES_SUCCEED:
      return { ...state, declAdvanceParties: action.result.data };
    case actionTypes.COMPUTE_DECLADVFEES_SUCCEED:
      return { ...state, saved: true };
    case actionTypes.CERT_PANEL_LOAD_SUCCEED:
      return { ...state, certPanel: action.result.data };
    case actionTypes.LOAD_FILTER_PARTNERS_SUCCEED:
      return { ...state, partners: action.result.data };
    default:
      return state;
  }
}

export function loadPartnersForFilter(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FILTER_PARTNERS,
        actionTypes.LOAD_FILTER_PARTNERS_SUCCEED,
        actionTypes.LOAD_FILTER_PARTNERS_FAIL,
      ],
      endpoint: 'v1/expense/filter/partners',
      method: 'get',
      params: { tenantId },
    },
  };
}

  /*
export function showPreviewer(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SHOW_PREVIEWER,
        actionTypes.SHOW_PREVIEWER_SUCCEED,
        actionTypes.SHOW_PREVIEWER_FAILED,
      ],
      endpoint: 'v1/cms/expense/previewer',
      method: 'get',
      params,
      visible: true,
      origin: 'mongo',
    },
  };
}

export function hidePreviewer(delgNo) {
  return {
    type: actionTypes.HIDE_PREVIEWER,
    delgNo,
    visible: false,
  };
} */

export function loadPaneExp(delgNo, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EXP_PANE_LOAD,
        actionTypes.EXP_PANE_LOAD_SUCCEED,
        actionTypes.EXP_PANE_LOAD_FAIL,
      ],
      endpoint: 'v1/cms/expense/paneload',
      method: 'get',
      params: { delgNo, tenantId },
      origin: 'mongo',
    },
  };
}
  /*
export function loadPanelCert(delgNo, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CERT_PANEL_LOAD,
        actionTypes.CERT_PANEL_LOAD_SUCCEED,
        actionTypes.CERT_PANEL_LOAD_FAIL,
      ],
      endpoint: 'v1/cms/expense/load/certPanel',
      method: 'get',
      params: { delgNo, tenantId },
      origin: 'mongo',
    },
  };
}

export function loadDeclExps(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DECL_EXPS_LOAD,
        actionTypes.DECL_EXPS_LOAD_SUCCEED,
        actionTypes.DECL_EXPS_LOAD_FAIL,
      ],
      endpoint: 'v1/cms/expense/decl/load',
      method: 'get',
      params,
      origin: 'mongo',
    },
  };
}
*/

export function loadExpense(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EXP_LOAD,
        actionTypes.EXP_LOAD_SUCCEED,
        actionTypes.EXP_LOAD_FAIL,
      ],
      endpoint: 'v1/cms/expense/load',
      method: 'get',
      params,
    },
  };
}

export function loadCurrencies() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CURRENCY_LOAD,
        actionTypes.CURRENCY_LOAD_SUCCEED,
        actionTypes.CURRENCY_LOAD_FAIL,
      ],
      endpoint: 'v1/cms/expense/currencies',
      method: 'get',
    },
  };
}

  /*
export function loadSubTable(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SUBTABLE,
        actionTypes.LOAD_SUBTABLE_SUCCEED,
        actionTypes.LOAD_SUBTABLE_FAIL,
      ],
      endpoint: 'v1/cms/expense/subtable/load',
      method: 'get',
      params,
      origin: 'mongo',
    },
  };
}

export function saveMarkstate(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.MARK_SAVE,
        actionTypes.MARK_SAVE_SUCCEED,
        actionTypes.MARK_SAVE_FAIL,
      ],
      endpoint: 'v1/cms/expense/statement/mark',
      method: 'post',
      data: { params },
      origin: 'mongo',
    },
  };
}

export function closeInModal() {
  return {
    type: actionTypes.CLOSE_IN_MODAL,
  };
}

export function openInModal() {
  return {
    type: actionTypes.OPEN_IN_MODAL,
  };
}
*/

export function closeAdvanceFeeModal() {
  return {
    type: actionTypes.CLOSE_ADVFEE_MODAL,
  };
}

  /*
export function closeMarkModal() {
  return {
    type: actionTypes.CLOSE_MARK_MODAL,
  };
}

export function openMarkModal() {
  return {
    type: actionTypes.OPEN_MARK_MODAL,
  };
}

export function closeCertModal() {
  return {
    type: actionTypes.CLOSE_CERT_MODAL,
  };
}

export function openCertModal() {
  return {
    type: actionTypes.OPEN_CERT_MODAL,
  };
}

export function openDeclInputModal(row) {
  return {
    type: actionTypes.OPEN_DECL_INPUT_MODAL,
    data: row,
  };
}
export function closeDeclInputModal() {
  return {
    type: actionTypes.CLOSE_DECL_INPUT_MODAL,
  };
}

export function loadCertFees(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EXP_CERT_LOAD,
        actionTypes.EXP_CERT_LOAD_SUCCEED,
        actionTypes.EXP_CERT_LOAD_FAIL,
      ],
      endpoint: 'v1/cms/expense/certfees',
      method: 'get',
      params,
      origin: 'mongo',
    },
  };
}

export function saveCertFees(disps, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CERT_FEES_SAVE,
        actionTypes.CERT_FEES_SAVE_SUCCEED,
        actionTypes.CERT_FEES_SAVE_FAIL,
      ],
      endpoint: 'v1/cms/expense/update/certfees',
      method: 'post',
      data: { disps, params },
      origin: 'mongo',
    },
  };
}
*/

export function loadAdvanceParties(delgNo, tenantId, direction) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ADVPARTIES,
        actionTypes.LOAD_ADVPARTIES_SUCCEED,
        actionTypes.LOAD_ADVPARTIES_FAIL,
      ],
      endpoint: 'v1/cms/expense/load/advanceparties',
      method: 'get',
      params: { delgNo, tenantId, direction },
    },
  };
}

export function loadDelgAdvanceFee(dispIds) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DELGADVFEES,
        actionTypes.LOAD_DELGADVFEES_SUCCEED,
        actionTypes.LOAD_DELGADVFEES_FAIL,
      ],
      endpoint: 'v1/cms/expense/load/advancefees',
      method: 'get',
      params: { dispids: JSON.stringify(dispIds) },
      origin: 'mongo',
    },
  };
}

export function computeDelgAdvanceFees(feeItems) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.COMPUTE_DELGADVFEES,
        actionTypes.COMPUTE_DELGADVFEES_SUCCEED,
        actionTypes.COMPUTE_DELGADVFEES_FAIL,
      ],
      endpoint: 'v1/cms/expense/compute/delg/advancefees',
      method: 'post',
      data: feeItems,
      origin: 'mongo',
    },
  };
}

/* export function loadDeclAdvanceParties(isCiq, delgNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DECLADVPARTIES,
        actionTypes.LOAD_DECLADVPARTIES_SUCCEED,
        actionTypes.LOAD_DECLADVPARTIES_FAIL,
      ],
      endpoint: 'v1/cms/expense/load/decl/advanceparties',
      method: 'get',
      params: { cls: JSON.stringify({ isCiq, delgNo }) },
    },
  };
}

export function computeDeclAdvanceFee(formData) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.COMPUTE_DECLADVFEES,
        actionTypes.COMPUTE_DECLADVFEES_SUCCEED,
        actionTypes.COMPUTE_DECLADVFEES_FAIL,
      ],
      endpoint: 'v1/cms/expense/compute/decl/advancefee',
      method: 'post',
      data: formData,
      origin: 'mongo',
    },
  };
} */
