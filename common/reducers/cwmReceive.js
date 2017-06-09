import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/receive/', [
  'LOAD_RECEIVE_MODAL', 'HIDE_RECEIVE_MODAL',
  'HIDE_DETAIL_MODAL', 'SHOW_DETAIL_MODAL', 'ADD_DETAIL',
  'ADD_ASN', 'ADD_ASN_SUCCEED', 'ADD_ASN_FAIL',
  'LOAD_PRODUCTS', 'LOAD_PRODUCTS_SUCCEED', 'LOAD_PRODUCTS_FAIL',
  'LOAD_ASN_LISTS', 'LOAD_ASN_LISTS_SUCCEED', 'LOAD_ASN_LISTS_FAIL',
  'RELEASE_ASN', 'RELEASE_ASN_SUCCEED', 'RELEASE_ASN_FAIL',
  'LOAD_INBOUNDS', 'LOAD_INBOUNDS_SUCCEED', 'LOAD_INBOUNDS_FAIL',
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
    case actionTypes.ADD_DETAIL:
      return { ...state, temporaryDetails: [...state.temporaryDetails, action.data] };
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

export function addDetial(data) {
  return {
    type: actionTypes.ADD_DETAIL,
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

export function loadProducts(productNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PRODUCTS,
        actionTypes.LOAD_PRODUCTS_SUCCEED,
        actionTypes.LOAD_PRODUCTS_FAIL,
      ],
      endpoint: 'v1/cwm/receive/productNos/load',
      method: 'get',
      params: { productNo },
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
      method: 'get',
      params: { asnNo, loginId },
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
