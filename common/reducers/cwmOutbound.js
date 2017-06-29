import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/outbound/', [
  'OPEN_ALLOCATING_MODAL', 'CLOSE_ALLOCATING_MODAL',
  'OPEN_PICKING_MODAL', 'CLOSE_PICKING_MODAL',
  'OPEN_SHIPPING_MODAL', 'CLOSE_SHIPPING_MODAL',
  'LOAD_OUTBOUNDS', 'LOAD_OUTBOUNDS_SUCCEED', 'LOAD_OUTBOUNDS_FAIL',
  'LOAD_OUTBOUND_HEAD', 'LOAD_OUTBOUND_HEAD_SUCCEED', 'LOAD_OUTBOUND_HEAD_FAIL',
  'LOAD_OUTBOUND_PRODUCTS', 'LOAD_OUTBOUND_PRODUCTS_SUCCEED', 'LOAD_OUTBOUND_PRODUCTS_FAIL',
  'LOAD_PRODUCT_INBOUND_DETAILS', 'LOAD_PRODUCT_INBOUND_DETAILS_SUCCEED', 'LOAD_PRODUCT_INBOUND_DETAILS_FAIL',
]);

const initialState = {
  listFilter: {
    sortField: '',
    sortOrder: '',
    status: 'all',
    shipment_no: '',
  },
  allocatingModal: {
    visible: false,
    outboundNo: '',
    ownerCode: '',
    outboundProduct: {},
  },
  pickingModal: {
    visible: false,
  },
  shippingModal: {
    visible: false,
  },
  outbound: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
  },
  outboundFilters: { status: 'create', ownerCode: 'all' },
  outboundFormHead: {},
  outboundProducts: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.OPEN_ALLOCATING_MODAL:
      return { ...state, allocatingModal: { ...state.allocatingModal, visible: true, ...action.data } };
    case actionTypes.CLOSE_ALLOCATING_MODAL:
      return { ...state, allocatingModal: { ...state.allocatingModal, visible: false } };
    case actionTypes.OPEN_PICKING_MODAL:
      return { ...state, pickingModal: { visible: true } };
    case actionTypes.CLOSE_PICKING_MODAL:
      return { ...state, pickingModal: { visible: false } };
    case actionTypes.OPEN_SHIPPING_MODAL:
      return { ...state, shippingModal: { visible: true } };
    case actionTypes.CLOSE_SHIPPING_MODAL:
      return { ...state, shippingModal: { visible: false } };
    case actionTypes.LOAD_OUTBOUNDS:
      return { ...state, outboundFilters: JSON.parse(action.params.filters) };
    case actionTypes.LOAD_OUTBOUNDS_SUCCEED:
      return { ...state, outbound: action.result.data };
    case actionTypes.LOAD_OUTBOUND_HEAD_SUCCEED:
      return { ...state, outboundFormHead: action.result.data };
    case actionTypes.LOAD_OUTBOUND_PRODUCTS_SUCCEED:
      return { ...state, outboundProducts: action.result.data };
    default:
      return state;
  }
}

export function openAllocatingModal(modalInfo) {
  return {
    type: actionTypes.OPEN_ALLOCATING_MODAL,
    data: modalInfo,
  };
}

export function closeAllocatingModal() {
  return {
    type: actionTypes.CLOSE_ALLOCATING_MODAL,
  };
}

export function openPickingModal() {
  return {
    type: actionTypes.OPEN_PICKING_MODAL,
  };
}

export function closePickingModal() {
  return {
    type: actionTypes.CLOSE_PICKING_MODAL,
  };
}

export function openShippingModal() {
  return {
    type: actionTypes.OPEN_SHIPPING_MODAL,
  };
}

export function closeShippingModal() {
  return {
    type: actionTypes.CLOSE_SHIPPING_MODAL,
  };
}

export function loadOutbounds({ whseCode, tenantId, pageSize, current, filters }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_OUTBOUNDS,
        actionTypes.LOAD_OUTBOUNDS_SUCCEED,
        actionTypes.LOAD_OUTBOUNDS_FAIL,
      ],
      endpoint: 'v1/cwm/outbounds',
      method: 'get',
      params: { whseCode, tenantId, pageSize, current, filters: JSON.stringify(filters) },
    },
  };
}

export function loadOutboundHead(outboundNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_OUTBOUND_HEAD,
        actionTypes.LOAD_OUTBOUND_HEAD_SUCCEED,
        actionTypes.LOAD_OUTBOUND_HEAD_FAIL,
      ],
      endpoint: 'v1/cwm/shipping/outbound/head',
      method: 'get',
      params: { outboundNo },
    },
  };
}

export function loadOutboundProductDetails(outboundNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_OUTBOUND_PRODUCTS,
        actionTypes.LOAD_OUTBOUND_PRODUCTS_SUCCEED,
        actionTypes.LOAD_OUTBOUND_PRODUCTS_FAIL,
      ],
      endpoint: 'v1/cwm/shipping/outbound/products',
      method: 'get',
      params: { outboundNo },
    },
  };
}

export function loadProductInboundDetail(productNo, whseCode, ownerId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PRODUCT_INBOUND_DETAILS,
        actionTypes.LOAD_PRODUCT_INBOUND_DETAILS_SUCCEED,
        actionTypes.LOAD_PRODUCT_INBOUND_DETAILS_FAIL,
      ],
      endpoint: 'v1/cwm/shipping/product/inbound/details',
      method: 'get',
      params: { productNo, whseCode, ownerId },
    },
  };
}
