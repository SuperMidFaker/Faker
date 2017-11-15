import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/transaction/', [
  'LOAD_TRANSACTIONS', 'LOAD_TRANSACTIONS_SUCCEED', 'LOAD_TRANSACTIONS_FAIL',
  'LOAD_TRACE_TRANSACTIONS', 'LOAD_TRACE_TRANSACTIONS_SUCCEED', 'LOAD_TRACE_TRANSACTIONS_FAIL',
]);

const initialState = {
  loading: false,
  list: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  sortFilter: {
    field: '',
    order: '',
  },
  listFilter: {
  },
  traceLoading: false,
  traceTransactions: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_TRANSACTIONS:
      return { ...state,
        listFilter: JSON.parse(action.params.filter),
        sortFilter: JSON.parse(action.params.sorter),
        loading: true };
    case actionTypes.LOAD_TRANSACTIONS_SUCCEED:
      return { ...state, loading: false, list: action.result.data };
    case actionTypes.LOAD_TRANSACTIONS_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_TRACE_TRANSACTIONS:
      return { ...state, traceLoading: true };
    case actionTypes.LOAD_TRACE_TRANSACTIONS_SUCCEED:
      return { ...state, traceTransactions: action.result.data, traceLoading: false };
    case actionTypes.LOAD_TRACE_TRANSACTIONS_FAIL:
      return { ...state, traceLoading: false };
    default:
      return state;
  }
}

export function loadTransactions(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRANSACTIONS,
        actionTypes.LOAD_TRANSACTIONS_SUCCEED,
        actionTypes.LOAD_TRANSACTIONS_FAIL,
      ],
      endpoint: 'v1/cwm/stock/transactions',
      method: 'get',
      params,
    },
  };
}

export function loadTraceTransactions(traceId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRACE_TRANSACTIONS,
        actionTypes.LOAD_TRACE_TRANSACTIONS_SUCCEED,
        actionTypes.LOAD_TRACE_TRANSACTIONS_FAIL,
      ],
      endpoint: 'v1/cwm/stock/trace/transactions',
      method: 'get',
      params: { traceId },
    },
  };
}
