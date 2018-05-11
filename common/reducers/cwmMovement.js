import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/inventory/movement/', [
  'OPEN_MOVEMENT_MODAL', 'CLOSE_MOVEMENT_MODAL', 'SET_MOVEMODAL_FILTER',
  'SEARCH_OWNSTOCK', 'SEARCH_OWNSTOCK_SUCCESS', 'SEARCH_OWNSTOCK_FAIL',
  'CREATE_MOVEMENT', 'CREATE_MOVEMENT_SUCCESS', 'CREATE_MOVEMENT_FAIL',
  'LOAD_MOVEMENTS', 'LOAD_MOVEMENTS_SUCCESS', 'LOAD_MOVEMENTS_FAIL',
  'LOAD_MOVEMENT_HEAD', 'LOAD_MOVEMENT_HEAD_SUCCESS', 'LOAD_MOVEMENT_HEAD_FAIL',
  'LOAD_MOVEMENT_DETAILS', 'LOAD_MOVEMENT_DETAILS_SUCCESS', 'LOAD_MOVEMENT_DETAILS_FAIL',
  'EXECUTE_MOVE', 'EXECUTE_MOVE_SUCCESS', 'EXECUTE_MOVE_FAIL',
  'CANCEL_MOVEMENT', 'CANCEL_MOVEMENT_SUCCESS', 'CANCEL_MOVEMENT_FAIL',
  'REMOVE_MOVEMENT_DETAIL', 'REMOVE_MOVEMENT_DETAIL_SUCCESS', 'REMOVE_MOVEMENT_DETAIL_FAIL',
  'LOAD_OWNUNDONEMM', 'LOAD_OWNUNDONEMM_SUCCESS', 'LOAD_OWNUNDONEMM_FAIL',
  'UPDATE_MOVING_MODE', 'UPDATE_MOVING_MODE_SUCCESS', 'UPDATE_MOVING_MODE_FAIL',
  'UPDATE_MOVEMENT_DETAIL', 'UPDATE_MOVEMENT_DETAIL_SUCCESS', 'UPDATE_MOVEMENT_DETAIL_FAIL',
]);

const initialState = {
  movementModal: {
    visible: false,
    filter: {
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
    case actionTypes.LOAD_MOVEMENTS:
      return {
        ...state,
        movements: { ...state.movements, loading: true },
        movementFilter: JSON.parse(action.params.filter),
      };
    case actionTypes.LOAD_MOVEMENTS_FAIL:
      return { ...state, movements: { ...state.movements, loading: false } };
    case actionTypes.LOAD_MOVEMENTS_SUCCESS:
      return { ...state, movements: { ...action.result.data, loading: false } };
    case actionTypes.SET_MOVEMODAL_FILTER:
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

export function searchOwnerStock(filter, whseCode, ownerCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEARCH_OWNSTOCK,
        actionTypes.SEARCH_OWNSTOCK_SUCCESS,
        actionTypes.SEARCH_OWNSTOCK_FAIL,
      ],
      endpoint: 'v1/cwm/owner/inbound/details',
      method: 'get',
      params: { filter, whseCode, ownerCode },
    },
  };
}

export function createMovement(moveInfo, details) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_MOVEMENT,
        actionTypes.CREATE_MOVEMENT_SUCCESS,
        actionTypes.CREATE_MOVEMENT_FAIL,
      ],
      endpoint: 'v1/cwm/create/movement',
      method: 'post',
      data: {
        moveInfo, details,
      },
    },
  };
}

export function loadMovements({
  whseCode, pageSize, current, filter,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_MOVEMENTS,
        actionTypes.LOAD_MOVEMENTS_SUCCESS,
        actionTypes.LOAD_MOVEMENTS_FAIL,
      ],
      endpoint: 'v1/cwm/load/movements',
      method: 'get',
      params: {
        whseCode, pageSize, current, filter: JSON.stringify(filter),
      },
    },
  };
}

export function setMovementsFilter(filter) {
  return {
    type: actionTypes.SET_MOVEMODAL_FILTER,
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

export function executeMovement(movementNo, toTraceIds, loginName, whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EXECUTE_MOVE,
        actionTypes.EXECUTE_MOVE_SUCCESS,
        actionTypes.EXECUTE_MOVE_FAIL,
      ],
      endpoint: 'v1/cwm/execute/move',
      method: 'post',
      data: {
        movementNo, toTraceIds, loginName, whseCode,
      },
    },
  };
}

export function cancelMovement(movementNo, loginName) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CANCEL_MOVEMENT,
        actionTypes.CANCEL_MOVEMENT_SUCCESS,
        actionTypes.CANCEL_MOVEMENT_FAIL,
      ],
      endpoint: 'v1/cwm/cancel/movement',
      method: 'post',
      data: { movementNo, loginName },
    },
  };
}

export function removeMoveDetail(movementNo, toTraceId, loginName) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_MOVEMENT_DETAIL,
        actionTypes.REMOVE_MOVEMENT_DETAIL_SUCCESS,
        actionTypes.REMOVE_MOVEMENT_DETAIL_FAIL,
      ],
      endpoint: 'v1/cwm/remove/movement/detail',
      method: 'post',
      data: { toTraceId, loginName, movementNo },
    },
  };
}

export function loadOwnerUndoneMovements(ownerId, whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_OWNUNDONEMM,
        actionTypes.LOAD_OWNUNDONEMM_SUCCESS,
        actionTypes.LOAD_OWNUNDONEMM_FAIL,
      ],
      endpoint: 'v1/cwm/load/owner/undone/movement',
      method: 'get',
      params: { ownerId, whseCode },
    },
  };
}

export function updateMovingMode(movementNo, value) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_MOVING_MODE,
        actionTypes.UPDATE_MOVING_MODE_SUCCESS,
        actionTypes.UPDATE_MOVING_MODE_FAIL,
      ],
      endpoint: 'v1/cwm/update/moving/mode',
      method: 'post',
      data: { movementNo, value },
    },
  };
}

export function updateMovementDetail(id, set) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_MOVEMENT_DETAIL,
        actionTypes.UPDATE_MOVEMENT_DETAIL_SUCCESS,
        actionTypes.UPDATE_MOVEMENT_DETAIL_FAIL,
      ],
      endpoint: 'v1/cwm/update/movement/detail',
      method: 'post',
      data: { id, set },
    },
  };
}
