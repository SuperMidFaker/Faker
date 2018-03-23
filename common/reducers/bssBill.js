import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/bss/bill', [
  'LOAD_BILLS', 'LOAD_BILLS_SUCCEED', 'LOAD_BILLS_FAIL',
  'TOGGLE_NEW_BILL_MODAL',
  'CREATE_BILL', 'CREATE_BILL_SUCCEED', 'CREATE_BILL_FAIL',
]);

const initialState = {
  billlist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  billListFilter: {
  },
  visibleNewBillModal: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_BILLS:
      return {
        ...state,
        billListFilter: JSON.parse(action.params.filter),
      };
    case actionTypes.LOAD_BILLS_SUCCEED:
      return { ...state, billlist: action.result.data };
    case actionTypes.TOGGLE_NEW_BILL_MODAL:
      return { ...state, visibleNewBillModal: action.data };
    default:
      return state;
  }
}

export function toggleNewBillModal(visible) {
  return {
    type: actionTypes.TOGGLE_NEW_BILL_MODAL,
    data: visible,
  };
}

export function loadBills(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILLS,
        actionTypes.LOAD_BILLS_SUCCEED,
        actionTypes.LOAD_BILLS_FAIL,
      ],
      endpoint: 'v1/bss/bills/load',
      method: 'get',
      params,
    },
  };
}

export function createBill(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_BILL,
        actionTypes.CREATE_BILL_SUCCEED,
        actionTypes.CREATE_BILL_FAIL,
      ],
      endpoint: 'v1/bss/bill/new',
      method: 'post',
      data,
    },
  };
}
