import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';
const initialState = {
  loaded: false, // used by isLoad action
  loading: false,
  formData: {},
  editIndex: -1,
  idlist: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: []
  },
  statusList: {// 初始化状态显示数量
    notSendCount:0,
    notAcceptCount:0,
    acceptCount:0,
    invalidCount:0
  },
  customsBrokerList: []
};
// 定义操作状态 每个操作默认有三个状态 [进行时、成功、失败],在每个action提交的时候,type数组必须按照该类型排序
const actions = [
  'ID_LOAD', 'ID_LOAD_SUCCEED', 'ID_LOAD_FAIL',
  'ID_SUBMIT', 'ID_SUBMIT_SUCCEED', 'ID_SUBMIT_FAIL',
  'ID_UPDATE', 'ID_UPDATE_SUCCEED', 'ID_UPDATE_FAIL',
  'ID_DELETE', 'ID_DELETE_SUCCEED', 'ID_DELETE_FAIL',
  'ID_EDIT_CANCEL', 'ID_EDIT',
  'ID_LOAD_STATUS_SUCCEED', 'ID_LOAD_STATUS_FAIL', 'ID_LOAD_STATUS',
  'ID_LOAD_CUSTOMSBROKERS', 'ID_LOAD_CUSTOMSBROKERS_SUCCEED', 'ID_LOAD_CUSTOMSBROKERS_FAIL'
];
const domain = '@@qm-import/importdelegate/';
const actionTypes = createActionTypes(domain, actions);

export default function reducer(state = initialState, action) {
  switch (action.type) {
  case actionTypes.ID_LOAD:
    return { ...state, loading: true };
  case actionTypes.ID_LOAD_SUCCEED:
    return { ...state, loaded: true, loading: false, idlist: action.result.data };
  case actionTypes.ID_LOAD_FAIL:
    return { ...state, loaded: true, loading: false, idlist: initialState.idlist };
  case actionTypes.ID_SUBMIT_SUCCEED: {
    let idDataArray;
    if (state.idlist.totalCount === 0 || (((state.idlist.totalCount / state.idlist.pageSize) >> 0) + 1
                                          === state.idlist.current)) {
      // 数据为空或当前页未满,更新新增的数据到state
      idDataArray = [...state.idlist.data];
      idDataArray.push({ ...action.data.importdelegate, key: action.result.data.id });
    }
    return { ...state, idlist: { ...state.idlist, totalCount: state.idlist.totalCount + 1,
      data: idDataArray || state.idlist.data }, formData: {}, editIndex: -1 };
  }
  case actionTypes.ID_UPDATE_SUCCEED: {
    const idDataArray = [...state.idlist.data];
    idDataArray[state.editIndex] = action.data.importdelegate;
    return { ...state, idlist: { ...state.idlist, data: idDataArray }, formData: {}, editIndex: -1 };
  }
  case actionTypes.ID_DELETE_SUCCEED:
    return { ...state, idlist: { ...state.idlist, totalCount: state.idlist.totalCount - 1 } };
  case actionTypes.ID_EDIT:
    return {...state, formData: {...state.formData, [action.data.name]: action.data.value}};
  case actionTypes.ID_EDIT_CANCEL:
    return {...state, formData: {}, editIndex: -1};
  case actionTypes.ID_LOAD_STATUS:
    return {...state, statusList: initialState.statusList};
  case actionTypes.ID_LOAD_STATUS_SUCCEED:
     return {...state, statusList: {...state.statusList, invalidCount:action.result.data.invalidCount, notSendCount: action.result.data.notSendCount, notAcceptCount: action.result.data.notAcceptCount, acceptCount: action.result.data.acceptCount}};
  case actionTypes.ID_LOAD_STATUS_FAIL:
    return { ...state, statusList: initialState.statusList };
  case actionTypes.ID_LOAD_CUSTOMSBROKERS_SUCCEED:
     return {...state, customsBrokerList: action.result.data};

  default:
    return state;
  }
}

export function loadDelegates(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [ actionTypes.ID_LOAD, actionTypes.ID_LOAD_SUCCEED, actionTypes.ID_LOAD_FAIL ],
      endpoint: 'v1/import/importdelegates',
      method: 'get',
      cookie,
      params
    }
  };
}


export function submitDelegate(importdelegate, corpId, tenantId) {
  return {
    [CLIENT_API]: {
      types: [ actionTypes.ID_SUBMIT, actionTypes.ID_SUBMIT_SUCCEED, actionTypes.ID_SUBMIT_FAIL ],
      endpoint: 'v1/import/importdelegate',
      method: 'post',
      data: { importdelegate, corpId, tenantId }
    }
  };
}

export function updateId(importdelegate) {
  return {
    [CLIENT_API]: {
      types: [ actionTypes.ID_UPDATE, actionTypes.ID_UPDATE_SUCCEED, actionTypes.ID_UPDATE_FAIL ],
      endpoint: 'v1/import/importdelegate',
      method: 'put',
      data: { importdelegate }
    }
  };
}

export function delId(idkey) {
  return {
    [CLIENT_API]: {
      types: [ actionTypes.ID_DELETE, actionTypes.ID_DELETE_SUCCEED, actionTypes.ID_DELETE_FAIL ],
      endpoint: 'v1/import/importdelegate',
      method: 'del',
      data: { idkey }
    }
  };
}

export function loadStatus(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [ actionTypes.ID_LOAD_STATUS, actionTypes.ID_LOAD_STATUS_SUCCEED, actionTypes.ID_LOAD_STATUS_FAIL ],
      endpoint: 'v1/import/status',
      method: 'get',
      cookie,
      params
    }
  };
}

export function loadCustomsBrokers(cookie, tenantId) {
  return {
    [CLIENT_API]: {
      types: [ actionTypes.ID_LOAD_CUSTOMSBROKERS, actionTypes.ID_LOAD_CUSTOMSBROKERS_SUCCEED, actionTypes.ID_LOAD_CUSTOMSBROKERS_FAIL ],
      endpoint: `v1/import/${tenantId}/customsBrokers`,
      method: 'get',
      cookie
    }
  };
}


export function edit(name, value) {
  return {
    type: actionTypes.ID_EDIT,
    data: {name, value}
  };
}

export function cancelEdit() {
  return {
    type: actionTypes.ID_EDIT_CANCEL
  };
}
