import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/warehouse/', [
  'SHOW_WAREHOUSE_MODAL', 'HIDE_WAREHOUSE_MODAL',
]);

const initialState = {
  warehouseModal: {
    visible: false,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.SHOW_WAREHOUSE_MODAL:
      return { ...state, warehouseModal: { ...state.warehouseModal, visible: true } };
    case actionTypes.HIDE_WAREHOUSE_MODAL:
      return { ...state, warehouseModal: { ...state.warehouseModal, visible: false } };
    default:
      return state;
  }
}

export function showWarehouseModal() {
  return {
    type: actionTypes.SHOW_WAREHOUSE_MODAL,
  };
}

export function hideWarehouseModal() {
  return {
    type: actionTypes.HIDE_WAREHOUSE_MODAL,
  };
}
