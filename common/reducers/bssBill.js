import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/bss/bill', [
  'LOAD_BILLS', 'LOAD_BILLS_SUCCEED', 'LOAD_BILLS_FAIL',
  'LOAD_ORDER_STATEMENTS', 'LOAD_ORDER_STATEMENTS_SUCCEED', 'LOAD_ORDER_STATEMENTS_FAIL',
  'RELOAD_BILL_LIST',
  'TOGGLE_NEW_BILL_MODAL',
  'CREATE_BILL', 'CREATE_BILL_SUCCEED', 'CREATE_BILL_FAIL',
  'LOAD_BILL_STATISTICS', 'LOAD_BILL_STATISTICS_SUCCEED', 'LOAD_BILL_STATISTICS_FAIL',
  'SEND_BILL', 'SEND_BILL_SUCCEED', 'SEND_BILL_FAIL',
  'DELETE_BILL', 'DELETE_BILL_SUCCEED', 'DELETE_BILL_FAIL',
  'RECALL_BILL', 'RECALL_BILL_SUCCEED', 'RECALL_BILL_FAIL',
  'ACCEPT_BILL', 'ACCEPT_BILL_SUCCEED', 'ACCEPT_BILL_FAIL',
  'GET_BILL_STATEMENTS', 'GET_BILL_STATEMENTS_SUCCEED', 'GET_BILL_STATEMENTS_FAIL',
  'GET_BILL_STATEMENT_FEES', 'GET_BILL_STATEMENT_FEES_SUCCEED', 'GET_BILL_STATEMENT_FEES_FAIL',
  'ADJUST_BILLSTATMENT', 'ADJUST_BILLSTATMENT_SUCCEED', 'ADJUST_BILLSTATMENT_FAIL',
  'LOAD_BILL_HEAD', 'LOAD_BILL_HEAD_SUCCEED', 'LOAD_BILL_HEAD_FAIL',
  'UPDATE_RECONCILE_FEE', 'UPDATE_RECONCILE_FEE_SUCCEED', 'UPDATE_RECONCILE_FEE_FAIL',
  'RECONCILE_STATEMENT', 'RECONCILE_STATEMENT_SUCCEED', 'RECONCILE_STATEMENT_FAIL',
  'REJECT_BILL', 'REJECT_BILL_SUCCEED', 'REJECT_BILL_FAIL',
  'GET_DRAFT_BILL', 'GET_DRAFT_BILL_SUCCEED', 'GET_DRAFT_BILL_FAIL',
  'TOGGLE_ADDTO_DRAFT_MODAL',
  'ADD_ORDERS_TO_DRAFT_BILL', 'ADD_ORDERS_TO_DRAFT_BILL_SUCCEED', 'ADD_ORDERS_TO_DRAFT_BILL_FAIL',
  'WRITEOFF_BILL', 'WRITEOFF_BILL_SUCCEED', 'WRITEOFF_BILL_FAIL',
]);

const initialState = {
  billlist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  orderStatementlist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  listFilter: {
    status: 'processingBills',
    clientPid: 'all',
    bill_type: 'buyerBill',
  },
  loading: false,
  visibleNewBillModal: false,
  billReload: false,
  billStat: {
    total_amount: 0,
  },
  billHead: {},
  billStatements: [],
  billTemplateFees: [],
  statementFees: [],
  statementReload: false,
  billHeadReload: false,
  draftModal: {
    visibleAddToDraftModal: false,
    sofOrderNos: [],
    partnerId: null,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_BILLS:
      return {
        ...state,
        billReload: false,
        listLoading: true,
        listFilter: JSON.parse(action.params.filter),
      };
    case actionTypes.LOAD_BILLS_SUCCEED:
      return { ...state, listLoading: false, billlist: action.result.data };
    case actionTypes.LOAD_BILLS_FAIL:
      return { ...state, listLoading: false };
    case actionTypes.LOAD_ORDER_STATEMENTS:
      return {
        ...state,
        billReload: false,
        listFilter: JSON.parse(action.params.filter),
        loading: true,
      };
    case actionTypes.LOAD_ORDER_STATEMENTS_SUCCEED:
      return { ...state, loading: false, orderStatementlist: action.result.data };
    case actionTypes.LOAD_ORDER_STATEMENTS_FAIL:
      return { ...state, loading: false };
    case actionTypes.TOGGLE_NEW_BILL_MODAL:
      return { ...state, visibleNewBillModal: action.data };
    case actionTypes.RELOAD_BILL_LIST:
      return {
        ...state,
        billReload: true,
        listFilter: { ...state.listFilter, ...action.data.filter },
      };
    case actionTypes.LOAD_BILL_STATISTICS:
      return { ...state, billReload: false, listFilter: JSON.parse(action.params.filter) };
    case actionTypes.LOAD_BILL_STATISTICS_SUCCEED:
      return { ...state, billStat: action.result.data };
    case actionTypes.LOAD_BILL_HEAD:
      return { ...state, billHeadReload: false };
    case actionTypes.LOAD_BILL_HEAD_SUCCEED:
      return { ...state, billHead: action.result.data };
    case actionTypes.ADJUST_BILLSTATMENT_SUCCEED:
      return { ...state, billHeadReload: true };
    case actionTypes.RECONCILE_STATEMENT_SUCCEED:
      return { ...state, billHeadReload: true, statementReload: true };
    case actionTypes.CREATE_BILL_SUCCEED:
      return { ...state, billReload: true };
    case actionTypes.GET_BILL_STATEMENTS:
      return { ...state, statementReload: false };
    case actionTypes.GET_BILL_STATEMENTS_SUCCEED:
      return { ...state, billStatements: action.result.data };
    case actionTypes.GET_BILL_STATEMENT_FEES_SUCCEED:
      return {
        ...state,
        billTemplateFees: action.result.data.billTemplateFees,
        statementFees: action.result.data.statementFees,
      };
    case actionTypes.UPDATE_RECONCILE_FEE_SUCCEED:
      return { ...state, statementReload: true, billHeadReload: true };
    case actionTypes.TOGGLE_ADDTO_DRAFT_MODAL:
      return {
        ...state,
        draftModal: {
          ...state.draftModal,
          visibleAddToDraftModal: action.data.visible,
          sofOrderNos: action.data.sofOrderNos,
          partnerId: action.data.partnerId,
        },
      };
    case actionTypes.ADD_ORDERS_TO_DRAFT_BILL_SUCCEED:
      return { ...state, billReload: true };
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

export function loadBillableStatements(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ORDER_STATEMENTS,
        actionTypes.LOAD_ORDER_STATEMENTS_SUCCEED,
        actionTypes.LOAD_ORDER_STATEMENTS_FAIL,
      ],
      endpoint: 'v1/bss/billable/statements',
      method: 'get',
      params,
    },
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

export function getBillStatementFees(billNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GET_BILL_STATEMENT_FEES,
        actionTypes.GET_BILL_STATEMENT_FEES_SUCCEED,
        actionTypes.GET_BILL_STATEMENT_FEES_FAIL,
      ],
      endpoint: 'v1/bss/bill/statement/fees/get',
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

export function adjustBillStatement(data, billNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADJUST_BILLSTATMENT,
        actionTypes.ADJUST_BILLSTATMENT_SUCCEED,
        actionTypes.ADJUST_BILLSTATMENT_FAIL,
      ],
      endpoint: 'v1/bss/bill/statement/adjust',
      method: 'post',
      data: { data, billNo },
    },
  };
}

export function updateStatementReconcileFee(data, billNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_RECONCILE_FEE,
        actionTypes.UPDATE_RECONCILE_FEE_SUCCEED,
        actionTypes.UPDATE_RECONCILE_FEE_FAIL,
      ],
      endpoint: 'v1/bss/reconcile/fee/update',
      method: 'post',
      data: { data, billNo },
    },
  };
}

export function reconcileStatement(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RECONCILE_STATEMENT,
        actionTypes.RECONCILE_STATEMENT_SUCCEED,
        actionTypes.RECONCILE_STATEMENT_FAIL,
      ],
      endpoint: 'v1/bss/bill/statement/reconcile',
      method: 'post',
      data: { id },
    },
  };
}

export function rejectBill(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REJECT_BILL,
        actionTypes.REJECT_BILL_SUCCEED,
        actionTypes.REJECT_BILL_FAIL,
      ],
      endpoint: 'v1/bss/bill/reject',
      method: 'post',
      data,
    },
  };
}

export function loadDraftBillByPartner(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GET_DRAFT_BILL,
        actionTypes.GET_DRAFT_BILL_SUCCEED,
        actionTypes.GET_DRAFT_BILL_FAIL,
      ],
      endpoint: 'v1/bss/bill/partner/drafts',
      method: 'get',
      params,
    },
  };
}

export function toggleAddToDraftModal(visible, partnerId, sofOrderNos) {
  return {
    type: actionTypes.TOGGLE_ADDTO_DRAFT_MODAL,
    data: { visible, partnerId, sofOrderNos },
  };
}

export function appendDraftStatements(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_ORDERS_TO_DRAFT_BILL,
        actionTypes.ADD_ORDERS_TO_DRAFT_BILL_SUCCEED,
        actionTypes.ADD_ORDERS_TO_DRAFT_BILL_FAIL,
      ],
      endpoint: 'v1/bss/bill/draft/append/statements',
      method: 'post',
      data,
    },
  };
}

export function writeOffBill(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.WRITEOFF_BILL,
        actionTypes.WRITEOFF_BILL_SUCCEED,
        actionTypes.WRITEOFF_BILL_FAIL,
      ],
      endpoint: 'v1/bss/bill/writeoff',
      method: 'post',
      data,
    },
  };
}
