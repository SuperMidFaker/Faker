import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scv/inventory/stock/', [
  'LOAD_TRANSACTIONS', 'LOAD_TRANSACTIONS_SUCCEED', 'LOAD_TRANSACTIONS_FAIL',
  'LOAD_STOCKSEARCHOPT', 'LOAD_STOCKSEARCHOPT_SUCCEED', 'LOAD_STOCKSEARCHOPT_FAIL',
  'CHECK_DISPLAY_COLUMN',
]);

const initialState = {
  loading: false,
  list: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  displayedColumns: {
    product_no: false,
    product_category: false,
  },
  sortFilter: {
    field: '',
    order: '',
  },
  listFilter: {
    product_no: null,
    product_category: null,
    wh_no: '_all_',
    start_date: null,
    end_date: null,
  },
  searchOption: {
    warehouses: [],
    categories: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_TRANSACTIONS:
      return { ...state, listFilter: JSON.parse(action.params.filter),
        sortFilter: JSON.parse(action.params.sorter), loading: true };
    case actionTypes.LOAD_TRANSACTIONS_SUCCEED:
      return { ...state, loading: false, list: action.result.data };
    case actionTypes.LOAD_TRANSACTIONS_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_STOCKSEARCHOPT_SUCCEED:
      return { ...state, searchOption: action.result.data };
    case actionTypes.CHECK_DISPLAY_COLUMN:
      return { ...state, displayedColumns: { ...state.displayedColumns, [action.data.column]: action.data.visible } };
    default:
      return state;
  }
}

export function loadStockTransactions(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRANSACTIONS,
        actionTypes.LOAD_TRANSACTIONS_SUCCEED,
        actionTypes.LOAD_TRANSACTIONS_FAIL,
      ],
      endpoint: 'v1/cwm/inventory/transactions',
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

export function checkDisplayColumn(column, visible) {
  return {
    type: actionTypes.CHECK_DISPLAY_COLUMN,
    data: { column, visible },
  };
}
