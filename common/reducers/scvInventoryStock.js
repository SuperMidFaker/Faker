import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scv/inventory/stock/', [
  'LOAD_STOCKS', 'LOAD_STOCKS_SUCCEED', 'LOAD_STOCKS_FAIL',
  'LOAD_LOTSTOCKS', 'LOAD_LOTSTOCKS_SUCCEED', 'LOAD_LOTSTOCKS_FAIL',
  'LOAD_STOCKSEARCHOPT', 'LOAD_STOCKSEARCHOPT_SUCCEED', 'LOAD_STOCKSEARCHOPT_FAIL',
  'CHECK_OWNER_COLUMN', 'CHECK_PRODUCT_COLUMN', 'CHECK_LOCATION_COLUMN',
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
    avail_qty: false,
    alloc_qty: false,
    frozen_qty: false,
    whse_location: false,
    owner: false,
    unit: false,
  },
  sortFilter: {
    field: '',
    order: '',
  },
  listFilter: {
    product_no: null,
    whse_code: 'all',
    owner: '',
    whse_location: '',
  },
  searchOption: {
    warehouses: [],
    categories: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_STOCKS:
      return { ...state,
        loading: true,
        listFilter: JSON.parse(action.params.filter),
        displayedColumns: { ...state.displayedColumns,
          product_no: false,
          avail_qty: false,
          alloc_qty: false,
          frozen_qty: false,
          whse_location: false,
          owner: false,
          unit: false,
        },
      };
    case actionTypes.LOAD_STOCKS_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_STOCKS_SUCCEED:
      return { ...state, list: action.result.data, loading: false };
    case actionTypes.LOAD_LOTSTOCKS:
      return { ...state,
        loading: true,
        listFilter: JSON.parse(action.params.filter),
        sortFilter: JSON.parse(action.params.sorter) };
    case actionTypes.LOAD_LOTSTOCKS_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_LOTSTOCKS_SUCCEED:
      return { ...state, list: action.result.data, loading: false, displayedColumns: { ...state.displayedColumns, ...action.lot_column } };
    case actionTypes.LOAD_STOCKSEARCHOPT_SUCCEED:
      return { ...state, searchOption: action.result.data };
    case actionTypes.CHECK_OWNER_COLUMN:
      return { ...state, displayedColumns: { ...state.displayedColumns, [action.data.column]: action.data.visible } };
    case actionTypes.CHECK_PRODUCT_COLUMN:
      return { ...state,
        displayedColumns: {
          ...state.displayedColumns,
          avail_qty: action.data.visible,
          alloc_qty: action.data.visible,
          frozen_qty: action.data.visible,
          product_no: action.data.visible,
        } };
    case actionTypes.CHECK_LOCATION_COLUMN:
      return { ...state, displayedColumns: { ...state.displayedColumns, [action.data.column]: action.data.visible } };
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

export function loadLotStocks(params, lotColumn) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_LOTSTOCKS,
        actionTypes.LOAD_LOTSTOCKS_SUCCEED,
        actionTypes.LOAD_LOTSTOCKS_FAIL,
      ],
      endpoint: 'v1/cwm/inventory/lot/stock',
      method: 'get',
      params,
      lot_column: lotColumn,
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

export function checkOwnerColumn(column, visible) {
  return {
    type: actionTypes.CHECK_OWNER_COLUMN,
    data: { column, visible },
  };
}

export function checkProductColumn(visible) {
  return {
    type: actionTypes.CHECK_PRODUCT_COLUMN,
    data: { visible },
  };
}

export function checkLocationColumn(column, visible) {
  return {
    type: actionTypes.CHECK_LOCATION_COLUMN,
    data: { column, visible },
  };
}
