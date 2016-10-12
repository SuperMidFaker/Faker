import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/delegation/', [
  'EXP_PANE_LOAD', 'EXP_PANE_LOAD_SUCCEED', 'EXP_PANE_LOAD_FAIL',
  'EXP_LOAD', 'EXP_LOAD_SUCCEED', 'EXP_LOAD_FAIL',
  'CLOSE_IN_MODAL', 'OPEN_IN_MODAL',
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
    case actionTypes.CLOSE_IN_MODAL:
      return { ...state, showInputModal: false };
    case actionTypes.OPEN_IN_MODAL:
      return { ...state, showInputModal: true };
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
