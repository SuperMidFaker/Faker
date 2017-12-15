import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
const initialState = {
  loaded: false, // used by isLoad action
  loading: false,
  needUpdate: false,
  formData: {},
  editIndex: -1,
  whlist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
};

const actions = [
  'WH_LOAD', 'WH_LOAD_SUCCEED', 'WH_LOAD_FAIL', 'WH_SUBMIT', 'WH_SUBMIT_SUCCEED', 'WH_SUBMIT_FAIL', 'WH_BEGIN_EDIT', 'WH_EDIT',
  'WH_UPDATE', 'WH_UPDATE_SUCCEED', 'WH_UPDATE_FAIL', 'WH_DELETE', 'WH_DELETE_SUCCEED', 'WH_DELETE_FAIL', 'WH_EDIT_CANCEL',
];
const domain = '@@welogix/cwm/warehouse/';
const actionTypes = createActionTypes(domain, actions);

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.WH_LOAD:
      return { ...state, loading: true, needUpdate: false };
    case actionTypes.WH_LOAD_SUCCEED:
      return {
        ...state, loaded: true, loading: false, whlist: action.result.data,
      };
    case actionTypes.WH_LOAD_FAIL:
      return {
        ...state, loaded: true, loading: false, whlist: initialState.whlist,
      };
    case actionTypes.WH_SUBMIT_SUCCEED: {
      let whDataArray;
      if (state.whlist.totalCount === 0 || (((state.whlist.totalCount / state.whlist.pageSize) >> 0) + 1
                                          === state.whlist.current)) {
      // 数据为空或当前页未满,更新新增的数据到state
        whDataArray = [...state.whlist.data];
        whDataArray.push({ ...action.data.warehouse, key: action.result.data.id });
      }
      return {
        ...state,
        whlist: {
          ...state.whlist,
          totalCount: state.whlist.totalCount + 1,
          data: whDataArray || state.whlist.data,
        },
        formData: {},
        editIndex: -1,
      };
    }
    case actionTypes.WH_UPDATE_SUCCEED: {
      const whDataArray = [...state.whlist.data];
      whDataArray[state.editIndex] = action.data.warehouse;
      return {
        ...state, whlist: { ...state.whlist, data: whDataArray }, formData: {}, editIndex: -1,
      };
    }
    case actionTypes.WH_DELETE_SUCCEED:
      return { ...state, needUpdate: true, whlist: { ...state.whlist, totalCount: state.whlist.totalCount - 1 } };
    case actionTypes.WH_BEGIN_EDIT:
      return { ...state, formData: action.data.item, editIndex: action.data.index };
    case actionTypes.WH_EDIT:
      return { ...state, formData: { ...state.formData, [action.data.name]: action.data.value } };
    case actionTypes.WH_EDIT_CANCEL:
      return { ...state, formData: {}, editIndex: -1 };
    default:
      return state;
  }
}

export function loadWarehouses(params, cookie) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.WH_LOAD, actionTypes.WH_LOAD_SUCCEED, actionTypes.WH_LOAD_FAIL],
      endpoint: 'v1/wecwm/warehouses',
      method: 'get',
      params,
      cookie,
    },
  };
}

export function submitWarehouse(warehouse, corpId, tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.WH_SUBMIT, actionTypes.WH_SUBMIT_SUCCEED, actionTypes.WH_SUBMIT_FAIL],
      endpoint: 'v1/wecwm/warehouse',
      method: 'post',
      data: { warehouse, corpId, tenantId },
    },
  };
}

export function updateWh(warehouse) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.WH_UPDATE, actionTypes.WH_UPDATE_SUCCEED, actionTypes.WH_UPDATE_FAIL],
      endpoint: 'v1/wecwm/warehouse',
      method: 'put',
      data: { warehouse },
    },
  };
}

export function delWh(whkey) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.WH_DELETE, actionTypes.WH_DELETE_SUCCEED, actionTypes.WH_DELETE_FAIL],
      endpoint: 'v1/wecwm/warehouse',
      method: 'del',
      data: { whkey },
    },
  };
}

export function beginEdit(item, index) {
  return {
    type: actionTypes.WH_BEGIN_EDIT,
    data: { item, index },
  };
}

export function edit(name, value) {
  return {
    type: actionTypes.WH_EDIT,
    data: { name, value },
  };
}

export function cancelEdit() {
  return {
    type: actionTypes.WH_EDIT_CANCEL,
  };
}
