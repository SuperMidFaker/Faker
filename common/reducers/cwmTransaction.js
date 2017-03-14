import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/transaction/', [
  'LOAD_INBOUNDTRANS', 'LOAD_INBOUNDTRANS_SUCCEED', 'LOAD_INBOUNDTRANS_FAIL',
  'LOAD_OUTBOUNDTRANS', 'LOAD_OUTBOUNDTRANS_SUCCEED', 'LOAD_OUTBOUNDTRANS_FAIL',
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
    sku: '',
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_INBOUNDTRANS:
      return { ...state, listFilter: JSON.parse(action.params.filter),
        sortFilter: JSON.parse(action.params.sorter), loading: true };
    case actionTypes.LOAD_INBOUNDTRANS_SUCCEED:
      return { ...state, loading: false, list: action.result.data };
    case actionTypes.LOAD_INBOUNDTRANS_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_OUTBOUNDTRANS:
      return { ...state, listFilter: JSON.parse(action.params.filter),
        sortFilter: JSON.parse(action.params.sorter), loading: true };
    case actionTypes.LOAD_OUTBOUNDTRANS_SUCCEED:
      return { ...state, loading: false, list: action.result.data };
    case actionTypes.LOAD_OUTBOUNDTRANS_FAIL:
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function loadInboundTransactions(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_INBOUNDTRANS,
        actionTypes.LOAD_INBOUNDTRANS_SUCCEED,
        actionTypes.LOAD_INBOUNDTRANS_FAIL,
      ],
      endpoint: 'v1/cwm/transaction/inbounds',
      method: 'get',
      params,
    },
  };
}

export function loadOutboundTransactions(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_OUTBOUNDTRANS,
        actionTypes.LOAD_OUTBOUNDTRANS_SUCCEED,
        actionTypes.LOAD_OUTBOUNDTRANS_FAIL,
      ],
      endpoint: 'v1/cwm/transaction/outbounds',
      method: 'get',
      params,
    },
  };
}
