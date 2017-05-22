import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scv/inventory/stock/', [
  'LOAD_STOCKS', 'LOAD_STOCKS_SUCCEED', 'LOAD_STOCKS_FAIL',
  'LOAD_LOTSTOCKS', 'LOAD_LOTSTOCKS_SUCCEED', 'LOAD_LOTSTOCKS_FAIL',
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
    external_lot_no: false,
    serial_no: false,
    spec_date: false,
    unit_price: false,
    stock_cost: false,
  },
  sortFilter: {
    field: '',
    order: '',
  },
  listFilter: {
    product_no: null,
    product_category: null,
    wh_no: '_all_',
    group_by_sku: false,
    lot_property: null,
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
        sortFilter: JSON.parse(action.params.sorter),
        displayedColumns: { ...state.displayedColumns,
          external_lot_no: false,
          serial_no: false,
          spec_date: false,
          unit_price: false,
          stock_cost: false },
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
    case actionTypes.CHECK_DISPLAY_COLUMN:
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

export function checkDisplayColumn(column, visible) {
  return {
    type: actionTypes.CHECK_DISPLAY_COLUMN,
    data: { column, visible },
  };
}
