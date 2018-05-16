import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/sof/purchase/orders', [
  'LOAD_PURCHASE_ORDERS', 'LOAD_PURCHASE_ORDERS_SUCCEED', 'LOAD_PURCHASE_ORDERS_FAIL',
  'GET_PURCHASE_ORDER', 'GET_PURCHASE_ORDER_SUCCEED', 'GET_PURCHASE_ORDER_FAIL',
  'UPDATE_PURCHASE_ORDER', 'UPDATE_PURCHASE_ORDER_SUCCEED', 'UPDATE_PURCHASE_ORDER_FAIL',
  'BATCH_DELETE_PURCHASE_ORDER', 'BATCH_DELETE_PURCHASE_ORDER_SUCCEED', 'BATCH_DELETE_PURCHASE_ORDER_FAIL',
]);

const initialState = {
  purchaseOrderList: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
  },
  filter: {},
  purchaseOrder: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_PURCHASE_ORDERS_SUCCEED:
      return { ...state, purchaseOrderList: action.result.data };
    case actionTypes.GET_PURCHASE_ORDER_SUCCEED:
      return { ...state, purchaseOrder: action.result.data };
    default:
      return state;
  }
}

export function loadPurchaseOrders({ pageSize, current, filter }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PURCHASE_ORDERS,
        actionTypes.LOAD_PURCHASE_ORDERS_SUCCEED,
        actionTypes.LOAD_PURCHASE_ORDERS_FAIL,
      ],
      endpoint: 'v1/scof/purchase/orders',
      method: 'get',
      params: { pageSize, current, filter },
    },
  };
}

export function getPurchaseOrder(poNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GET_PURCHASE_ORDER,
        actionTypes.GET_PURCHASE_ORDER_SUCCEED,
        actionTypes.GET_PURCHASE_ORDER_FAIL,
      ],
      endpoint: 'v1/scof/purchase/order/get',
      method: 'get',
      params: { poNo },
    },
  };
}

export function updatePurchaseOrder(id, data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_PURCHASE_ORDER,
        actionTypes.UPDATE_PURCHASE_ORDER_SUCCEED,
        actionTypes.UPDATE_PURCHASE_ORDER_FAIL,
      ],
      endpoint: 'v1/scof/purchase/order/update',
      method: 'post',
      data: { id, data },
    },
  };
}

export function batchDeletePurchaseOrders(ids) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.BATCH_DELETE_PURCHASE_ORDER,
        actionTypes.BATCH_DELETE_PURCHASE_ORDER_SUCCEED,
        actionTypes.BATCH_DELETE_PURCHASE_ORDER_FAIL,
      ],
      endpoint: 'v1/scof/purchase/order/batch/delete',
      method: 'post',
      data: { ids },
    },
  };
}
