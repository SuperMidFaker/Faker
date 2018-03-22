import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/bss/statement', [
  'LOAD_ORDER_STATEMENTS', 'LOAD_ORDER_STATEMENTS_SUCCEED', 'LOAD_ORDER_STATEMENTS_FAIL',
]);

const initialState = {
  orderStatementlist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  listFilter: {
    status: 'submitted',
    clientPid: 'all',
  },
  loading: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_ORDER_STATEMENTS:
      return {
        ...state,
        listFilter: JSON.parse(action.params.filter),
        loading: true,
      };
    case actionTypes.LOAD_ORDER_STATEMENTS_SUCCEED:
      return { ...state, loading: false, auditslist: action.result.data };
    case actionTypes.LOAD_ORDER_STATEMENTS_FAIL:
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function loadOrderStatements(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ORDER_STATEMENTS,
        actionTypes.LOAD_ORDER_STATEMENTS_SUCCEED,
        actionTypes.LOAD_ORDER_STATEMENTS_FAIL,
      ],
      endpoint: 'v1/bss/order/statements/load',
      method: 'get',
      params,
    },
  };
}
