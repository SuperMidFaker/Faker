import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scv/inventory/stock', [
  'LOAD_STOCKS', 'LOAD_STOCKS_SUCCEED', 'LOAD_STOCKS_FAIL',
  'LOAD_STOCKSEARCHOPT', 'LOAD_STOCKSEARCHOPT_SUCCEED', 'LOAD_STOCKSEARCHOPT_FAIL',
]);

const initialState = {
  loading: false,
  list: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: [],
  },
  sortFilter: {
    field: '',
    order: '',
  },
  listFilter: {
    product_no: null,
    product_categ: null,
    wh_no: 'all',
  },
  searchOption: {
    warehouses: [],
    categories: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_STOCKS:
      return { ...state, loading: true, listFilter: JSON.parse(action.params.filter),
        sortFilter: JSON.parse(action.params.sorter) };
    case actionTypes.LOAD_STOCKS_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_STOCKS_SUCCEED:
      return { ...state, list: action.result.data, loading: false };
    default:
      return state;
  }
}

export function loadStocks(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_STOCKS,
        actionTypes.LOAD_STOCKS_SUCCEED,
        actionTypes.LOAD_STOCKS_FAIL,
      ],
      endpoint: 'v1/cwm/inventory/stock',
      method: 'get',
      params,
    },
  };
}

export function loadStockSearchOptions(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_STOCKSEARCHOPT,
        actionTypes.LOAD_STOCKSEARCHOPT_SUCCEED,
        actionTypes.LOAD_STOCKSEARCHOPT_FAIL,
      ],
      endpoint: 'v1/cwm/inventory/stock/searchoptions',
      method: 'get',
      params: { tenantId },
    },
  };
}
