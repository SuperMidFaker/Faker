import {
  CLIENT_API,
} from 'common/reduxMiddlewares/requester';
import {
  createActionTypes,
} from 'client/common/redux-actions';
import {
  appendFormAcitonTypes,
  formReducer,
} from './form-common';
export const initialState = {
  loaded: false, // used by isLoad action
  loading: false,
  list: {
    totalCount: 0,
    pageSize: 10,
    currentPage: 1,
    searchText: '',
    data: [],
  },
  formData: {
    id: -1,
    comp_code: '',
    comp_name: '',
    i_e_type: '',
    relation_type: '',
    status: 1,
  },
};
// 定义操作状态 每个操作默认有三个状态 [进行时、成功、失败],在每个action提交的时候,type数组必须按照该类型排序
const actions = [
  'COMPRELATIONS_LOAD', 'COMPRELATIONS_LOAD_SUCCEED', 'COMPRELATIONS_LOAD_FAIL',
  'COMPRELATION_SUBMIT_LOAD', 'COMPRELATION_SUBMIT_LOAD_SUCCEED', 'COMPRELATION_SUBMIT_LOAD_FAIL',
  'COMPRELATION_LOAD', 'COMPRELATION_LOAD_SUCCEED', 'COMPRELATION_LOAD_FAIL',
  'COMPRELATION_STATUS_LOAD', 'COMPRELATION_STATUS_LOAD_SUCCEED', 'COMPRELATION_STATUS_LOAD_FAIL',
];
const domain = '@@welogix/cms/';
const actionTypes = createActionTypes(domain, actions);
appendFormAcitonTypes(domain, actionTypes);

export default function reducer(state = initialState, action) {
  let list;
  let loaded = false;
  switch (action.type) {
    case actionTypes.COMPRELATIONS_LOAD_SUCCEED:
      list = action.result.data;
      return { ...state,
        loaded: true,
        loading: false,
        needUpdate: false,
        list,
      };
    case actionTypes.COMPRELATION_SUBMIT_LOAD_SUCCEED:
      list = { ...state.list };
      if (action.result.data.id === initialState.formData.id) {
        list.rows.unshift({ ...action.data, id: action.result.data.insertId });
        loaded = true;
      }
      return { ...state,
        loaded,
        loading: false,
        needUpdate: true,
        list,
      };
    case actionTypes.COMPRELATION_LOAD_SUCCEED:
      return { ...state,
        loaded: false,
        loading: false,
        needUpdate: false,
        formData: action.result.data,
      };
    case actionTypes.COMPRELATION_STATUS_LOAD_SUCCEED:
      list = { ...state.list };
      list.rows[action.index].status = action.data.set.status;
      return { ...state,
        loaded: true,
        loading: false,
        needUpdate: false,
        list,
      };
    default:
      return formReducer(actionTypes, state, action, {}, 'idlist') || state;
  }
}


export function loadCompRelations(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.COMPRELATIONS_LOAD, actionTypes.COMPRELATIONS_LOAD_SUCCEED, actionTypes.COMPRELATIONS_LOAD_FAIL],
      endpoint: 'v1/cms/compRelations',
      method: 'get',
      cookie,
      params,
    },
  };
}

export function submitCompRelation(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.COMPRELATION_SUBMIT_LOAD,
        actionTypes.COMPRELATION_SUBMIT_LOAD_SUCCEED,
        actionTypes.COMPRELATION_SUBMIT_LOAD_FAIL,
      ],
      endpoint: 'v1/cms/compRelation',
      method: 'put',
      data: params,
    },
  };
}

export function loadCompRelation(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.COMPRELATION_LOAD,
        actionTypes.COMPRELATION_LOAD_SUCCEED,
        actionTypes.COMPRELATION_LOAD_FAIL,
      ],
      endpoint: 'v1/cms/compRelation',
      method: 'get',
      cookie,
      params,
    },
  };
}

export function switchStatus(index, id, status) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.COMPRELATION_STATUS_LOAD,
        actionTypes.COMPRELATION_STATUS_LOAD_SUCCEED,
        actionTypes.COMPRELATION_STATUS_LOAD_FAIL,
      ],
      endpoint: 'v1/cms/compRelationStatus',
      method: 'post',
      index,
      data: {
        set: { status },
        where: { id },
      },
    },
  };
}
