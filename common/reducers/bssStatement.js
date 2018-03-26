import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/bss/statement', [
  'LOAD_PENDING_STATISTICS', 'LOAD_PENDING_STATISTICS_SUCCEED', 'LOAD_PENDING_STATISTICS_FAIL',
]);

const initialState = {
  statementStat: {
    total_amount: 0,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_PENDING_STATISTICS_SUCCEED:
      return { ...state, statementStat: action.result.data };
    default:
      return state;
  }
}

export function loadPendingStatistics(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PENDING_STATISTICS,
        actionTypes.LOAD_PENDING_STATISTICS_SUCCEED,
        actionTypes.LOAD_PENDING_STATISTICS_FAIL,
      ],
      endpoint: 'v1/bss/bill/pending/statistics',
      method: 'get',
      params,
    },
  };
}
