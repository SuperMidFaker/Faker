import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/receive/', [
  'LOAD_RECEIVE_MODAL', 'HIDE_RECEIVE_MODAL',
  'HIDE_DETAIL_MODAL', 'SHOW_DETAIL_MODAL',
  'ADD_TEMPORARY', 'CLEAR_TEMPORARY',
  'ADD_ASN', 'ADD_ASN_SUCCEED', 'ADD_ASN_FAIL',
  'LOAD_PRODUCTS', 'LOAD_PRODUCTS_SUCCEED', 'LOAD_PRODUCTS_FAIL',
  'LOAD_ASN_LISTS', 'LOAD_ASN_LISTS_SUCCEED', 'LOAD_ASN_LISTS_FAIL',
  'RELEASE_ASN', 'RELEASE_ASN_SUCCEED', 'RELEASE_ASN_FAIL',
  'CANCEL_ASN', 'CANCEL_ASN_SUCCEED', 'CANCEL_ASN_FAIL',
  'LOAD_INBOUNDS', 'LOAD_INBOUNDS_SUCCEED', 'LOAD_INBOUNDS_FAIL',
  'GET_INBOUND_DETAIL', 'GET_INBOUND_DETAIL_SUCCEED', 'GET_INBOUND_DETAIL_FAIL',
  'UPDATE_RECEIVED_QTY', 'UPDATE_RECEIVED_QTY_SUCCEED', 'UPDATE_RECEIVED_QTY_FAIL',
  'UPDATE_INBOUND_MULTIPLE', 'UPDATE_INBOUND_MULTIPLE_SUCCEED', 'UPDATE_INBOUND_MULTIPLE_FAIL',
]);

const initialState = {
  receiveModal: {
    visible: false,
  },
  detailModal: {
    visible: false,
  },
  temporaryDetails: [],
  productNos: [],
  asn: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
  },
  asnFilters: { status: 'pending', ownerCode: 'all' },
  inbound: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
  },
  inboundFilters: { status: 'all', ownerCode: 'all' },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_RECEIVE_MODAL:
      return { ...state, receiveModal: { ...state.receiveModal, visible: true } };
    case actionTypes.HIDE_RECEIVE_MODAL:
      return { ...state, receiveModal: { ...state.receiveModal, visible: false } };
    case actionTypes.SHOW_DETAIL_MODAL:
      return { ...state, detailModal: { ...state.detailModal, visible: true } };
    case actionTypes.HIDE_DETAIL_MODAL:
      return { ...state, detailModal: { ...state.detailModal, visible: false } };
    case actionTypes.ADD_TEMPORARY:
      return { ...state, temporaryDetails: [...state.temporaryDetails, action.data] };
    case actionTypes.CLEAR_TEMPORARY:
      return { ...state, temporaryDetails: [] };
    case actionTypes.LOAD_PRODUCTS_SUCCEED:
      return { ...state, productNos: action.result.data };
    case actionTypes.LOAD_ASN_LISTS_SUCCEED:
      return { ...state, asn: action.result.data };
    case actionTypes.LOAD_INBOUNDS_SUCCEED:
      return { ...state, inbound: action.result.data };
    default:
      return state;
  }
}

export function loadReceiveModal() {
  return {
    type: actionTypes.LOAD_RECEIVE_MODAL,
  };
}

export function hideReceiveModal() {
  return {
    type: actionTypes.HIDE_RECEIVE_MODAL,
  };
}

export function showDetailModal() {
  return {
    type: actionTypes.SHOW_DETAIL_MODAL,
  };
}

export function hideDetailModal() {
  return {
    type: actionTypes.HIDE_DETAIL_MODAL,
  };
}

export function addTemporary(data) {
  return {
    type: actionTypes.ADD_TEMPORARY,
    data,
  };
}

export function clearTemporary() {
  return {
    type: actionTypes.CLEAR_TEMPORARY,
  };
}

export function addASN(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_ASN,
        actionTypes.ADD_ASN_SUCCEED,
        actionTypes.ADD_ASN_FAIL,
      ],
      endpoint: 'v1/cwm/receive/asn/add',
      method: 'post',
      data,
    },
  };
}

export function loadProducts(productNo, partnerId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PRODUCTS,
        actionTypes.LOAD_PRODUCTS_SUCCEED,
        actionTypes.LOAD_PRODUCTS_FAIL,
      ],
      endpoint: 'v1/cwm/receive/productNos/load',
      method: 'get',
      params: { productNo, partnerId },
    },
  };
}

export function loadAsnLists({ whseCode, pageSize, current, filters }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ASN_LISTS,
        actionTypes.LOAD_ASN_LISTS_SUCCEED,
        actionTypes.LOAD_ASN_LISTS_FAIL,
      ],
      endpoint: 'v1/cwm/receive/asnLists/load',
      method: 'get',
      params: { whseCode, pageSize, current, filters: JSON.stringify(filters) },
    },
  };
}

export function releaseAsn(asnNo, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RELEASE_ASN,
        actionTypes.RELEASE_ASN_SUCCEED,
        actionTypes.RELEASE_ASN_FAIL,
      ],
      endpoint: 'v1/cwm/receive/asn/release',
      method: 'post',
      data: { asnNo, loginId },
    },
  };
}

export function cancelAsn(asnNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CANCEL_ASN,
        actionTypes.CANCEL_ASN_SUCCEED,
        actionTypes.CANCEL_ASN_FAIL,
      ],
      endpoint: 'v1/cwm/receive/asn/cancel',
      method: 'post',
      data: { asnNo },
    },
  };
}

export function loadInbounds({ tenantId, pageSize, current, filters }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_INBOUNDS,
        actionTypes.LOAD_INBOUNDS_SUCCEED,
        actionTypes.LOAD_INBOUNDS_FAIL,
      ],
      endpoint: 'v1/cwm/receive/inbounds/load',
      method: 'get',
      params: { tenantId, pageSize, current, filters: JSON.stringify(filters) },
    },
  };
}

export function getInboundDetail(asnNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GET_INBOUND_DETAIL,
        actionTypes.GET_INBOUND_DETAIL_SUCCEED,
        actionTypes.GET_INBOUND_DETAIL_FAIL,
      ],
      endpoint: 'v1/cwm/receive/inboundDetail',
      method: 'get',
      params: { asnNo },
    },
  };
}

export function updateReceivedQty(asnNo, asnSeqNo, receivedPackQty, receivedQty, tenantId, loginId, traceId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_RECEIVED_QTY,
        actionTypes.UPDATE_RECEIVED_QTY_SUCCEED,
        actionTypes.UPDATE_RECEIVED_QTY_FAIL,
      ],
      endpoint: 'v1/cwm/receive/receivedQty/update',
      method: 'post',
      data: { asnNo, asnSeqNo, receivedPackQty, receivedQty, tenantId, loginId, traceId },
    },
  };
}

export function updateInboundMultiple(data, loginId, tenantId, whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_INBOUND_MULTIPLE,
        actionTypes.UPDATE_INBOUND_MULTIPLE_SUCCEED,
        actionTypes.UPDATE_INBOUND_MULTIPLE_FAIL,
      ],
      endpoint: 'v1/cwm/receive/inbound/multiple/update',
      method: 'post',
      data: { data, loginId, tenantId, whseCode },
=======
      endpoint: 'v1/cwm/receive/inboundDetail/update',
      method: 'post',
      data: { asnNo, asnSeqNo, type, value },
>>>>>>> cwmReceive change
    },
  };
}
