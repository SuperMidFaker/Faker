import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/bss/invoice/', [
  'LOAD_INVOICES', 'LOAD_INVOICES_SUCCEED', 'LOAD_INVOICES_FAIL',
  'TOGGLE_APPLY_INVOICE_MODAL', 'TOGGLE_COLLECT_INVOICE_MODAL',
]);

const initialState = {
  invoiceslist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  listFilter: {
    status: 'submitted',
    clientPid: 'all',
  },
  loading: false,
  applyInvoiceModal: {
    visible: false,
  },
  collectInvoiceModal: {
    visible: false,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_INVOICES:
      return {
        ...state,
        listFilter: JSON.parse(action.params.filter),
        loading: true,
      };
    case actionTypes.LOAD_INVOICES_SUCCEED:
      return { ...state, loading: false, invoiceslist: action.result.data };
    case actionTypes.LOAD_INVOICES_FAIL:
      return { ...state, loading: false };
    case actionTypes.TOGGLE_APPLY_INVOICE_MODAL:
      return { ...state, applyInvoiceModal: { ...state.applyInvoiceModal, visible: action.data } };
    case actionTypes.TOGGLE_COLLECT_INVOICE_MODAL:
      return {
        ...state,
        collectInvoiceModal: { ...state.collectInvoiceModal, visible: action.data },
      };
    default:
      return state;
  }
}

export function toggleApplyInvoiceModal(visible) {
  return {
    type: actionTypes.TOGGLE_APPLY_INVOICE_MODAL,
    data: visible,
  };
}

export function toggleCollectInvoiceModal(visible) {
  return {
    type: actionTypes.TOGGLE_COLLECT_INVOICE_MODAL,
    data: visible,
  };
}

export function loadInvoices(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_INVOICES,
        actionTypes.LOAD_INVOICES_SUCCEED,
        actionTypes.LOAD_INVOICES_FAIL,
      ],
      endpoint: 'v1/bss/invoices/load',
      method: 'get',
      params,
    },
  };
}
