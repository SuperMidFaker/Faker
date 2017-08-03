import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/inventory/stock/', [
  'OPEN_MOVEMENT_MODAL', 'CLOSE_MOVEMENT_MODAL', 'SET_FILTER',
  'LOAD_STOCKS', 'LOAD_STOCKS_SUCCEED', 'LOAD_STOCKS_FAIL',
  'LOAD_STOCKSEARCHOPT', 'LOAD_STOCKSEARCHOPT_SUCCEED', 'LOAD_STOCKSEARCHOPT_FAIL',
  'CHECK_OWNER_COLUMN', 'CHECK_PRODUCT_COLUMN', 'CHECK_LOCATION_COLUMN',
  'CHECK_PRODUCT_LOCATION', 'CHANGE_SEARCH_TYPE', 'CLEAR_LIST',
  'INVENTORY_SEARCH', 'INVENTORY_SEARCH_SUCCESS', 'INVENTORY_SEARCH_FAIL',
  'CREATE_MOVEMENT', 'CREATE_MOVEMENT_SUCCESS', 'CREATE_MOVEMENT_FAIL',
  'LOAD_MOVEMENTS', 'LOAD_MOVEMENTS_SUCCESS', 'LOAD_MOVEMENTS_FAIL',
  'LOAD_MOVEMENT_HEAD', 'LOAD_MOVEMENT_HEAD_SUCCESS', 'LOAD_MOVEMENT_HEAD_FAIL',
  'LOAD_MOVEMENT_DETAILS', 'LOAD_MOVEMENT_DETAILS_SUCCESS', 'LOAD_MOVEMENT_DETAILS_FAIL',
  'EXECUTE_MOVE', 'EXECUTE_MOVE_SUCCESS', 'EXECUTE_MOVE_FAIL',
  'CANCEL_MOVEMENT', 'CANCEL_MOVEMENT_SUCCESS', 'CANCEL_MOVEMENT_FAIL',
  'REMOVE_MOVEMENT_DETAIL', 'REMOVE_MOVEMENT_DETAIL_SUCCESS', 'REMOVE_MOVEMENT_DETAIL_FAIL',
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
    product_no: true,
    avail_qty: true,
    alloc_qty: true,
    frozen_qty: true,
    bonded_qty: true,
    nonbonded_qty: true,
    location: false,
    inbound_date: false,
    owner_name: true,
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
    search_type: 2,
  },
  searchOption: {
    warehouses: [],
    categories: [],
  },
  movementModal: {
    visible: false,
    filter: {
      ownerCode: '',
      ownerName: '',
      productNo: '',
      location: '',
      startTime: '',
      endTime: '',
    },
  },
  movements: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
    loading: true,
  },
  movementFilter: { owner: 'all' },
  movementHead: {},
  movementDetails: [],
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
          inbound_date: false,
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
          inbound_date: false,
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
          inbound_date: false,
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
          inbound_date: true,
          unit: false,
        },
      };
    case actionTypes.CHANGE_SEARCH_TYPE:
      return { ...state, listFilter: { ...state.listFilter, search_type: action.value } };
    case actionTypes.CLEAR_LIST:
      return { ...state, list: { ...state.list, data: [] } };
    case actionTypes.INVENTORY_SEARCH:
      return { ...state, movementModal: { ...state.movementModal, filter: JSON.parse(action.params.filter) } };
    case actionTypes.LOAD_MOVEMENTS:
      return { ...state, movements: { ...state.movements, loading: true } };
    case actionTypes.LOAD_MOVEMENTS_SUCCESS:
      return { ...state, movements: { ...action.result.data, loading: false } };
    case actionTypes.SET_FILTER:
      return { ...state, movementModal: { ...state.movementModal, filter: action.filter } };
    case actionTypes.LOAD_MOVEMENT_HEAD_SUCCESS:
      return { ...state, movementHead: action.result.data };
    case actionTypes.LOAD_MOVEMENT_DETAILS_SUCCESS:
      return { ...state, movementDetails: action.result.data };
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

export function inventorySearch(filter, tenantId, whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.INVENTORY_SEARCH,
        actionTypes.INVENTORY_SEARCH_SUCCESS,
        actionTypes.INVENTORY_SEARCH_FAIL,
      ],
      endpoint: 'v1/cwm/inventory/search',
      method: 'get',
      params: { filter, tenantId, whseCode },
    },
  };
}

export function createMovement(ownerCode, ownerName, moveType, reason, whseCode, tenantId, loginId, details) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_MOVEMENT,
        actionTypes.CREATE_MOVEMENT_SUCCESS,
        actionTypes.CREATE_MOVEMENT_FAIL,
      ],
      endpoint: 'v1/cwm/create/movement',
      method: 'post',
      data: { ownerCode, ownerName, moveType, reason, whseCode, tenantId, loginId, details },
    },
  };
}

export function loadMovements({ whseCode, tenantId, pageSize, current, filter }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_MOVEMENTS,
        actionTypes.LOAD_MOVEMENTS_SUCCESS,
        actionTypes.LOAD_MOVEMENTS_FAIL,
      ],
      endpoint: 'v1/cwm/load/movements',
      method: 'get',
      params: { whseCode, tenantId, pageSize, current, filter: JSON.stringify(filter) },
    },
  };
}

export function setMovementsFilter(filter) {
  return {
    type: actionTypes.SET_FILTER,
    filter,
  };
}

export function loadMovementHead(movementNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_MOVEMENT_HEAD,
        actionTypes.LOAD_MOVEMENT_HEAD_SUCCESS,
        actionTypes.LOAD_MOVEMENT_HEAD_FAIL,
      ],
      endpoint: 'v1/cwm/load/movement/head',
      method: 'get',
      params: { movementNo },
    },
  };
}

export function loadMovementDetails(movementNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_MOVEMENT_DETAILS,
        actionTypes.LOAD_MOVEMENT_DETAILS_SUCCESS,
        actionTypes.LOAD_MOVEMENT_DETAILS_FAIL,
      ],
      endpoint: 'v1/cwm/load/movement/details',
      method: 'get',
      params: { movementNo },
    },
  };
}

export function executeMovement(movementNo, movementDetails, loginId, whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EXECUTE_MOVE,
        actionTypes.EXECUTE_MOVE_SUCCESS,
        actionTypes.EXECUTE_MOVE_FAIL,
      ],
      endpoint: 'v1/cwm/execute/move',
      method: 'post',
      data: { movementNo, movementDetails, loginId, whseCode },
    },
  };
}

export function cancelMovement(movementNo, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CANCEL_MOVEMENT,
        actionTypes.CANCEL_MOVEMENT_SUCCESS,
        actionTypes.CANCEL_MOVEMENT_FAIL,
      ],
      endpoint: 'v1/cwm/cancel/movement',
      method: 'post',
      data: { movementNo, loginId },
    },
  };
}

export function removeMoveDetail(ids, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_MOVEMENT_DETAIL,
        actionTypes.REMOVE_MOVEMENT_DETAIL_SUCCESS,
        actionTypes.REMOVE_MOVEMENT_DETAIL_FAIL,
      ],
      endpoint: 'v1/cwm/remove/movement/detail',
      method: 'post',
      data: { ids, loginId },
    },
  };
}
