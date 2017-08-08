import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scv/inventory/stock/', [
  'LOAD_STOCKS', 'LOAD_STOCKS_SUCCEED', 'LOAD_STOCKS_FAIL',
  'LOAD_LOTSTOCKS', 'LOAD_LOTSTOCKS_SUCCEED', 'LOAD_LOTSTOCKS_FAIL',
  'LOAD_STOCKSEARCHOPT', 'LOAD_STOCKSEARCHOPT_SUCCEED', 'LOAD_STOCKSEARCHOPT_FAIL',
  'CHECK_OWNER_COLUMN', 'CHECK_PRODUCT_COLUMN', 'CHECK_LOCATION_COLUMN',
  'CHECK_PRODUCT_LOCATION', 'CHANGE_SEARCH_TYPE', 'CLEAR_LIST',
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
    location: false,
    owner_name: false,
    unit: false,
  },
  sortFilter: {
    field: '',
    order: '',
  },
  listFilter: {
    product_no: null,
    whse_code: '',
    owner: 'all',
    whse_location: '',
    search_type: 1,
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
      return { ...state,
        displayedColumns: {
          product_no: false,
          avail_qty: false,
          alloc_qty: false,
          frozen_qty: false,
          location: false,
          unit: false,
          owner_name: true,
        } };
    case actionTypes.CHECK_PRODUCT_COLUMN:
      return { ...state,
        displayedColumns: {
          avail_qty: true,
          alloc_qty: true,
          frozen_qty: true,
          product_no: true,
          location: false,
          unit: false,
          owner_name: false,
        } };
    case actionTypes.CHECK_LOCATION_COLUMN:
      return { ...state,
        displayedColumns: {
          product_no: false,
          avail_qty: false,
          alloc_qty: false,
          frozen_qty: false,
          location: true,
          owner_name: false,
          unit: false,
        } };
    case actionTypes.CHECK_PRODUCT_LOCATION:
      return {
        ...state,
        displayedColumns: {
          product_no: true,
          avail_qty: true,
          alloc_qty: true,
          frozen_qty: true,
          location: true,
          owner_name: true,
          unit: false,
        },
      };
    case actionTypes.CHANGE_SEARCH_TYPE:
      return { ...state, listFilter: { ...state.listFilter, search_type: action.value } };
    case actionTypes.CLEAR_LIST:
      return { ...state, list: { ...state.list, data: [] } };
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

export function checkOwnerColumn() {
  return {
    type: actionTypes.CHECK_OWNER_COLUMN,
  };
}

export function checkProductColumn() {
  return {
    type: actionTypes.CHECK_PRODUCT_COLUMN,
  };
}

export function checkLocationColumn() {
  return {
    type: actionTypes.CHECK_LOCATION_COLUMN,
  };
}

export function checkProductLocation() {
  return {
    type: actionTypes.CHECK_PRODUCT_LOCATION,
  };
}

export function changeSearchType(value) {
  return {
    type: actionTypes.CHANGE_SEARCH_TYPE,
    value,
  };
}

export function clearList() {
  return {
    type: actionTypes.CLEAR_LIST,
  };
}
