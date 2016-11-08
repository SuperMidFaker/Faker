import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/delegation/', [
  'EXP_PANE_LOAD', 'EXP_PANE_LOAD_SUCCEED', 'EXP_PANE_LOAD_FAIL',
  'EXP_LOAD', 'EXP_LOAD_SUCCEED', 'EXP_LOAD_FAIL',
  'CLOSE_IN_MODAL', 'OPEN_IN_MODAL',
  'CURRENCY_LOAD', 'CURRENCY_LOAD_SUCCEED', 'CURRENCY_LOAD_FAIL',
  'CUSH_SAVE', 'CUSH_SAVE_SUCCEED', 'CUSH_SAVE_FAIL',
  'LOAD_SUBTABLE', 'LOAD_SUBTABLE_SUCCEED', 'LOAD_SUBTABLE_FAIL',
  'CLOSE_MARK_MODAL', 'OPEN_MARK_MODAL',
  'MARK_SAVE', 'MARK_SAVE_SUCCEED', 'MARK_SAVE_FAIL',
  'CLOSE_CERT_MODAL', 'OPEN_CERT_MODAL',
  'EXP_CERT_LOAD', 'EXP_CERT_LOAD_SUCCEED', 'EXP_CERT_LOAD_FAIL',
  'CERT_FEES_SAVE', 'CERT_FEES_SAVE_SUCCEED', 'CERT_FEES_SAVE_FAIL',
]);

const initialState = {
  expenses: {
    server_charges: [],
    cush_charges: [],
    tot_sercharges: {},
  },
  expslist: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: [],
  },
  listFilter: {
    status: 'all',
  },
  showInputModal: false,
  currencies: [],
  expFeesMap: {},
  showMarkModal: false,
  saved: false,
  showCertModal: false,
  certExp: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.EXP_PANE_LOAD:
      return { ...state, expenses: initialState.expenses };
    case actionTypes.EXP_PANE_LOAD_SUCCEED:
      return { ...state, expenses: { ...state.expenses, ...action.result.data } };
    case actionTypes.EXP_LOAD:
      return { ...state, expslist: { ...state.expslist, loading: true }, saved: false };
    case actionTypes.EXP_LOAD_SUCCEED: {
      const expFeesMap = {};
      const exps = action.result.data;
      exps.data.forEach((exp) => {
        expFeesMap[exp.delg_no] = {};
      });
      return { ...state, expslist: { ...state.expslist, ...exps, loading: false },
        expFeesMap, listFilter: JSON.parse(action.params.filter) };
    }
    case actionTypes.CURRENCY_LOAD_SUCCEED:
      return { ...state, currencies: action.result.data };
    case actionTypes.CLOSE_IN_MODAL:
      return { ...state, showInputModal: false };
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
    case actionTypes.CUSH_SAVE_SUCCEED:
      return { ...state, saved: true };
    case actionTypes.MARK_SAVE_SUCCEED:
      return { ...state, saved: true };
    case actionTypes.EXP_CERT_LOAD_SUCCEED:
      return { ...state, certExp: action.result.data };
    default:
      return state;
  }
}

export function loadPaneExp(delgNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EXP_PANE_LOAD,
        actionTypes.EXP_PANE_LOAD_SUCCEED,
        actionTypes.EXP_PANE_LOAD_FAIL,
      ],
      endpoint: 'v1/cms/expense/paneload',
      method: 'get',
      params: { delgNo },
      origin: 'mongo',
    },
  };
}

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
      origin: 'mongo',
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

export function saveCushInput(tenantId, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CUSH_SAVE,
        actionTypes.CUSH_SAVE_SUCCEED,
        actionTypes.CUSH_SAVE_FAIL,
      ],
      endpoint: 'v1/cms/expense/cushion/inputsave',
      method: 'post',
      data: { tenantId, params },
      origin: 'mongo',
    },
  };
}

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
