import { CLIENT_API } from '../requester';
import { createActionTypes } from 'client/common/redux-actions';
const initialState = {
  loaded: false, // used by isLoad action
  loading: false,
  needUpdate: false,
  editIndex: -1,
  formData: {},
  customers: [],
  bills: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: []
  }
};

const actions = [
  'BL_LOAD', 'BL_LOAD_SUCCEED', 'BL_LOAD_FAIL', 'BL_SUBMIT', 'BL_SUBMIT_SUCCEED', 'BL_SUBMIT_FAIL',
  'BL_UPDATE', 'BL_UPDATE_SUCCEED', 'BL_UPDATE_FAIL', 'BL_DELETE', 'BL_DELETE_SUCCEED', 'BL_DELETE_FAIL',
  'BL_FIELD_UPDATE', 'BL_BEGIN_EDIT', 'BL_EDIT', 'BL_EDIT_CANCEL'
];
const domain = '@@qm-wewms/bill/';
const actionTypes = createActionTypes(domain, actions);

export default function reducer(state = initialState, action) {
  switch (action.type) {
  case actionTypes.BL_LOAD:
    return { ...state, loading: true, needUpdate: false };
  case actionTypes.BL_LOAD_SUCCEED:
    return { ...state, loaded: true, loading: false, bills: action.result.data.bills,
      customers: action.result.data.customers };
  case actionTypes.BL_SUBMIT_SUCCEED: {
    action.callback();
    let dataArray;
    if (state.bills.totalCount === 0 || (((state.bills.totalCount / state.bills.pageSize) >> 0) + 1
                                          === state.bills.current)) {
      // 数据为空或当前页未满,更新新增的数据到state
      dataArray = [...state.bills.data];
      dataArray.push({ ...action.data.bill, key: action.result.data.id });
    }
    return { ...state, bills: { ...state.bills, totalCount: state.bills.totalCount + 1,
      data: dataArray || state.bills.data } };
  }
  case actionTypes.BL_UPDATE_SUCCEED: {
    const dataArray = [...state.bills.data];
    dataArray[action.index] = action.data.bill;
    action.callback();
    return { ...state, bills: { ...state.bills, data: dataArray } };
  }
  case actionTypes.BL_DELETE_SUCCEED:
    return { ...state, needUpdate: true, bills: { ...state.bills, totalCount: state.bills.totalCount - 1 } };
  case actionTypes.BL_BEGIN_EDIT:
    return {...state, formData: action.data.item, editIndex: action.data.index};
  case actionTypes.BL_EDIT:
    return {...state, formData: {...state.formData, [action.data.name]: action.data.value}};
  case actionTypes.BL_EDIT_CANCEL:
    return {...state, formData: {}, editIndex: -1};
  default:
    return state;
  }
}

export function loadBills(params, cookie) {
  return {
    [CLIENT_API]: {
      types: [ actionTypes.BL_LOAD, actionTypes.BL_LOAD_SUCCEED, actionTypes.BL_LOAD_FAIL ],
      endpoint: 'v1/wewms/bills',
      method: 'get',
      params,
      cookie
    }
  };
}

export function submitBill(bill, corpId, tenantId, callback) {
  return {
    [CLIENT_API]: {
      types: [ actionTypes.BL_SUBMIT, actionTypes.BL_SUBMIT_SUCCEED, actionTypes.BL_SUBMIT_FAIL ],
      endpoint: 'v1/wewms/bill',
      method: 'post',
      callback,
      data: { bill, corpId, tenantId }
    }
  };
}

export function updateBill(bill, index, callback) {
  return {
    [CLIENT_API]: {
      types: [ actionTypes.BL_UPDATE, actionTypes.BL_UPDATE_SUCCEED, actionTypes.BL_UPDATE_FAIL ],
      endpoint: 'v1/wewms/bill',
      method: 'put',
      index,
      callback,
      data: { bill }
    }
  };
}

export function delBill(blkey) {
  return {
    [CLIENT_API]: {
      types: [ actionTypes.BL_DELETE, actionTypes.BL_DELETE_SUCCEED, actionTypes.BL_DELETE_FAIL ],
      endpoint: 'v1/wewms/bill',
      method: 'del',
      data: { blkey }
    }
  };
}

export function beginEdit(item, index) {
  return {
    type: actionTypes.BL_BEGIN_EDIT,
    data: {item, index}
  };
}

export function edit(name, value) {
  return {
    type: actionTypes.BL_EDIT,
    data: {name, value}
  };
}

export function cancelEdit() {
  return {
    type: actionTypes.BL_EDIT_CANCEL
  };
}
