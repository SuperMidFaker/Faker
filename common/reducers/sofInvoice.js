import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/sof/invoice/', [
  'LOAD_INVOICES', 'LOAD_INVOICES_SUCCEED', 'LOAD_INVOICES_FAIL',
  'ADD_SOF_INVOICE', 'ADD_SOF_INVOICE_SUCCEED', 'ADD_SOF_INVOICE_FAIL',
  'TOGGLE_DETAIL_MODAL', 'ADD_TEMPORARY', 'SET_TEMPORARY',
  'GET_INVOICE', 'GET_INVOICE_SUCCEED', 'GET_INVOICE_FAIL',
  'UPDATE_SOF_INVOICE', 'UPDATE_SOF_INVOICE_SUCCEED', 'UPDATE_SOF_INVOICE_FAIL',
  'CLEAR_INVOICE',
  'DELETE_SOF_INVOICE', 'DELETE_SOF_INVOICE_SUCCEED', 'DELETE_SOF_INVOICE_FAIL',
  'SPLIT_SOF_INVOICE', 'SPLIT_SOF_INVOICE_SUCCEED', 'SPLIT_SOF_INVOICE_FAIL',
]);

const initialState = {
  invoiceList: {
    current: 1,
    pageSize: 20,
    data: [],
  },
  loading: false,
  filter: { },
  temporaryDetails: [],
  invoiceHead: {},
  detailModal: {
    visible: false,
    record: {},
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_INVOICES:
      return { ...state, filter: JSON.parse(action.params.filter), loading: true };
    case actionTypes.LOAD_INVOICES_SUCCEED:
      return { ...state, invoiceList: { ...action.result.data }, loading: false };
    case actionTypes.LOAD_INVOICES_FAIL:
      return { ...state, loading: false };
    case actionTypes.TOGGLE_DETAIL_MODAL:
      return {
        ...state,
        detailModal: {
          ...state.detailModal,
          visible: action.visible,
          record: action.record,
        },
      };
    case actionTypes.ADD_TEMPORARY:
      return { ...state, temporaryDetails: [...state.temporaryDetails, action.record] };
    case actionTypes.SET_TEMPORARY:
      return { ...state, temporaryDetails: action.records };
    case actionTypes.GET_INVOICE_SUCCEED:
      return {
        ...state,
        temporaryDetails: action.result.data.details,
        invoiceHead: action.result.data.head,
      };
    case actionTypes.CLEAR_INVOICE:
      return { ...state, temporaryDetails: [], invoiceHead: {} };
    default:
      return state;
  }
}

export function addSofInvoice(head, details) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_SOF_INVOICE,
        actionTypes.ADD_SOF_INVOICE_SUCCEED,
        actionTypes.ADD_SOF_INVOICE_FAIL,
      ],
      endpoint: 'v1/sof/invoice/add',
      method: 'post',
      data: { head, details },
    },
  };
}

export function toggleDetailModal(visible, record = {}) {
  return {
    type: actionTypes.TOGGLE_DETAIL_MODAL,
    visible,
    record,
  };
}

export function addTemporary(record) {
  return {
    type: actionTypes.ADD_TEMPORARY,
    record,
  };
}

export function setTemporary(records) {
  return {
    type: actionTypes.SET_TEMPORARY,
    records,
  };
}

export function clearInvoice() {
  return {
    type: actionTypes.CLEAR_INVOICE,
  };
}

export function loadInvoices({ pageSize, current, filter }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_INVOICES,
        actionTypes.LOAD_INVOICES_SUCCEED,
        actionTypes.LOAD_INVOICES_FAIL,
      ],
      endpoint: 'v1/sof/invoices/load',
      method: 'get',
      params: { pageSize, current, filter },
    },
  };
}

export function getInvoice(invoiceNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GET_INVOICE,
        actionTypes.GET_INVOICE_SUCCEED,
        actionTypes.GET_INVOICE_FAIL,
      ],
      endpoint: 'v1/sof/invoice/get',
      method: 'get',
      params: { invoiceNo },
    },
  };
}

export function UpdateSofInvoice(head, details, id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_SOF_INVOICE,
        actionTypes.UPDATE_SOF_INVOICE_SUCCEED,
        actionTypes.UPDATE_SOF_INVOICE_FAIL,
      ],
      endpoint: 'v1/sof/invoice/update',
      method: 'post',
      data: { head, details, id },
    },
  };
}

export function deleteSofInvice(invoiceNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_SOF_INVOICE,
        actionTypes.DELETE_SOF_INVOICE_SUCCEED,
        actionTypes.DELETE_SOF_INVOICE_FAIL,
      ],
      endpoint: 'v1/sof/invoice/delete',
      method: 'post',
      data: { invoiceNo },
    },
  };
}

export function splitInvoice(invoiceNo, splitDetails) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SPLIT_SOF_INVOICE,
        actionTypes.SPLIT_SOF_INVOICE_SUCCEED,
        actionTypes.SPLIT_SOF_INVOICE_FAIL,
      ],
      endpoint: 'v1/sof/invoice/split',
      method: 'post',
      data: { invoiceNo, splitDetails },
    },
  };
}
