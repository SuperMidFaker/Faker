import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/transition/', [
  'CLOSE_TRANSITION_MODAL', 'OPEN_TRANSITION_MODAL',
  'SHOW_UPLOADTRANSIT_MODAL',
  'CLOSE_BATCH_TRANSIT_MODAL', 'OPEN_BATCH_TRANSIT_MODAL',
  'CLOSE_BATCH_MOVE_MODAL', 'OPEN_BATCH_MOVE_MODAL',
  'CLOSE_BATCH_FREEZE_MODAL', 'OPEN_BATCH_FREEZE_MODAL',
  'LOAD_TRANSITIONS', 'LOAD_TRANSITIONS_SUCCEED', 'LOAD_TRANSITIONS_FAIL',
  'LOAD_TRANSTAT', 'LOAD_TRANSTAT_SUCCEED', 'LOAD_TRANSTAT_FAIL',
  'SPLIT_TRANSIT', 'SPLIT_TRANSIT_SUCCEED', 'SPLIT_TRANSIT_FAIL',
  'MOVE_TRANSIT', 'MOVE_TRANSIT_SUCCEED', 'MOVE_TRANSIT_FAIL',
  'ADJUST_TRANSIT', 'ADJUST_TRANSIT_SUCCEED', 'ADJUST_TRANSIT_FAIL',
  'FREEZE_TRANSIT', 'FREEZE_TRANSIT_SUCCEED', 'FREEZE_TRANSIT_FAIL',
  'UNFREEZE_TRANSIT', 'UNFREEZE_TRANSIT_SUCCEED', 'UNFREEZE_TRANSIT_FAIL',
  'LOAD_TTDETAIL', 'LOAD_TTDETAIL_SUCCEED', 'LOAD_TTDETAIL_FAIL',
  'CLEAR_TRANSITION', 'CLEAR_TRANSITION_SUCCEED', 'CLEAR_TRANSITION_FAIL',
]);

const initialState = {
  batchTransitModal: {
    visible: false,
    traceIds: [],
    detail: {},
  },
  batchUploadTransitModal: {
    visible: false,
  },
  batchMoveModal: {
    visible: false,
  },
  batchFreezeModal: {
    visible: false,
    freezed: false,
    traceIds: [],
  },
  transitionModal: {
    visible: false,
    trace_id: '',
    needReload: false,
    loading: false,
    detail: {},
  },
  loading: false,
  list: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
    totalReducedList: [],
  },
  stat: {
    stock_qty: null,
    avail_qty: null,
    alloc_qty: null,
    frozen_qty: null,
    bonded_qty: null,
    nonbonded_qty: null,
  },
  sortFilter: {
    field: '',
    order: '',
  },
  listFilter: {
    status: 'all',
  },
  reloadTransitions: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.CLOSE_TRANSITION_MODAL:
      return {
        ...state,
        transitionModal: {
          ...state.transitionModal,
          visible: false,
          detail: {},
        },
      };
    case actionTypes.OPEN_TRANSITION_MODAL:
      return {
        ...state,
        transitionModal: {
          ...state.transitionModal, visible: true, trace_id: action.data, needReload: true,
        },
      };
    case actionTypes.SHOW_UPLOADTRANSIT_MODAL:
      return {
        ...state,
        batchUploadTransitModal: {
          ...state.batchUploadTransitModal,
          ...action.data,
        },
        reloadTransitions: action.data.needReload,
      };
    case actionTypes.SPLIT_TRANSIT_SUCCEED:
    case actionTypes.MOVE_TRANSIT_SUCCEED:
    case actionTypes.ADJUST_TRANSIT_SUCCEED:
    case actionTypes.FREEZE_TRANSIT_SUCCEED:
    case actionTypes.UNFREEZE_TRANSIT_SUCCEED:
      return {
        ...state,
        transitionModal: {
          ...state.transitionModal,
          needReload: true,
        },
        reloadTransitions: true,
      };
    case actionTypes.CLOSE_BATCH_TRANSIT_MODAL:
      return {
        ...state,
        batchTransitModal: {
          ...state.batchTransitModal,
          visible: false,
        },
        reloadTransitions: action.data.needReload,
      };
    case actionTypes.OPEN_BATCH_TRANSIT_MODAL:
      return {
        ...state,
        batchTransitModal: {
          ...state.batchTransitModal,
          visible: true,
          ...action.data,
        },
      };
    case actionTypes.CLOSE_BATCH_MOVE_MODAL:
      return { ...state, batchMoveModal: { ...state.batchMoveModal, visible: false } };
    case actionTypes.OPEN_BATCH_MOVE_MODAL:
      return { ...state, batchMoveModal: { ...state.batchMoveModal, visible: true } };
    case actionTypes.CLOSE_BATCH_FREEZE_MODAL:
      return {
        ...state,
        batchFreezeModal: initialState.batchFreezeModal,
        reloadTransitions: action.data.needReload,
      };
    case actionTypes.OPEN_BATCH_FREEZE_MODAL:
      return {
        ...state,
        batchFreezeModal: {
          ...state.batchFreezeModal,
          visible: true,
          ...action.data,
        },
      };
    case actionTypes.LOAD_TRANSITIONS:
      return {
        ...state,
        listFilter: JSON.parse(action.params.filter),
        sortFilter: JSON.parse(action.params.sorter),
        loading: true,
        reloadTransitions: false,
      };
    case actionTypes.LOAD_TRANSITIONS_SUCCEED:
      return { ...state, loading: false, list: action.result.data };
    case actionTypes.LOAD_TRANSITIONS_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_TRANSTAT_SUCCEED:
      return { ...state, stat: action.result.data };
    case actionTypes.LOAD_TTDETAIL:
      return {
        ...state,
        transitionModal: {
          ...state.transitionModal,
          loading: true,
          needReload: false,
        },
      };
    case actionTypes.LOAD_TTDETAIL_FAIL:
      return { ...state, transitionModal: { ...state.transitionModal, loading: false } };
    case actionTypes.LOAD_TTDETAIL_SUCCEED:
      return {
        ...state,
        transitionModal: {
          ...state.transitionModal,
          detail: action.result.data,
          loading: false,
        },
      };
    default:
      return state;
  }
}

export function closeTransitionModal() {
  return {
    type: actionTypes.CLOSE_TRANSITION_MODAL,
  };
}

export function openTransitionModal(traceId) {
  return {
    type: actionTypes.OPEN_TRANSITION_MODAL,
    data: traceId,
  };
}

export function showUploadTransitModal(data) {
  return {
    type: actionTypes.SHOW_UPLOADTRANSIT_MODAL,
    data,
  };
}

export function openBatchTransitModal(batchTransit) {
  return {
    type: actionTypes.OPEN_BATCH_TRANSIT_MODAL,
    data: batchTransit,
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

export function loadTransitionStat(filter) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRANSTAT,
        actionTypes.LOAD_TRANSTAT_SUCCEED,
        actionTypes.LOAD_TRANSTAT_FAIL,
      ],
      endpoint: 'v1/cwm/stock/transition/stat',
      method: 'get',
      params: { filter },
    },
  };
}

export function splitTransit(traceIds, transit, loginName) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SPLIT_TRANSIT,
        actionTypes.SPLIT_TRANSIT_SUCCEED,
        actionTypes.SPLIT_TRANSIT_FAIL,
      ],
      endpoint: 'v1/cwm/stock/transition/split',
      method: 'post',
      data: { traceIds, transit, loginName },
    },
  };
}

export function moveTransit(traceIds, transit, targetLocation, movementNo, loginName) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.MOVE_TRANSIT,
        actionTypes.MOVE_TRANSIT_SUCCEED,
        actionTypes.MOVE_TRANSIT_FAIL,
      ],
      endpoint: 'v1/cwm/stock/transition/move',
      method: 'post',
      data: {
        traceIds, transit, targetLocation, movementNo, loginName,
      },
    },
  };
}

export function adjustTransit(traceId, transit, loginName) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADJUST_TRANSIT,
        actionTypes.ADJUST_TRANSIT_SUCCEED,
        actionTypes.ADJUST_TRANSIT_FAIL,
      ],
      endpoint: 'v1/cwm/stock/transition/adjust',
      method: 'post',
      data: { traceId, transit, loginName },
    },
  };
}

export function freezeTransit(traceIds, transit, loginName, qty) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FREEZE_TRANSIT,
        actionTypes.FREEZE_TRANSIT_SUCCEED,
        actionTypes.FREEZE_TRANSIT_FAIL,
      ],
      endpoint: 'v1/cwm/stock/transition/freeze',
      method: 'post',
      data: {
        traceIds, transit, loginName, qty,
      },
    },
  };
}

export function unfreezeTransit(traceIds, transit, loginName, qty) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UNFREEZE_TRANSIT,
        actionTypes.UNFREEZE_TRANSIT_SUCCEED,
        actionTypes.UNFREEZE_TRANSIT_FAIL,
      ],
      endpoint: 'v1/cwm/stock/transition/unfreeze',
      method: 'post',
      data: {
        traceIds, transit, loginName, qty,
      },
    },
  };
}

export function loadTransitionTraceDetail(traceId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TTDETAIL,
        actionTypes.LOAD_TTDETAIL_SUCCEED,
        actionTypes.LOAD_TTDETAIL_FAIL,
      ],
      endpoint: 'v1/cwm/inbound/trace/detail',
      method: 'get',
      params: { traceId },
    },
  };
}

export function clearTransition(whseCode, ownerPartnerId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CLEAR_TRANSITION,
        actionTypes.CLEAR_TRANSITION_SUCCEED,
        actionTypes.CLEAR_TRANSITION_FAIL,
      ],
      endpoint: 'v1/cwm/clear/transition',
      method: 'post',
      data: { whseCode, ownerPartnerId },
    },
  };
}
