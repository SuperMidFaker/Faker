import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/inventory/stock/', [
  'OPEN_MOVEMENT_MODAL', 'CLOSE_MOVEMENT_MODAL',
  'LOAD_STOCKS', 'LOAD_STOCKS_SUCCEED', 'LOAD_STOCKS_FAIL',
  'LOAD_STOCKSEARCHOPT', 'LOAD_STOCKSEARCHOPT_SUCCEED', 'LOAD_STOCKSEARCHOPT_FAIL',
  'CHECK_OWNER_COLUMN', 'CHECK_PRODUCT_COLUMN', 'CHECK_LOCATION_COLUMN',
  'CHECK_PRODUCT_LOCATION', 'CHANGE_SEARCH_TYPE', 'CLEAR_LIST',
  'INVENTORY_SEARCH', 'INVENTORY_SEARCH_SUCCESS', 'INVENTORY_SEARCH_FAIL',
  'CREATE_MOVEMENT', 'CREATE_MOVEMENT_SUCCESS', 'CREATE_MOVEMENT_FAIL',
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
    bonded_qty: false,
    nonbonded_qty: false,
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
    owner: '',
    whse_location: '',
    search_type: 1,
  },
  searchOption: {
    warehouses: [],
    categories: [],
  },
  movementModal: {
    visible: false,
    filter: {
      owner: '',
      productNo: '',
      location: '',
      startTime: '',
      endTime: '',
    },
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.OPEN_MOVEMENT_MODAL:
      return { ...state, movementModal: { ...state.movementModal, visible: true, ...action.data } };
    case actionTypes.CLOSE_MOVEMENT_MODAL:
      return { ...state, movementModal: { ...state.movementModal, visible: false } };
    case actionTypes.LOAD_STOCKS:
      return { ...state,
        loading: true,
        listFilter: JSON.parse(action.params.filter),
      };
    case actionTypes.LOAD_STOCKS_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_STOCKS_SUCCEED:
      return { ...state, list: action.result.data, loading: false };
    case actionTypes.LOAD_STOCKSEARCHOPT_SUCCEED:
      return { ...state, searchOption: action.result.data };
    case actionTypes.CHECK_OWNER_COLUMN:
      return { ...state,
        displayedColumns: {
          owner_name: true,
          product_no: false,
          product_sku: false,
          desc_cn: false,
          avail_qty: false,
          alloc_qty: false,
          frozen_qty: false,
          bonded_qty: false,
          nonbonded_qty: false,
          location: false,
          unit: false,
        } };
    case actionTypes.CHECK_PRODUCT_COLUMN:
      return { ...state,
        displayedColumns: {
          owner_name: true,
          product_no: true,
          product_sku: true,
          desc_cn: true,
          avail_qty: true,
          alloc_qty: true,
          frozen_qty: true,
          bonded_qty: true,
          nonbonded_qty: true,
          location: false,
          unit: false,
        } };
    case actionTypes.CHECK_LOCATION_COLUMN:
      return { ...state,
        displayedColumns: {
          owner_name: false,
          product_no: false,
          product_sku: false,
          desc_cn: false,
          avail_qty: false,
          alloc_qty: false,
          frozen_qty: false,
          bonded_qty: false,
          nonbonded_qty: false,
          location: true,
          unit: false,
        } };
    case actionTypes.CHECK_PRODUCT_LOCATION:
      return {
        ...state,
        displayedColumns: {
          owner_name: true,
          product_no: true,
          product_sku: true,
          desc_cn: true,
          avail_qty: true,
          alloc_qty: true,
          frozen_qty: true,
          bonded_qty: true,
          nonbonded_qty: true,
          location: true,
          unit: false,
        },
      };
    case actionTypes.CHANGE_SEARCH_TYPE:
      return { ...state, listFilter: { ...state.listFilter, search_type: action.value } };
    case actionTypes.CLEAR_LIST:
      return { ...state, list: { ...state.list, data: [] } };
    case actionTypes.INVENTORY_SEARCH:
      return { ...state, movementModal: { ...state.movementModal, filter: JSON.parse(action.params.filter) } };
    default:
      return state;
  }
}

export function openMovementModal() {
  return {
    type: actionTypes.OPEN_MOVEMENT_MODAL,
  };
}

export function closeMovementModal() {
  return {
    type: actionTypes.CLOSE_MOVEMENT_MODAL,
  };
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

export function checkProAndLocation() {
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

export function inventorySearch(filter, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.INVENTORY_SEARCH,
        actionTypes.INVENTORY_SEARCH_SUCCESS,
        actionTypes.INVENTORY_SEARCH_FAIL,
      ],
      endpoint: 'v1/cwm/inventory/search',
      method: 'get',
      params: { filter, tenantId },
    },
  };
}

export function createMovement(owner, moveType, reason, details) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_MOVEMENT,
        actionTypes.CREATE_MOVEMENT_SUCCESS,
        actionTypes.CREATE_MOVEMENT_FAIL,
      ],
      endpoint: 'v1/cwm/create/movement',
      method: 'post',
      data: { owner, moveType, reason, details },
    },
  };
}
