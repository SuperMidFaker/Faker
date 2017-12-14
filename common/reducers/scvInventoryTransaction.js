import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scv/inventory/stock/', [
  'LOAD_TRANSACTIONS', 'LOAD_TRANSACTIONS_SUCCEED', 'LOAD_TRANSACTIONS_FAIL',
  'LOAD_STOCKSEARCHOPT', 'LOAD_STOCKSEARCHOPT_SUCCEED', 'LOAD_STOCKSEARCHOPT_FAIL',
  'CHECK_DISPLAY_COLUMN',
  'LOAD_SKUTRANSAC', 'LOAD_SKUTRANSAC_SUCCEED', 'LOAD_SKUTRANSAC_FAIL',
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
    start_date: true,
    end_date: true,
    pre_stock: true,
    post_stock: true,
    lot_no: false,
    serial_no: false,
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
    serial_no: '',
    lot_no: '',
  },
  searchOption: {
    warehouses: [],
    categories: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_TRANSACTIONS:
      return {
        ...state,
        listFilter: JSON.parse(action.params.filter),
        sortFilter: JSON.parse(action.params.sorter),
        loading: true,
      };
    case actionTypes.LOAD_TRANSACTIONS_SUCCEED:
      return { ...state, loading: false, list: action.result.data };
    case actionTypes.LOAD_TRANSACTIONS_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_STOCKSEARCHOPT_SUCCEED:
      return { ...state, searchOption: action.result.data };
    case actionTypes.CHECK_DISPLAY_COLUMN:
      return { ...state, displayedColumns: { ...state.displayedColumns, [action.data.column]: action.data.visible } };
    case actionTypes.LOAD_SKUTRANSAC:
      return { ...state, detailloading: true };
    case actionTypes.LOAD_SKUTRANSAC_SUCCEED:
    case actionTypes.LOAD_SKUTRANSAC_FAIL:
      return { ...state, detailloading: false };
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

export function loadSkuTransactions(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SKUTRANSAC,
        actionTypes.LOAD_SKUTRANSAC_SUCCEED,
        actionTypes.LOAD_SKUTRANSAC_FAIL,
      ],
      endpoint: 'v1/cwm/inventory/sku/transactions',
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
