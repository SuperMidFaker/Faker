import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/outbound/', [
  'OPEN_ALLOCATING_MODAL', 'CLOSE_ALLOCATING_MODAL',
  'OPEN_PICKING_MODAL', 'CLOSE_PICKING_MODAL',
  'OPEN_SHIPPING_MODAL', 'CLOSE_SHIPPING_MODAL',
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
