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
  'LOAD_INBOUNDHEAD', 'LOAD_INBOUNDHEAD_SUCCEED', 'LOAD_INBOUNDHEAD_FAIL',
  'LOAD_INBPRDDETAILS', 'LOAD_INBPRDDETAILS_SUCCEED', 'LOAD_INBPRDDETAILS_FAIL',
  'LOAD_INBPUTAWAYS', 'LOAD_INBPUTAWAYS_SUCCEED', 'LOAD_INBPUTAWAYS_FAIL',
  'GET_INBOUND_DETAIL', 'GET_INBOUND_DETAIL_SUCCEED', 'GET_INBOUND_DETAIL_FAIL',
  'UPDATE_INBMODE', 'UPDATE_INBMODE_SUCCEED', 'UPDATE_INBMODE_FAIL',
  'LOAD_PRODUCT_DETAILS', 'LOAD_PRODUCT_DETAILS_SUCCEED', 'LOAD_PRODUCT_DETAILS_FAIL',
  'UPDATE_PRODUCT_DETAILS', 'UPDATE_PRODUCT_DETAILS_SUCCEED', 'UPDATE_PRODUCT_DETAILS_FAIL',
  'CONFIRM_PRODUCT_DETAILS', 'CONFIRM_PRODUCT_DETAILS_SUCCEED', 'CONFIRM_PRODUCT_DETAILS_FAIL',
  'RECEIVE_COMPLETED', 'RECEIVE_COMPLETED_SUCCEED', 'RECEIVE_COMPLETED_FAIL',
  'SHOW_BATCH_RECEIVING_MODAL', 'HIDE_BATCH_RECEIVING_MODAL',
  'UPDATE_INBOUND_DETAILS', 'UPDATE_INBOUND_DETAILS_SUCCEED', 'UPDATE_INBOUND_DETAILS_FAIL',
  'RECEIVE_PRODUCT', 'RECEIVE_PRODUCT_SUCCEED', 'RECEIVE_PRODUCT_FAIL',
  'RECEIVE_EXPRESS', 'RECEIVE_EXPRESS_SUCCEED', 'RECEIVE_EXPRESS_FAIL',
  'RECEIVE_BATCH', 'RECEIVE_BATCH_SUCCEED', 'RECEIVE_BATCH_FAIL',
  'RECEIVES_UNDO', 'RECEIVES_UNDO_SUCCEED', 'RECEIVES_UNDO_FAIL',
  'PUTAWAY_BATCH', 'PUTAWAY_BATCH_SUCCEED', 'PUTAWAY_BATCH_FAIL',
  'PUTAWAY_EXPRESS', 'PUTAWAY_EXPRESS_SUCCEED', 'PUTAWAY_EXPRESS_FAIL',
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
    inboundProduct: {},
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
  inboundFormHead: {},
  inboundProducts: [],
  inboundPutaways: [],
  inboundReload: false,
  batchReceivingModal: {
    visible: false,
  },
  puttingAwayModal: {
    visible: false,
    details: [],
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
    case actionTypes.LOAD_INBOUNDHEAD_SUCCEED:
      return { ...state, inboundFormHead: action.result.data, inboundReload: false };
    case actionTypes.LOAD_INBPRDDETAILS_SUCCEED:
      return { ...state, inboundProducts: action.result.data, inboundReload: false };
    case actionTypes.LOAD_INBPUTAWAYS_SUCCEED:
      return { ...state, inboundPutaways: action.result.data, inboundReload: false };
    case actionTypes.UPDATE_INBMODE_SUCCEED:
      return { ...state, inboundFormHead: { ...state.inboundFormHead, rec_mode: action.data.recMode } };
    case actionTypes.SHOW_BATCH_RECEIVING_MODAL:
      return { ...state, batchReceivingModal: { ...state.batchReceivingModal, visible: true } };
    case actionTypes.HIDE_BATCH_RECEIVING_MODAL:
      return { ...state, batchReceivingModal: { ...state.batchReceivingModal, visible: false } };
    case actionTypes.SHOW_PUTTING_AWAY_MODAL:
      return { ...state, puttingAwayModal: { ...state.puttingAwayModal, visible: true, details: action.data } };
    case actionTypes.HIDE_PUTTING_AWAY_MODAL:
      return { ...state, puttingAwayModal: { ...state.puttingAwayModal, visible: false } };
    case actionTypes.RECEIVE_PRODUCT_SUCCEED:
    case actionTypes.RECEIVE_EXPRESS_SUCCEED:
    case actionTypes.RECEIVE_BATCH_SUCCEED:
    case actionTypes.RECEIVES_UNDO_SUCCEED:
    case actionTypes.PUTAWAY_BATCH_SUCCEED:
    case actionTypes.PUTAWAY_EXPRESS_SUCCEED:
      return { ...state, inboundReload: true };
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

export function loadInboundHead(inboundNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_INBOUNDHEAD,
        actionTypes.LOAD_INBOUNDHEAD_SUCCEED,
        actionTypes.LOAD_INBOUNDHEAD_FAIL,
      ],
      endpoint: 'v1/cwm/inbound/head',
      method: 'get',
      params: { inboundNo },
    },
  };
}

export function loadInboundProductDetails(inboundNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_INBPRDDETAILS,
        actionTypes.LOAD_INBPRDDETAILS_SUCCEED,
        actionTypes.LOAD_INBPRDDETAILS_FAIL,
      ],
      endpoint: 'v1/cwm/inbound/product/details',
      method: 'get',
      params: { inboundNo },
    },
  };
}

export function loadInboundPutaways(inboundNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_INBPUTAWAYS,
        actionTypes.LOAD_INBPUTAWAYS_SUCCEED,
        actionTypes.LOAD_INBPUTAWAYS_FAIL,
      ],
      endpoint: 'v1/cwm/inbound/putaway/details',
      method: 'get',
      params: { inboundNo },
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

export function showPuttingAwayModal(details) {
  return {
    type: actionTypes.SHOW_PUTTING_AWAY_MODAL,
    data: details,
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

export function updateInboundMode(inboundNo, recMode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_INBMODE,
        actionTypes.UPDATE_INBMODE_SUCCEED,
        actionTypes.UPDATE_INBMODE_FAIL,
      ],
      endpoint: 'v1/cwm/inbound/update/recmode',
      method: 'post',
      data: { inboundNo, recMode },
    },
  };
}

export function receiveProduct(dataSource, inboundNo, seqNo, asnNo, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RECEIVE_PRODUCT,
        actionTypes.RECEIVE_PRODUCT_SUCCEED,
        actionTypes.RECEIVE_PRODUCT_FAIL,
      ],
      endpoint: 'v1/cwm/inbound/product/receipt',
      method: 'post',
      data: { dataSource, seqNo, asnNo, loginId, inboundNo },
    },
  };
}

export function expressReceive(inboundNo, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RECEIVE_EXPRESS,
        actionTypes.RECEIVE_EXPRESS_SUCCEED,
        actionTypes.RECEIVE_EXPRESS_FAIL,
      ],
      endpoint: 'v1/cwm/inbound/receipt/express',
      method: 'post',
      data: { loginId, inboundNo },
    },
  };
}

export function batchReceive(seqNos, location, damageLevel, loginId, asnNo, inboundNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RECEIVE_BATCH,
        actionTypes.RECEIVE_BATCH_SUCCEED,
        actionTypes.RECEIVE_BATCH_FAIL,
      ],
      endpoint: 'v1/cwm/inbound/product/receipt/batch',
      method: 'post',
      data: { seqNos, location, damageLevel, loginId, asnNo, inboundNo },
    },
  };
}

export function undoReceives(inboundNo, loginId, traceIds) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RECEIVES_UNDO,
        actionTypes.RECEIVES_UNDO_SUCCEED,
        actionTypes.RECEIVES_UNDO_FAIL,
      ],
      endpoint: 'v1/cwm/inbound/product/receipt/undo',
      method: 'post',
      data: { loginId, trace_ids: traceIds, inbound_no: inboundNo },
    },
  };
}

export function batchPutaways(traceIds, location, allocater, allocateDt, loginId, inboundNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.PUTAWAY_BATCH,
        actionTypes.PUTAWAY_BATCH_SUCCEED,
        actionTypes.PUTAWAY_BATCH_FAIL,
      ],
      endpoint: 'v1/cwm/inbound/product/putaway/batch',
      method: 'post',
      data: { traceIds, location, allocater, allocateDt, loginId, inboundNo },
    },
  };
}

export function expressPutaways(loginId, loginName, inboundNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.PUTAWAY_EXPRESS,
        actionTypes.PUTAWAY_EXPRESS_SUCCEED,
        actionTypes.PUTAWAY_EXPRESS_FAIL,
      ],
      endpoint: 'v1/cwm/inbound/product/putaway/express',
      method: 'post',
      data: { loginName, loginId, inboundNo },
    },
  };
}

