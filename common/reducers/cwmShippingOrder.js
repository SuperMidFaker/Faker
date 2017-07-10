import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/shipping/', [
  'HIDE_DOCK', 'SHOW_DOCK', 'CHANGE_DOCK_TAB',
  'ADD_SO', 'ADD_SO_SUCCEED', 'ADD_SO_FAIL',
  'LOAD_SOS', 'LOAD_SOS_SUCCEED', 'LOAD_SOS_FAIL',
  'GET_SO', 'GET_SO_SUCCEED', 'GET_SO_FAIL',
  'UPDATE_SO', 'UPDATE_SO_SUCCEED', 'UPDATE_SO_FAIL',
  'RELEASE_SO', 'RELEASE_SO_SUCCEED', 'RELEASE_SO_FAIL',
  'LOAD_WAVES', 'LOAD_WAVES_SUCCEED', 'LOAD_WAVES_FAIL',
  'CREATE_WAVES', 'CREATE_WAVES_SUCCEED', 'CREATE_WAVES_FAIL',
  'RELEASE_WAVE', 'RELEASE_WAVE_SUCCEED', 'RELEASE_WAVE_FAIL',
  'LOAD_WAVE_ORDERS', 'LOAD_WAVE_ORDERS_SUCCEED', 'LOAD_WAVE_ORDERS_FAIL',
  'LOAD_WAVE_DETAILS', 'LOAD_WAVE_DETAILS_SUCCEED', 'LOAD_WAVE_DETAILS_FAIL',
  'CANCEL_WAVE', 'CANCEL_WAVE_SUCCEED', 'CANCEL_WAVE_FAIL',
  'LOAD_WAVE_HEAD', 'LOAD_WAVE_HEAD_SUCCEED', 'LOAD_WAVE_HEAD_FAIL',
  'REMOVE_WAVE_ORDERS', 'REMOVE_WAVE_ORDERS_SUCCEED', 'REMOVE_WAVE_ORDERS_FAIL',
  'SHOW_ADD_TO_WAVE', 'HIDE_ADD_TO_WAVE',
  'ADD_TO_WAVE', 'ADD_TO_WAVE_SUCCEED', 'ADD_TO_WAVE_FAIL',
]);

const initialState = {
  dock: {
    visible: false,
    tabKey: null,
    order: {
      so_no: '',
      status: 0,
    },
  },
  solist: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
    loading: true,
  },
  soFilters: { status: 'pending', ownerCode: 'all' },
  wave: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
    loading: true,
  },
  waveFilters: { status: 'pending' },
  addToMoveModal: {
    visible: false,
    ownerId: '',
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.HIDE_DOCK:
      return { ...state, dock: { ...state.dock, visible: false } };
    case actionTypes.SHOW_DOCK:
      return { ...state, dock: { ...state.dock, visible: true } };
    case actionTypes.CHANGE_DOCK_TAB:
      return { ...state, dock: { ...state.dock, tabKey: action.data.tabKey } };
    case actionTypes.LOAD_SOS:
      return { ...state, soFilters: JSON.parse(action.params.filters), solist: { ...state.solist, loading: true } };
    case actionTypes.LOAD_SOS_SUCCEED:
      return { ...state, solist: { ...action.result.data, loading: false } };
    case actionTypes.LOAD_WAVES:
      return { ...state, waveFilters: JSON.parse(action.params.filters), wave: { ...state.wave, loading: true } };
    case actionTypes.LOAD_WAVES_SUCCEED:
      return { ...state, wave: { ...action.result.data, loading: false } };
    case actionTypes.SHOW_ADD_TO_WAVE:
      return { ...state, addToMoveModal: { ...state.addToMoveModal, visible: true, ownerId: action.ownerId } };
    case actionTypes.HIDE_ADD_TO_WAVE:
      return { ...state, addToMoveModal: { ...state.addToMoveModal, visible: false } };
    default:
      return state;
  }
}

export function changeDockTab(tabKey) {
  return {
    type: actionTypes.CHANGE_DOCK_TAB,
    data: { tabKey },
  };
}

export function hideDock() {
  return {
    type: actionTypes.HIDE_DOCK,
  };
}

export function showDock() {
  return {
    type: actionTypes.SHOW_DOCK,
  };
}

export function addSo(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_SO,
        actionTypes.ADD_SO_SUCCEED,
        actionTypes.ADD_SO_FAIL,
      ],
      endpoint: 'v1/cwm/shipping/so/add',
      method: 'post',
      data,
    },
  };
}

export function loadSos({ whseCode, pageSize, current, filters }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SOS,
        actionTypes.LOAD_SOS_SUCCEED,
        actionTypes.LOAD_SOS_FAIL,
      ],
      endpoint: 'v1/cwm/shipping/sos/load',
      method: 'get',
      params: { whseCode, pageSize, current, filters: JSON.stringify(filters) },
    },
  };
}

export function getSo(soNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GET_SO,
        actionTypes.GET_SO_SUCCEED,
        actionTypes.GET_SO_FAIL,
      ],
      endpoint: 'v1/cwm/shipping/so/get',
      method: 'get',
      params: { soNo },
    },
  };
}

export function updateSo(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_SO,
        actionTypes.UPDATE_SO_SUCCEED,
        actionTypes.UPDATE_SO_FAIL,
      ],
      endpoint: 'v1/cwm/shipping/so/update',
      method: 'post',
      data,
    },
  };
}

export function releaseSo(soNo, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RELEASE_SO,
        actionTypes.RELEASE_SO_SUCCEED,
        actionTypes.RELEASE_SO_FAIL,
      ],
      endpoint: 'v1/cwm/release/so',
      method: 'post',
      data: { soNo, loginId },
    },
  };
}

export function loadWaves({ whseCode, pageSize, current, filters }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_WAVES,
        actionTypes.LOAD_WAVES_SUCCEED,
        actionTypes.LOAD_WAVES_FAIL,
      ],
      endpoint: 'v1/cwm/waves',
      method: 'get',
      params: { whseCode, pageSize, current, filters: JSON.stringify(filters) },
    },
  };
}

export function loadWaveHead(waveNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_WAVE_HEAD,
        actionTypes.LOAD_WAVE_HEAD_SUCCEED,
        actionTypes.LOAD_WAVE_HEAD_FAIL,
      ],
      endpoint: 'v1/cwm/wave/head',
      method: 'get',
      params: { waveNo },
    },
  };
}

export function createWave(soNos, tenantId, tenantName, whseCode, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_WAVES,
        actionTypes.CREATE_WAVES_SUCCEED,
        actionTypes.CREATE_WAVES_FAIL,
      ],
      endpoint: 'v1/cwm/create/waves',
      method: 'post',
      data: { soNos, tenantId, tenantName, whseCode, loginId },
    },
  };
}

export function releaseWave(waveNo, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RELEASE_WAVE,
        actionTypes.RELEASE_WAVE_SUCCEED,
        actionTypes.RELEASE_WAVE_FAIL,
      ],
      endpoint: 'v1/cwm/release/wave',
      method: 'post',
      data: { waveNo, loginId },
    },
  };
}

export function loadWaveOrders(waveNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_WAVE_ORDERS,
        actionTypes.LOAD_WAVE_ORDERS_SUCCEED,
        actionTypes.LOAD_WAVE_ORDERS_FAIL,
      ],
      endpoint: 'v1/cwm/wave/orders',
      method: 'get',
      params: { waveNo },
    },
  };
}

export function loadWaveDetails(waveNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_WAVE_DETAILS,
        actionTypes.LOAD_WAVE_DETAILS_SUCCEED,
        actionTypes.LOAD_WAVE_DETAILS_FAIL,
      ],
      endpoint: 'v1/cwm/wave/details',
      method: 'get',
      params: { waveNo },
    },
  };
}

export function cancelWave(waveNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CANCEL_WAVE,
        actionTypes.CANCEL_WAVE_SUCCEED,
        actionTypes.CANCEL_WAVE_FAIL,
      ],
      endpoint: 'v1/cwm/cancel/wave',
      method: 'post',
      data: { waveNo },
    },
  };
}

export function removeWaveOrders(soNos, waveNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_WAVE_ORDERS,
        actionTypes.REMOVE_WAVE_ORDERS_SUCCEED,
        actionTypes.REMOVE_WAVE_ORDERS_FAIL,
      ],
      endpoint: 'v1/cwm/remove/wave/orders',
      method: 'post',
      data: { soNos, waveNo },
    },
  };
}

export function showAddToWave(ownerId) {
  return {
    type: actionTypes.SHOW_ADD_TO_WAVE,
    ownerId,
  };
}

export function hideAddToWave() {
  return {
    type: actionTypes.HIDE_ADD_TO_WAVE,
  };
}

export function addToWave(soNos, waveNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_TO_WAVE,
        actionTypes.ADD_TO_WAVE_SUCCEED,
        actionTypes.ADD_TO_WAVE_FAIL,
      ],
      endpoint: 'v1/cwm/add/to/wave',
      method: 'post',
      data: { soNos, waveNo },
    },
  };
}
