import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/sof/orderpref/', [
  'LOAD_ORDERTYPES', 'LOAD_ORDERTYPES_SUCCEED', 'LOAD_ORDERTYPES_FAIL',
  'TOGGLE_ORDERTYPE_MODAL',
  'UPST_ORDERT', 'UPST_ORDERT_SUCCEED', 'UPST_ORDERT_FAIL',
  'REMV_ORDERT', 'REMV_ORDERT_SUCCEED', 'REMV_ORDERT_FAIL',
  'LOAD_REQORDERTS', 'LOAD_REQORDERTS_SUCCEED', 'LOAD_REQORDERTS_FAIL',
]);

const initialState = {
  orderTypeList: {
    loading: false,
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
  },
  typeListReload: false,
  orderTypeModal: {
    visible: false,
    orderType: {},
  },
  requireOrderTypes: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_ORDERTYPES:
      return {
        ...state,
        typeListReload: false,
        orderTypeList: {
          ...state.orderTypeList,
          loading: true,
          totalCount: 0,
          data: [],
          pageSize: action.params.pageSize,
          current: action.params.current,
        },
      };
    case actionTypes.LOAD_ORDERTYPES_FAIL:
      return { ...state, orderTypeList: initialState.orderTypeList };
    case actionTypes.LOAD_ORDERTYPES_SUCCEED:
      return {
        ...state,
        orderTypeList: { ...state.orderTypeList, loading: false, ...action.result.data },
      };
    case actionTypes.TOGGLE_ORDERTYPE_MODAL:
      return { ...state, orderTypeModal: { ...state.orderTypeModal, ...action.data } };
    case actionTypes.UPST_ORDERT_SUCCEED:
      return {
        ...state,
        typeListReload: true,
        orderTypeModal: {
          ...state.orderTypeModal,
          orderType: { ...state.orderTypeModal.orderType, ...action.data, ...action.result.data },
        },
      };
    case actionTypes.LOAD_REQORDERTS_SUCCEED:
      return { ...state, requireOrderTypes: action.result.data };
    default:
      return state;
  }
}

export function loadOrderTypes(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ORDERTYPES,
        actionTypes.LOAD_ORDERTYPES_SUCCEED,
        actionTypes.LOAD_ORDERTYPES_FAIL,
      ],
      endpoint: 'v1/sof/order/pref/types',
      method: 'get',
      params,
    },
  };
}

export function toggleOrderTypeModal(visible, orderType) {
  return {
    type: actionTypes.TOGGLE_ORDERTYPE_MODAL,
    data: { visible, orderType },
  };
}

export function upsertOrderType(orderType) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPST_ORDERT,
        actionTypes.UPST_ORDERT_SUCCEED,
        actionTypes.UPST_ORDERT_FAIL,
      ],
      endpoint: 'v1/sof/order/type/upsert',
      method: 'post',
      data: orderType,
    },
  };
}

export function removeOrderType(orderTypeId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMV_ORDERT,
        actionTypes.REMV_ORDERT_SUCCEED,
        actionTypes.REMV_ORDERT_FAIL,
      ],
      endpoint: 'v1/sof/order/type/remove',
      method: 'post',
      data: { id: orderTypeId },
    },
  };
}

export function loadRequireOrderTypes() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_REQORDERTS,
        actionTypes.LOAD_REQORDERTS_SUCCEED,
        actionTypes.LOAD_REQORDERTS_FAIL,
      ],
      endpoint: 'v1/sof/order/require/types',
      method: 'get',
    },
  };
}
