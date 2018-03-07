import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/sof/invoice/', [
  'LOAD_INVOICES', 'LOAD_INVOICES_SUCCEED', 'LOAD_INVOICES_FAIL',
  'ADD_SOF_INVOICE', 'ADD_SOF_INVOICE_SUCCEED', 'ADD_SOF_INVOICE_FAIL',
  'TOGGLE_DETAIL_MODAL', 'ADD_TEMPORARY', 'SET_TEMPORARY',
  'GET_INVOICE', 'GET_INVOICE_SUCCEED', 'GET_INVOICE_FAIL',
  'UPDATE_SOF_INVOICE', 'UPDATE_SOF_INVOICE_SUCCEED', 'UPDATE_SOF_INVOICE_FAIL',
  'CLEAR_INVOICE', 'SET_RECORDS_RELOAD',
  'DELETE_SOF_INVOICE', 'DELETE_SOF_INVOICE_SUCCEED', 'DELETE_SOF_INVOICE_FAIL',
  'SPLIT_SOF_INVOICE', 'SPLIT_SOF_INVOICE_SUCCEED', 'SPLIT_SOF_INVOICE_FAIL',
  'BATCH_DELETE_INVOICES', 'BATCH_DELETE_INVOICES_SUCCEED', 'BATCH_DELETE_INVOICES_FAIL',
  'UPLOAD_RECORDS_LOAD', 'UPLOAD_RECORDS_LOAD_SUCCEED', 'UPLOAD_RECORDS_LOAD_FAIL',
  'EMPTY_UPLOAD_RECORDS', 'EMPTY_UPLOAD_RECORDS_SUCCEED', 'EMPTY_UPLOAD_RECORDS_FAIL',
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
  uploadRecords: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
    reload: false,
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
    case actionTypes.UPLOAD_RECORDS_LOAD:
      return { ...state, uploadRecords: { ...state.uploadRecords, reload: true } };
    case actionTypes.UPLOAD_RECORDS_LOAD_SUCCEED:
      return { ...state, uploadRecords: { ...action.result.data, reload: false } };
    case actionTypes.UPLOAD_RECORDS_LOAD_FAIL:
      return { ...state, uploadRecords: { ...state.uploadRecords, reload: false } };
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

export function batchDeleteInvoices(invoiceNos) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.BATCH_DELETE_INVOICES,
        actionTypes.BATCH_DELETE_INVOICES_SUCCEED,
        actionTypes.BATCH_DELETE_INVOICES_FAIL,
      ],
      endpoint: 'v1/sof/invoices/batch/delete',
      method: 'post',
      data: { invoiceNos },
    },
  };
}

export function loadUploadRecords({ pageSize, current, filter }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPLOAD_RECORDS_LOAD,
        actionTypes.UPLOAD_RECORDS_LOAD_SUCCEED,
        actionTypes.UPLOAD_RECORDS_LOAD_FAIL,
      ],
      endpoint: 'v1/sof/invoices/upload/record/load',
      method: 'get',
      params: { pageSize, current, filter },
    },
  };
}

export function emptyLoadRecords(uploadNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EMPTY_UPLOAD_RECORDS,
        actionTypes.EMPTY_UPLOAD_RECORDS_SUCCEED,
        actionTypes.EMPTY_UPLOAD_RECORDS_FAIL,
      ],
      endpoint: 'v1/sof/invoices/upload/record/empty',
      method: 'post',
      data: { uploadNo },
    },
  };
}
