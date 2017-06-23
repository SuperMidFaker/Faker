import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/receive/', [
  'HIDE_DOCK', 'SHOW_DOCK', 'CHANGE_DOCK_TAB',
  'OPEN_RECEIVE_MODAL', 'HIDE_RECEIVE_MODAL',
  'HIDE_DETAIL_MODAL', 'SHOW_DETAIL_MODAL',
  'ADD_TEMPORARY', 'CLEAR_TEMPORARY', 'DELETE_TEMPORARY', 'EDIT_TEMPORARY',
  'ADD_ASN', 'ADD_ASN_SUCCEED', 'ADD_ASN_FAIL',
  'UPDATE_ASN', 'UPDATE_ASN_SUCCEED', 'UPDATE_ASN_FAIL',
  'LOAD_PRODUCTS', 'LOAD_PRODUCTS_SUCCEED', 'LOAD_PRODUCTS_FAIL',
  'LOAD_ASN', 'LOAD_ASN_SUCCEED', 'LOAD_ASN_FAIL',
  'LOAD_ASN_LISTS', 'LOAD_ASN_LISTS_SUCCEED', 'LOAD_ASN_LISTS_FAIL',
  'RELEASE_ASN', 'RELEASE_ASN_SUCCEED', 'RELEASE_ASN_FAIL',
  'CANCEL_ASN', 'CANCEL_ASN_SUCCEED', 'CANCEL_ASN_FAIL',
  'LOAD_INBOUNDS', 'LOAD_INBOUNDS_SUCCEED', 'LOAD_INBOUNDS_FAIL',
  'GET_INBOUND_DETAIL', 'GET_INBOUND_DETAIL_SUCCEED', 'GET_INBOUND_DETAIL_FAIL',
  'UPDATE_INBMODE', 'UPDATE_INBMODE_SUCCEED', 'UPDATE_INBMODE_FAIL',
  'LOAD_PRODUCT_DETAILS', 'LOAD_PRODUCT_DETAILS_SUCCEED', 'LOAD_PRODUCT_DETAILS_FAIL',
  'UPDATE_PRODUCT_DETAILS', 'UPDATE_PRODUCT_DETAILS_SUCCEED', 'UPDATE_PRODUCT_DETAILS_FAIL',
  'CONFIRM_PRODUCT_DETAILS', 'CONFIRM_PRODUCT_DETAILS_SUCCEED', 'CONFIRM_PRODUCT_DETAILS_FAIL',
  'RECEIVE_COMPLETED', 'RECEIVE_COMPLETED_SUCCEED', 'RECEIVE_COMPLETED_FAIL',
  'SHOW_BATCH_RECEIVING_MODAL', 'HIDE_BATCH_RECEIVING_MODAL',
  'UPDATE_INBOUND_DETAILS', 'UPDATE_INBOUND_DETAILS_SUCCEED', 'UPDATE_INBOUND_DETAILS_FAIL',
  'SHOW_PUTTING_AWAY_MODAL', 'HIDE_PUTTING_AWAY_MODAL',
]);

const initialState = {
  dock: {
    visible: false,
    tabKey: null,
    asn: {
      asn_no: '',
      status: 0,
    },
  },
  receiveModal: {
    visible: false,
    inboundNo: '',
    seqNo: '',
    expectQty: null,
    expectPackQty: null,
    receivedQty: null,
    receivedPackQty: null,
    skuPackQty: null,
    asnNo: '',
    productNo: '',
    name: '',
  },
  detailModal: {
    visible: false,
  },
  temporaryDetails: [],
  productNos: [],
  asnlist: {
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
  inboundFilters: { status: 'create', ownerCode: 'all' },
  batchReceivingModal: {
    visible: false,
  },
  puttingAwayModal: {
    visible: false,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.HIDE_DOCK:
      return { ...state, dock: { ...state.dock, visible: false } };
    case actionTypes.SHOW_DOCK:
      return { ...state, dock: { ...state.dock, visible: true } };
    case actionTypes.CHANGE_DOCK_TAB:
      return { ...state, dock: { ...state.dock, tabKey: action.data.tabKey } };
    case actionTypes.OPEN_RECEIVE_MODAL:
      return { ...state, receiveModal: { ...state.receiveModal, visible: true, ...action.data } };
    case actionTypes.HIDE_RECEIVE_MODAL:
      return { ...state, receiveModal: { ...state.receiveModal, visible: false } };
    case actionTypes.SHOW_DETAIL_MODAL:
      return { ...state, detailModal: { ...state.detailModal, visible: true } };
    case actionTypes.HIDE_DETAIL_MODAL:
      return { ...state, detailModal: { ...state.detailModal, visible: false } };
    case actionTypes.ADD_TEMPORARY:
      return { ...state, temporaryDetails: Array.isArray(action.data) ? action.data : [...state.temporaryDetails, action.data] };
    case actionTypes.CLEAR_TEMPORARY:
      return { ...state, temporaryDetails: [] };
    case actionTypes.DELETE_TEMPORARY: {
      const temporaryDetails = [...state.temporaryDetails];
      temporaryDetails.splice(action.index, 1);
      return { ...state, temporaryDetails };
    }
    case actionTypes.EDIT_TEMPORARY: {
      const temporaryDetails = [...state.temporaryDetails];
      temporaryDetails[action.index] = action.data;
      return { ...state, temporaryDetails };
    }
    case actionTypes.LOAD_PRODUCTS_SUCCEED:
      return { ...state, productNos: action.result.data };
    case actionTypes.LOAD_ASN_LISTS:
      return { ...state, asnFilters: JSON.parse(action.params.filters) };
    case actionTypes.LOAD_ASN_LISTS_SUCCEED:
      return { ...state, asnlist: action.result.data };
    case actionTypes.LOAD_INBOUNDS:
      return { ...state, inboundFilters: JSON.parse(action.params.filters) };
    case actionTypes.LOAD_INBOUNDS_SUCCEED:
      return { ...state, inbound: action.result.data };
    case actionTypes.INBOUND_STATUS_CHANGE:
      return { ...state, inboundFilters: { ...state.inboundFilters, status: action.status } };
    case actionTypes.SHOW_BATCH_RECEIVING_MODAL:
      return { ...state, batchReceivingModal: { ...state.batchReceivingModal, visible: true } };
    case actionTypes.HIDE_BATCH_RECEIVING_MODAL:
      return { ...state, batchReceivingModal: { ...state.batchReceivingModal, visible: false } };
    case actionTypes.SHOW_PUTTING_AWAY_MODAL:
      return { ...state, puttingAwayModal: { ...state.puttingAwayModal, visible: true } };
    case actionTypes.HIDE_PUTTING_AWAY_MODAL:
      return { ...state, puttingAwayModal: { ...state.puttingAwayModal, visible: false } };
    default:
      return state;
  }
}

export function changeDockTab(tabKey) {
  return {
    type: actionTypes.CHANGE_DOCK_TAB,
    data: { tabKey },
  };
}

export function hideDock() {
  return {
    type: actionTypes.HIDE_DOCK,
  };
}

export function showDock() {
  return {
    type: actionTypes.SHOW_DOCK,
  };
}

export function openReceiveModal(modalInfo) {
  return {
    type: actionTypes.OPEN_RECEIVE_MODAL,
    data: modalInfo,
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

export function deleteTemporary(index) {
  return {
    type: actionTypes.DELETE_TEMPORARY,
    index,
  };
}

export function editTemporary(index, data) {
  return {
    type: actionTypes.EDIT_TEMPORARY,
    index,
    data,
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

export function updateASN(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_ASN,
        actionTypes.UPDATE_ASN_SUCCEED,
        actionTypes.UPDATE_ASN_FAIL,
      ],
      endpoint: 'v1/cwm/receive/asn/update',
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

export function loadAsn(asnNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ASN,
        actionTypes.LOAD_ASN_SUCCEED,
        actionTypes.LOAD_ASN_FAIL,
      ],
      endpoint: 'v1/cwm/receive/asn/load',
      method: 'get',
      params: { asnNo },
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

export function releaseAsn(asnNo, loginId, whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RELEASE_ASN,
        actionTypes.RELEASE_ASN_SUCCEED,
        actionTypes.RELEASE_ASN_FAIL,
      ],
      endpoint: 'v1/cwm/receive/asn/release',
      method: 'post',
      data: { asnNo, loginId, whseCode },
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

export function loadInbounds({ whseCode, tenantId, pageSize, current, filters }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_INBOUNDS,
        actionTypes.LOAD_INBOUNDS_SUCCEED,
        actionTypes.LOAD_INBOUNDS_FAIL,
      ],
      endpoint: 'v1/cwm/receive/inbounds/load',
      method: 'get',
      params: { whseCode, tenantId, pageSize, current, filters: JSON.stringify(filters) },
    },
  };
}

export function getInboundDetail(inboundNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GET_INBOUND_DETAIL,
        actionTypes.GET_INBOUND_DETAIL_SUCCEED,
        actionTypes.GET_INBOUND_DETAIL_FAIL,
      ],
      endpoint: 'v1/cwm/receive/inbound/detail',
      method: 'get',
      params: { inboundNo },
    },
  };
}

export function loadProductDetails(inboundNo, seqNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PRODUCT_DETAILS,
        actionTypes.LOAD_PRODUCT_DETAILS_SUCCEED,
        actionTypes.LOAD_PRODUCT_DETAILS_FAIL,
      ],
      endpoint: 'v1/cwm/receive/product/details/load',
      method: 'get',
      params: { inboundNo, seqNo },
    },
  };
}

export function updateInboundMode(inboundNo, recMode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_INBMODE,
        actionTypes.UPDATE_INBMODE_SUCCEED,
        actionTypes.UPDATE_INBMODE_FAIL,
      ],
      endpoint: 'v1/cwm/receive/inbound/update/recmode',
      method: 'post',
      data: { inboundNo, recMode },
    },
  };
}

export function updateProductDetails(dataSource, inboundNo, seqNo, asnNo, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_PRODUCT_DETAILS,
        actionTypes.UPDATE_PRODUCT_DETAILS_SUCCEED,
        actionTypes.UPDATE_PRODUCT_DETAILS_FAIL,
      ],
      endpoint: 'v1/cwm/receive/product/details/update',
      method: 'post',
      data: { loginId, inboundNo, dataSource, seqNo, asnNo },
    },
  };
}

export function confirm(inboundNo, asnNo, loginId, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CONFIRM_PRODUCT_DETAILS,
        actionTypes.CONFIRM_PRODUCT_DETAILS_SUCCEED,
        actionTypes.CONFIRM_PRODUCT_DETAILS_FAIL,
      ],
      endpoint: 'v1/cwm/receive/product/details/confirm',
      method: 'post',
      data: { inboundNo, asnNo, loginId, tenantId },
    },
  };
}

export function receiveCompleted(asnNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RECEIVE_COMPLETED,
        actionTypes.RECEIVE_COMPLETED_SUCCEED,
        actionTypes.RECEIVE_COMPLETED_FAIL,
      ],
      endpoint: 'v1/cwm/receive/receive/completed',
      method: 'post',
      data: { asnNo },
    },
  };
}

export function showBatchReceivingModal() {
  return {
    type: actionTypes.SHOW_BATCH_RECEIVING_MODAL,
  };
}

export function hideBatchReceivingModal() {
  return {
    type: actionTypes.HIDE_BATCH_RECEIVING_MODAL,
  };
}

export function showPuttingAwayModal() {
  return {
    type: actionTypes.SHOW_PUTTING_AWAY_MODAL,
  };
}

export function hidePuttingAwayModal() {
  return {
    type: actionTypes.HIDE_PUTTING_AWAY_MODAL,
  };
}

export function updateInboundDetails(seqNos, location, damageLevel, loginId, asnNo, inboundNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_INBOUND_DETAILS,
        actionTypes.UPDATE_INBOUND_DETAILS_SUCCEED,
        actionTypes.UPDATE_INBOUND_DETAILS_FAIL,
      ],
      endpoint: 'v1/cwm/receive/express',
      method: 'post',
      data: { seqNos, location, damageLevel, loginId, asnNo, inboundNo },
    },
  };
}
