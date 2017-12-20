import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const initialState = {
  logList: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
    loading: false,
  },
  userActivities: [],
};

const actionTypes = createActionTypes('@@welogix/corp/oplog', [
  'LOAD_OPLOG', 'LOAD_OPLOG_SUCCEED', 'LOAD_OPLOG_FAIL',
  'LOAD_OPRALOG', 'LOAD_OPRALOG_SUCCEED', 'LOAD_OPRALOG_FAIL',
]);

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_OPLOG:
      return { ...state, logList: { ...state.logList, loading: true } };
    case actionTypes.LOAD_OPLOG_FAIL:
      return { ...state, logList: { ...state.logList, loading: false } };
    case actionTypes.LOAD_OPLOG_SUCCEED:
      return { ...state, logList: { ...state.logList, loading: false, ...action.result.data } };
    case actionTypes.LOAD_OPRALOG_SUCCEED:
      return { ...state, userActivities: action.result.data.data };
    default:
      return state;
  }
}

export function loadOperationLogs(params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.LOAD_OPLOG,
        actionTypes.LOAD_OPLOG_SUCCEED,
        actionTypes.LOAD_OPLOG_FAIL],
      endpoint: 'v1/saas/operation/loglist',
      method: 'get',
      params,
    },
  };
}

export function loadRecentActivities(recentSize, filter) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.LOAD_OPRALOG,
        actionTypes.LOAD_OPRALOG_SUCCEED,
        actionTypes.LOAD_OPRALOG_FAIL],
      endpoint: 'v1/saas/operation/loglist',
      method: 'get',
      params: { pageSize: recentSize, current: 1, filter: JSON.stringify(filter) },
    },
  };
}