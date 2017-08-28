import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/transition/', [
  'HIDE_TRANSITION_DOCK', 'SHOW_TRANSITION_DOCK',
  'CLOSE_BATCH_TRANSIT_MODAL', 'OPEN_BATCH_TRANSIT_MODAL',
  'CLOSE_BATCH_MOVE_MODAL', 'OPEN_BATCH_MOVE_MODAL',
  'CLOSE_BATCH_FREEZE_MODAL', 'OPEN_BATCH_FREEZE_MODAL',
  'LOAD_TRANSITIONS', 'LOAD_TRANSITIONS_SUCCEED', 'LOAD_TRANSITIONS_FAIL',
  'SPLIT_TRANSIT', 'SPLIT_TRANSIT_SUCCEED', 'SPLIT_TRANSIT_FAIL',
  'MOVE_TRANSIT', 'MOVE_TRANSIT_SUCCEED', 'MOVE_TRANSIT_FAIL',
  'ADJUST_TRANSIT', 'ADJUST_TRANSIT_SUCCEED', 'ADJUST_TRANSIT_FAIL',
  'FREEZE_TRANSIT', 'FREEZE_TRANSIT_SUCCEED', 'FREEZE_TRANSIT_FAIL',
  'UNFREEZE_TRANSIT', 'UNFREEZE_TRANSIT_SUCCEED', 'UNFREEZE_TRANSIT_FAIL',
]);

const initialState = {
  batchTransitModal: {
    visible: false,
    traceIds: [],
    detail: {},
  },
  batchMoveModal: {
    visible: false,
  },
  batchFreezeModal: {
    visible: false,
    freezed: false,
    traceIds: [],
  },
  transitionDock: {
    visible: false,
    detail: {},
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
  reloadTransitions: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.HIDE_TRANSITION_DOCK:
      return { ...state, transitionDock: { ...state.transitionDock, visible: false, detail: {} }, reloadTransitions: action.data.needReload };
    case actionTypes.SHOW_TRANSITION_DOCK:
      return { ...state, transitionDock: { ...state.transitionDock, visible: true, detail: action.data } };
    case actionTypes.CLOSE_BATCH_TRANSIT_MODAL:
      return { ...state, batchTransitModal: { ...state.batchTransitModal, visible: false }, reloadTransitions: action.data.needReload };
    case actionTypes.OPEN_BATCH_TRANSIT_MODAL:
      return { ...state, batchTransitModal: { ...state.batchTransitModal, visible: true, ...action.data } };
    case actionTypes.CLOSE_BATCH_MOVE_MODAL:
      return { ...state, batchMoveModal: { ...state.batchMoveModal, visible: false } };
    case actionTypes.OPEN_BATCH_MOVE_MODAL:
      return { ...state, batchMoveModal: { ...state.batchMoveModal, visible: true } };
    case actionTypes.CLOSE_BATCH_FREEZE_MODAL:
      return { ...state, batchFreezeModal: initialState.batchFreezeModal, reloadTransitions: action.data.needReload };
    case actionTypes.OPEN_BATCH_FREEZE_MODAL:
      return { ...state, batchFreezeModal: { ...state.batchFreezeModal, visible: true, ...action.data } };
    case actionTypes.LOAD_TRANSITIONS:
      return { ...state,
        listFilter: JSON.parse(action.params.filter),
        sortFilter: JSON.parse(action.params.sorter),
        loading: true,
        reloadTransitions: false,
      };
    case actionTypes.LOAD_TRANSITIONS_SUCCEED:
      return { ...state, loading: false, list: action.result.data };
    case actionTypes.LOAD_TRANSITIONS_FAIL:
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function hideTransitionDock({ needReload }) {
  return {
    type: actionTypes.HIDE_TRANSITION_DOCK,
    data: { needReload },
  };
}

export function showTransitionDock(inboundDetail) {
  return {
    type: actionTypes.SHOW_TRANSITION_DOCK,
    data: inboundDetail,
  };
}

export function openBatchTransitModal(transitModal) {
  return {
    type: actionTypes.OPEN_BATCH_TRANSIT_MODAL,
    data: transitModal,
  };
}

export function closeBatchTransitModal({ needReload }) {
  return {
    type: actionTypes.CLOSE_BATCH_TRANSIT_MODAL,
    data: { needReload },
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

export function openBatchFreezeModal(freezeModal) {
  return {
    type: actionTypes.OPEN_BATCH_FREEZE_MODAL,
    data: freezeModal,
  };
}

export function closeBatchFreezeModal({ needReload }) {
  return {
    type: actionTypes.CLOSE_BATCH_FREEZE_MODAL,
    data: { needReload },
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

export function splitTransit(traceIds, transit, loginName, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SPLIT_TRANSIT,
        actionTypes.SPLIT_TRANSIT_SUCCEED,
        actionTypes.SPLIT_TRANSIT_FAIL,
      ],
      endpoint: 'v1/cwm/stock/transition/split',
      method: 'post',
      data: { traceIds, transit, loginName, tenantId },
    },
  };
}

export function moveTransit(traceIds, transit, targetLocation, movementNo, loginName, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.MOVE_TRANSIT,
        actionTypes.MOVE_TRANSIT_SUCCEED,
        actionTypes.MOVE_TRANSIT_FAIL,
      ],
      endpoint: 'v1/cwm/stock/transition/move',
      method: 'post',
      data: { traceIds, transit, targetLocation, movementNo, loginName, tenantId },
    },
  };
}

export function adjustTransit(traceId, transit, loginName, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADJUST_TRANSIT,
        actionTypes.ADJUST_TRANSIT_SUCCEED,
        actionTypes.ADJUST_TRANSIT_FAIL,
      ],
      endpoint: 'v1/cwm/stock/transition/adjust',
      method: 'post',
      data: { traceId, transit, loginName, tenantId },
    },
  };
}

export function freezeTransit(traceIds, transit, loginName, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FREEZE_TRANSIT,
        actionTypes.FREEZE_TRANSIT_SUCCEED,
        actionTypes.FREEZE_TRANSIT_FAIL,
      ],
      endpoint: 'v1/cwm/stock/transition/freeze',
      method: 'post',
      data: { traceIds, transit, loginName, tenantId },
    },
  };
}

export function unfreezeTransit(traceIds, transit, loginName, tenantId, qty) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UNFREEZE_TRANSIT,
        actionTypes.UNFREEZE_TRANSIT_SUCCEED,
        actionTypes.UNFREEZE_TRANSIT_FAIL,
      ],
      endpoint: 'v1/cwm/stock/transition/unfreeze',
      method: 'post',
      data: { traceIds, transit, loginName, tenantId, qty },
    },
  };
}
