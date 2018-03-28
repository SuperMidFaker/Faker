import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/bss/statement', [
  'LOAD_BILLABLESTAT', 'LOAD_BILLABLESTAT_SUCCEED', 'LOAD_BILLABLESTAT_FAIL',
]);

const initialState = {
  statementStat: {
    total_amount: 0,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_BILLABLESTAT_SUCCEED:
      return { ...state, statementStat: action.result.data };
    default:
      return state;
  }
}

export function loadBillableStatementStat(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILLABLESTAT,
        actionTypes.LOAD_BILLABLESTAT_SUCCEED,
        actionTypes.LOAD_BILLABLESTAT_FAIL,
      ],
      endpoint: 'v1/bss/billable/statement/stat',
      method: 'get',
      params,
    },
  };
}
