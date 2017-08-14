import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/transition/', [
  'HIDE_TRANSITION_DOCK', 'SHOW_TRANSITION_DOCK',
  'CLOSE_BATCH_TRANSIT_MODAL', 'OPEN_BATCH_TRANSIT_MODAL',
  'CLOSE_BATCH_MOVE_MODAL', 'OPEN_BATCH_MOVE_MODAL',
  'CLOSE_BATCH_FREEZE_MODAL', 'OPEN_BATCH_FREEZE_MODAL',
  'LOAD_TRANSITIONS', 'LOAD_TRANSITIONS_SUCCEED', 'LOAD_TRANSITIONS_FAIL',
]);

const initialState = {
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
  loading: false,
  list: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  sortFilter: {
    field: '',
    order: '',
  },
  listFilter: {
    status: 'normal',
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
    case actionTypes.LOAD_TRANSITIONS:
      return { ...state,
        listFilter: JSON.parse(action.params.filter),
        sortFilter: JSON.parse(action.params.sorter),
        loading: true };
    case actionTypes.LOAD_TRANSITIONS_SUCCEED:
      return { ...state, loading: false, list: action.result.data };
    case actionTypes.LOAD_TRANSITIONS_FAIL:
      return { ...state, loading: false };
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

export function loadTransitions(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRANSITIONS,
        actionTypes.LOAD_TRANSITIONS_SUCCEED,
        actionTypes.LOAD_TRANSITIONS_FAIL,
      ],
      endpoint: 'v1/cwm/stock/inbound/transitions',
      method: 'get',
      params,
    },
  };
}
