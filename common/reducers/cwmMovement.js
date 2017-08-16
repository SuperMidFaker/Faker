import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/inventory/movement/', [
  'OPEN_MOVEMENT_MODAL', 'CLOSE_MOVEMENT_MODAL', 'SET_FILTER',
  'INVENTORY_SEARCH', 'INVENTORY_SEARCH_SUCCESS', 'INVENTORY_SEARCH_FAIL',
  'CREATE_MOVEMENT', 'CREATE_MOVEMENT_SUCCESS', 'CREATE_MOVEMENT_FAIL',
  'LOAD_MOVEMENTS', 'LOAD_MOVEMENTS_SUCCESS', 'LOAD_MOVEMENTS_FAIL',
  'LOAD_MOVEMENT_HEAD', 'LOAD_MOVEMENT_HEAD_SUCCESS', 'LOAD_MOVEMENT_HEAD_FAIL',
  'LOAD_MOVEMENT_DETAILS', 'LOAD_MOVEMENT_DETAILS_SUCCESS', 'LOAD_MOVEMENT_DETAILS_FAIL',
  'EXECUTE_MOVE', 'EXECUTE_MOVE_SUCCESS', 'EXECUTE_MOVE_FAIL',
  'CANCEL_MOVEMENT', 'CANCEL_MOVEMENT_SUCCESS', 'CANCEL_MOVEMENT_FAIL',
  'REMOVE_MOVEMENT_DETAIL', 'REMOVE_MOVEMENT_DETAIL_SUCCESS', 'REMOVE_MOVEMENT_DETAIL_FAIL',
  'LOAD_OWNUNDONEMM', 'LOAD_OWNUNDONEMM_SUCCESS', 'LOAD_OWNUNDONEMM_FAIL',
]);

const initialState = {
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
  ownerMovements: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.OPEN_MOVEMENT_MODAL:
      return { ...state, movementModal: { ...state.movementModal, visible: true, ...action.data } };
    case actionTypes.CLOSE_MOVEMENT_MODAL:
      return { ...state, movementModal: { ...state.movementModal, visible: false } };
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
    case actionTypes.LOAD_OWNUNDONEMM_SUCCESS:
      return { ...state, ownerMovements: action.result.data };
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

export function inventorySearch(filter, tenantId, whseCode, ownerCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.INVENTORY_SEARCH,
        actionTypes.INVENTORY_SEARCH_SUCCESS,
        actionTypes.INVENTORY_SEARCH_FAIL,
      ],
      endpoint: 'v1/cwm/owner/inbound/details',
      method: 'get',
      params: { filter, tenantId, whseCode, ownerCode },
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

export function loadOwnerUndoneMovements(ownerId, whseCode, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_OWNUNDONEMM,
        actionTypes.LOAD_OWNUNDONEMM_SUCCESS,
        actionTypes.LOAD_OWNUNDONEMM_FAIL,
      ],
      endpoint: 'v1/cwm/load/owner/undone/movement',
      method: 'get',
      params: { ownerId, tenantId, whseCode },
    },
  };
}
