import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/inventory/stock/', [
  'SHOW_TRANSITION_DOCK', 'HIDE_TRANSITION_DOCK',
  'LOAD_STOCKS', 'LOAD_STOCKS_SUCCEED', 'LOAD_STOCKS_FAIL',
  'CHECK_OWNER_COLUMN', 'CHECK_PRODUCT_COLUMN', 'CHECK_LOCATION_COLUMN',
  'CHECK_PRODUCT_LOCATION', 'CHANGE_SEARCH_TYPE',
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
    stockStatus: 'normal',
    product_no: null,
    whse_code: '',
    owner: '',
    whse_location: '',
    search_type: 2,
  },
  batchTransitModal: {
    visible: false,
  },
  batchMoveModal: {
    visible: false,
  },
  batchFreezeModal: {
    visible: false,
  },
  transitionDock: {
    visible: false,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.HIDE_TRANSITION_DOCK:
      return { ...state, transitionDock: { ...state.transitionDock, visible: false } };
    case actionTypes.SHOW_TRANSITION_DOCK:
      return { ...state, transitionDock: { ...state.transitionDock, visible: true } };
    case actionTypes.CLOSE_BATCH_TRANSIT_MODAL:
      return { ...state, batchTransitModal: { ...state.batchTransitModal, visible: false } };
    case actionTypes.OPEN_BATCH_TRANSIT_MODAL:
      return { ...state, batchTransitModal: { ...state.batchTransitModal, visible: true } };
    case actionTypes.CLOSE_BATCH_MOVE_MODAL:
      return { ...state, batchMoveModal: { ...state.batchMoveModal, visible: false } };
    case actionTypes.OPEN_BATCH_MOVE_MODAL:
      return { ...state, batchMoveModal: { ...state.batchMoveModal, visible: true } };
    case actionTypes.CLOSE_BATCH_FREEZE_MODAL:
      return { ...state, batchFreezeModal: { ...state.batchFreezeModal, visible: false } };
    case actionTypes.OPEN_BATCH_FREEZE_MODAL:
      return { ...state, batchFreezeModal: { ...state.batchFreezeModal, visible: true } };
    case actionTypes.LOAD_STOCKS:
      return { ...state,
        loading: true,
        listFilter: JSON.parse(action.params.filter),
      };
    case actionTypes.LOAD_STOCKS_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_STOCKS_SUCCEED:
      return { ...state, list: action.result.data, loading: false };
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
      return { ...state, list: initialState.list, listFilter: { ...state.listFilter, search_type: action.value } };
    default:
      return state;
  }
}

export function hideTransitionDock() {
  return {
    type: actionTypes.HIDE_TRANSITION_DOCK,
  };
}

export function showTransitionDock(detailId) {
  return {
    type: actionTypes.SHOW_TRANSITION_DOCK,
    detailId,
  };
}

export function openBatchTransitModal() {
  return {
    type: actionTypes.OPEN_BATCH_TRANSIT_MODAL,
  };
}

export function closeBatchTransitModal() {
  return {
    type: actionTypes.CLOSE_BATCH_TRANSIT_MODAL,
  };
}

export function openBatchMoveModal() {
  return {
    type: actionTypes.OPEN_BATCH_MOVE_MODAL,
  };
}

export function closeBatchMoveModal() {
  return {
    type: actionTypes.CLOSE_BATCH_MOVE_MODAL,
  };
}

export function openBatchFreezeModal() {
  return {
    type: actionTypes.OPEN_BATCH_FREEZE_MODAL,
  };
}

export function closeBatchFreezeModal() {
  return {
    type: actionTypes.CLOSE_BATCH_FREEZE_MODAL,
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
