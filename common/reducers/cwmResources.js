import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/resources/', [
  'OPEN_ADD_WAREHOUSE_MODAL', 'CLOSE_ADD_WAREHOUSE_MODAL',
  'ADD_WAREHOUSE', 'ADD_WAREHOUSE_SUCCEED', 'ADD_WAREHOUSE_FAIL',
]);

const initialState = {
  loadingWarehouse: false,
  reloadWarehouse: false,
  warehouseList: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  listFilter: {
    sortField: '',
    sortOrder: '',
    status: 'all',
    shipment_no: '',
  },
  addWarehouseModal: {
    visible: false,
  },
  brokerPartners: [],
  transpPartners: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.OPEN_ADD_WAREHOUSE_MODAL:
      return { ...state, addWarehouseModal: { visible: true } };
    case actionTypes.CLOSE_ADD_WAREHOUSE_MODAL:
      return { ...state, addWarehouseModal: { visible: false } };
    case actionTypes.ADD_WAREHOUSE_SUCCEED:
      return { ...state, reload: true };
    default:
      return state;
  }
}

export function openAddWarehouseModal() {
  return {
    type: actionTypes.OPEN_ADD_WAREHOUSE_MODAL,
  };
}

export function closeAddWarehouseModal() {
  return {
    type: actionTypes.CLOSE_ADD_WAREHOUSE_MODAL,
  };
}

export function addWarehouse(warehouse) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_WAREHOUSE,
        actionTypes.ADD_WAREHOUSE_SUCCEED,
        actionTypes.ADD_WAREHOUSE_FAIL,
      ],
      endpoint: 'v1/scv/inbound/create/shipment',
      method: 'post',
      data: warehouse,
      origin: 'scv',
    },
  };
}
