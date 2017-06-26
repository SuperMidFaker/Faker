import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/outbound/', [
  'OPEN_ALLOCATING_MODAL', 'CLOSE_ALLOCATING_MODAL',
  'OPEN_PICKING_MODAL', 'CLOSE_PICKING_MODAL',
  'OPEN_SHIPPING_MODAL', 'CLOSE_SHIPPING_MODAL',
  'LOAD_OUTBOUNDS', 'LOAD_OUTBOUNDS_SUCCEED', 'LOAD_OUTBOUNDS_FAIL',
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
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.OPEN_ALLOCATING_MODAL:
      return { ...state, allocatingModal: { visible: true } };
    case actionTypes.CLOSE_ALLOCATING_MODAL:
      return { ...state, allocatingModal: { visible: false } };
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
    default:
      return state;
  }
}

export function openAllocatingModal() {
  return {
    type: actionTypes.OPEN_ALLOCATING_MODAL,
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
      endpoint: 'v1/cwm/shipping/outbounds/load',
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
        actionTypes.LOAD_OUTBOUND_HEAD_SUCCESS,
        actionTypes.LOAD_OUTBOUND_HEAD_FAIL,
      ],
      endpoint: 'v1/cwm/shipping/outbound/head',
      method: 'get',
      params: { outboundNo },
    },
  };
}
