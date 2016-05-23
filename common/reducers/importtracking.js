import {
  CLIENT_API
} from '../api';
import {
  createActionTypes
} from '../../client/common/redux-actions';
import {
  appendFormAcitonTypes,
  formReducer
} from './form-common';
const initialState = {
  loaded: false, // used by isLoad action
  loading: false,
  formData: {},
  selectedIndex: -1,
  tenant: {
    id: -1,
    parentId: -1
  },
  idlist: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: []
  },
  customsBrokerList: []
};
// 定义操作状态 每个操作默认有三个状态 [进行时、成功、失败],在每个action提交的时候,type数组必须按照该类型排序
const actions = [
  'ID_LOAD', 'ID_LOAD_SUCCEED', 'ID_LOAD_FAIL',
  'ID_LOAD_CUSTOMSBROKERS', 'ID_LOAD_CUSTOMSBROKERS_SUCCEED', 'ID_LOAD_CUSTOMSBROKERS_FAIL'
];
const domain = '@@welogix/importtracking/';
const actionTypes = createActionTypes(domain, actions);
appendFormAcitonTypes(domain, actionTypes);

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.ID_LOAD:
      return {...state,
        loading: true,
        needUpdate: false
      };
    case actionTypes.ID_LOAD_SUCCEED:
    return {...state,
      loaded: true,
      loading: false,
      idlist: action.result.data.idlist
    };
    case actionTypes.ID_LOAD_FAIL:
      return {...state,
        loaded: true,
        loading: false,
        idlist: initialState.idlist
      };
    case actionTypes.ID_LOAD_CUSTOMSBROKERS_SUCCEED:
      return {...state,
        customsBrokerList: action.result.data
      };
    default:
      return formReducer(actionTypes, state, action, {}, 'idlist') || state;
  }
}

export function loadTracking(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ID_LOAD, actionTypes.ID_LOAD_SUCCEED, actionTypes.ID_LOAD_FAIL],
      endpoint: 'v1/import/importtracking',
      method: 'get',
      cookie,
      params
    }
  };
}


export function loadCustomsBrokers(cookie, tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.ID_LOAD_CUSTOMSBROKERS, actionTypes.ID_LOAD_CUSTOMSBROKERS_SUCCEED, actionTypes.ID_LOAD_CUSTOMSBROKERS_FAIL],
      endpoint: `v1/import/${tenantId}/customsBrokers`,
      method: 'get',
      cookie
    }
  };
}
