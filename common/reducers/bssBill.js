import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/bss/bill', [
  'LOAD_BILLS', 'LOAD_BILLS_SUCCEED', 'LOAD_BILLS_FAIL',
  'RELOAD_BILL_LIST',
  'TOGGLE_NEW_BILL_MODAL',
  'CREATE_BILL', 'CREATE_BILL_SUCCEED', 'CREATE_BILL_FAIL',
  'LOAD_BILL_STATISTICS', 'LOAD_BILL_STATISTICS_SUCCEED', 'LOAD_BILL_STATISTICS_FAIL',
  'SEND_BILL', 'SEND_BILL_SUCCEED', 'SEND_BILL_FAIL',
  'DELETE_BILL', 'DELETE_BILL_SUCCEED', 'DELETE_BILL_FAIL',
  'RECALL_BILL', 'RECALL_BILL_SUCCEED', 'RECALL_BILL_FAIL',
  'ACCEPT_BILL', 'ACCEPT_BILL_SUCCEED', 'ACCEPT_BILL_FAIL',
  'GET_BILL_STATEMENTS', 'GET_BILL_STATEMENTS_SUCCEED', 'GET_BILL_STATEMENTS_FAIL',
  'BILL_UPDATE', 'BILL_UPDATE_SUCCEED', 'BILL_UPDATE_FAIL',
  'LOAD_BILL_HEAD', 'LOAD_BILL_HEAD_SUCCEED', 'LOAD_BILL_HEAD_FAIL',
]);

const initialState = {
  billlist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  billListFilter: {
    status: 'processingBills',
    clientPid: 'all',
  },
  billListLoading: false,
  visibleNewBillModal: false,
  reload: false,
  statistics: {
    total_amount: 0,
  },
  billHead: {},
  billStatements: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_BILLS:
      return {
        ...state,
        reload: false,
        billListLoading: true,
        billListFilter: JSON.parse(action.params.filter),
      };
    case actionTypes.LOAD_BILLS_SUCCEED:
      return { ...state, billListLoading: false, billlist: action.result.data };
    case actionTypes.LOAD_BILLS_FAIL:
      return { ...state, billListLoading: false };
    case actionTypes.TOGGLE_NEW_BILL_MODAL:
      return { ...state, visibleNewBillModal: action.data };
    case actionTypes.RELOAD_BILL_LIST:
      return { ...state, reload: true, billListFilter: action.data.filter };
    case actionTypes.LOAD_BILL_STATISTICS_SUCCEED:
      return { ...state, statistics: action.result.data };
    case actionTypes.LOAD_BILL_HEAD:
      return { ...state, reload: false };
    case actionTypes.LOAD_BILL_HEAD_SUCCEED:
      return { ...state, billHead: action.result.data };
    case actionTypes.BILL_UPDATE_SUCCEED:
      return { ...state, reload: true };
    case actionTypes.GET_BILL_STATEMENTS_SUCCEED:
      return { ...state, billStatements: action.result.data };
    default:
      return state;
  }
}

export function toggleNewBillModal(visible) {
  return {
    type: actionTypes.TOGGLE_NEW_BILL_MODAL,
    data: visible,
  };
}

export function reloadBillList(filter) {
  return {
    type: actionTypes.RELOAD_BILL_LIST,
    data: { filter },
  };
}

export function loadBills(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILLS,
        actionTypes.LOAD_BILLS_SUCCEED,
        actionTypes.LOAD_BILLS_FAIL,
      ],
      endpoint: 'v1/bss/bills/load',
      method: 'get',
      params,
    },
  };
}

export function loadBillStatistics(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILL_STATISTICS,
        actionTypes.LOAD_BILL_STATISTICS_SUCCEED,
        actionTypes.LOAD_BILL_STATISTICS_FAIL,
      ],
      endpoint: 'v1/bss/bill/statistics',
      method: 'get',
      params,
    },
  };
}

export function createBill(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_BILL,
        actionTypes.CREATE_BILL_SUCCEED,
        actionTypes.CREATE_BILL_FAIL,
      ],
      endpoint: 'v1/bss/bill/new',
      method: 'post',
      data,
    },
  };
}

export function sendBill(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEND_BILL,
        actionTypes.SEND_BILL_SUCCEED,
        actionTypes.SEND_BILL_FAIL,
      ],
      endpoint: 'v1/bss/bill/send',
      method: 'post',
      data,
    },
  };
}

export function deleteBills(billNos) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_BILL,
        actionTypes.DELETE_BILL_SUCCEED,
        actionTypes.DELETE_BILL_FAIL,
      ],
      endpoint: 'v1/bss/bills/delete',
      method: 'post',
      data: { billNos },
    },
  };
}

export function recallBill(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RECALL_BILL,
        actionTypes.RECALL_BILL_SUCCEED,
        actionTypes.RECALL_BILL_FAIL,
      ],
      endpoint: 'v1/bss/bill/recall',
      method: 'post',
      data,
    },
  };
}

export function loadBillHead(billNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILL_HEAD,
        actionTypes.LOAD_BILL_HEAD_SUCCEED,
        actionTypes.LOAD_BILL_HEAD_FAIL,
      ],
      endpoint: 'v1/bss/bill/head/load',
      method: 'get',
      params: { billNo },
    },
  };
}

export function getBillStatements(billNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GET_BILL_STATEMENTS,
        actionTypes.GET_BILL_STATEMENTS_SUCCEED,
        actionTypes.GET_BILL_STATEMENTS_FAIL,
      ],
      endpoint: 'v1/bss/bill/statements/get',
      method: 'get',
      params: { billNo },
    },
  };
}

export function acceptBill(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ACCEPT_BILL,
        actionTypes.ACCEPT_BILL_SUCCEED,
        actionTypes.ACCEPT_BILL_FAIL,
      ],
      endpoint: 'v1/bss/bill/accept',
      method: 'post',
      data,
    },
  };
}

export function updateBill(data, billNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.BILL_UPDATE,
        actionTypes.BILL_UPDATE_SUCCEED,
        actionTypes.BILL_UPDATE_FAIL,
      ],
      endpoint: 'v1/bss/bill/update',
      method: 'post',
      data: { data, billNo },
    },
  };
}
