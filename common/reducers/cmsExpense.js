import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/delegation/', [
  'EXP_PANE_LOAD', 'EXP_PANE_LOAD_SUCCEED', 'EXP_PANE_LOAD_FAIL',
  'EXP_LOAD', 'EXP_LOAD_SUCCEED', 'EXP_LOAD_FAIL',
  'CLOSE_IN_MODAL', 'OPEN_IN_MODAL',
  'CURRENCY_LOAD', 'CURRENCY_LOAD_SUCCEED', 'CURRENCY_LOAD_FAIL',
  'LOAD_SUBTABLE', 'LOAD_SUBTABLE_SUCCEED', 'LOAD_SUBTABLE_FAIL',
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
  showInputModal: false,
  currencies: [],
  expFeesMap: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.EXP_PANE_LOAD:
      return { ...state, expenses: initialState.expenses };
    case actionTypes.EXP_PANE_LOAD_SUCCEED:
      return { ...state, expenses: { ...state.expenses, ...action.result.data } };
    case actionTypes.EXP_LOAD:
      return { ...state, expslist: { ...state.expslist, loading: true } };
    case actionTypes.EXP_LOAD_SUCCEED:
      return { ...state, expslist: { ...state.expslist, ...action.result.data, loading: false } };
    case actionTypes.CURRENCY_LOAD_SUCCEED:
      return { ...state, currencies: action.result.data };
    case actionTypes.CLOSE_IN_MODAL:
      return { ...state, showInputModal: false };
    case actionTypes.OPEN_IN_MODAL:
      return { ...state, showInputModal: true };
    case actionTypes.LOAD_SUBTABLE: {
      const expFeesMap = { ...state.expFeesMap };
      expFeesMap[action.params.delgNo] = [];
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
      expFeesMap[action.params.delgNo] = [];
      expFeesMap[action.params.delgNo].loading = false;
      return { ...state, expFeesMap };
    }
    default:
      return state;
  }
}

export function loadPaneExp(delgNo) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.EXP_PANE_LOAD, actionTypes.EXP_PANE_LOAD_SUCCEED, actionTypes.EXP_PANE_LOAD_FAIL],
      endpoint: 'v1/cms/expense/paneload',
      method: 'get',
      params: { delgNo },
      origin: 'mongo',
    },
  };
}

export function loadExpense(tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.EXP_LOAD, actionTypes.EXP_LOAD_SUCCEED, actionTypes.EXP_LOAD_FAIL],
      endpoint: 'v1/cms/expense/load',
      method: 'get',
      params: { tenantId },
      origin: 'mongo',
    },
  };
}

export function loadCurrencies() {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CURRENCY_LOAD, actionTypes.CURRENCY_LOAD_SUCCEED, actionTypes.CURRENCY_LOAD_FAIL],
      endpoint: 'v1/cms/expense/currencies',
      method: 'get',
    },
  };
}

export function loadCushInputSave(tenantId, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.EXP_LOAD, actionTypes.EXP_LOAD_SUCCEED, actionTypes.EXP_LOAD_FAIL],
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
