import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
const initialState = {
  loaded: false, // used by isLoad action
  loading: false,
  needUpdate: false,
  editIndex: -1,
  formData: {},
  notices: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: [],
  },
};

const actions = [
  'NTC_LOAD', 'NTC_LOAD_SUCCEED', 'NTC_LOAD_FAIL', 'NTC_SUBMIT', 'NTC_SUBMIT_SUCCEED', 'NTC_SUBMIT_FAIL',
  'NTC_BEGIN_EDIT', 'NTC_EDIT', 'NTC_EDIT_CANCEL', 'NTC_UPDATE', 'NTC_UPDATE_SUCCEED', 'NTC_UPDATE_FAIL',
  'NTC_DELETE', 'NTC_DELETE_SUCCEED', 'NTC_DELETE_FAIL',
];
const domain = '@@qm-wewms/notice/';
const actionTypes = createActionTypes(domain, actions);

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.NTC_LOAD:
      return { ...state, loading: true, needUpdate: false };
    case actionTypes.NTC_LOAD_SUCCEED:
      return { ...state, loaded: true, loading: false, notices: action.result.data };
    case actionTypes.NTC_LOAD_FAIL:
      return { ...state, loaded: true, loading: false, notices: initialState.notices };
    case actionTypes.NTC_SUBMIT_SUCCEED: {
      let dataArray;
      if (state.notices.totalCount === 0 || (((state.notices.totalCount / state.notices.pageSize) >> 0) + 1
                                          === state.notices.current)) {
      // 数据为空或当前页未满,更新新增的数据到state
        dataArray = [...state.notices.data];
        dataArray.push({ ...action.data.notice, key: action.result.data.id, created_date: action.result.data.createdDate });
      }
      return { ...state, notices: { ...state.notices, totalCount: state.notices.totalCount + 1,
      data: dataArray || state.notices.data }, formData: {}, editIndex: -1 };
    }
    case actionTypes.NTC_UPDATE_SUCCEED: {
      const dataArray = [...state.notices.data];
      dataArray[state.editIndex] = action.data.notice;
      return { ...state, notices: { ...state.notices, data: dataArray }, formData: {}, editIndex: -1 };
    }
    case actionTypes.NTC_DELETE_SUCCEED:
      return { ...state, needUpdate: true, notices: { ...state.notices, totalCount: state.notices.totalCount - 1 } };
    case actionTypes.NTC_BEGIN_EDIT:
      return { ...state, formData: action.data.item, editIndex: action.data.index };
    case actionTypes.NTC_EDIT:
      return { ...state, formData: { ...state.formData, [action.data.name]: action.data.value } };
    case actionTypes.NTC_EDIT_CANCEL:
      return { ...state, formData: {}, editIndex: -1 };
    default:
      return state;
  }
}

export function load(params, cookie) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.NTC_LOAD, actionTypes.NTC_LOAD_SUCCEED, actionTypes.NTC_LOAD_FAIL],
      endpoint: 'v1/wewms/notices',
      method: 'get',
      params,
      cookie,
    },
  };
}

export function submit(notice, corpId, tenantId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.NTC_SUBMIT, actionTypes.NTC_SUBMIT_SUCCEED, actionTypes.NTC_SUBMIT_FAIL],
      endpoint: 'v1/wewms/notice',
      method: 'post',
      data: { notice, corpId, tenantId },
    },
  };
}

export function update(notice) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.NTC_UPDATE, actionTypes.NTC_UPDATE_SUCCEED, actionTypes.NTC_UPDATE_FAIL],
      endpoint: 'v1/wewms/notice',
      method: 'put',
      data: { notice },
    },
  };
}

export function del(key) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.NTC_DELETE, actionTypes.NTC_DELETE_SUCCEED, actionTypes.NTC_DELETE_FAIL],
      endpoint: 'v1/wewms/notice',
      method: 'del',
      data: { key },
    },
  };
}

export function beginEdit(item, index) {
  return {
    type: actionTypes.NTC_BEGIN_EDIT,
    data: { item, index },
  };
}

export function edit(name, value) {
  return {
    type: actionTypes.NTC_EDIT,
    data: { name, value },
  };
}

export function cancelEdit() {
  return {
    type: actionTypes.NTC_EDIT_CANCEL,
  };
}
