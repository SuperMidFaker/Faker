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
  'BATCH_RELEASE', 'BATCH_RELEASE_SUCCEED', 'BATCH_RELEASE_FAIL',
  'LOAD_WAVE_ORDERS', 'LOAD_WAVE_ORDERS_SUCCEED', 'LOAD_WAVE_ORDERS_FAIL',
  'LOAD_WAVE_DETAILS', 'LOAD_WAVE_DETAILS_SUCCEED', 'LOAD_WAVE_DETAILS_FAIL',
  'CANCEL_WAVE', 'CANCEL_WAVE_SUCCEED', 'CANCEL_WAVE_FAIL',
  'LOAD_WAVE_HEAD', 'LOAD_WAVE_HEAD_SUCCEED', 'LOAD_WAVE_HEAD_FAIL',
  'REMOVE_WAVE_ORDERS', 'REMOVE_WAVE_ORDERS_SUCCEED', 'REMOVE_WAVE_ORDERS_FAIL',
  'SHOW_ADD_TO_WAVE', 'HIDE_ADD_TO_WAVE',
  'ADD_TO_WAVE', 'ADD_TO_WAVE_SUCCEED', 'ADD_TO_WAVE_FAIL',
  'LOAD_SHFTZ_RELEASE', 'LOAD_SHFTZ_RELEASE_SUCCEED', 'LOAD_SHFTZ_RELEASE_FAIL',
  'GET_SO_UUID', 'GET_SO_UUID_SUCCEED', 'GET_SO_UUID_FAIL',
  'GET_SHIPMT_ORDERNO', 'GET_SHIPMT_ORDERNO_SUCCEED', 'GET_SHIPMT_ORDERNO_FAIL',
  'CANCEL_OUTBOUND', 'CANCEL_OUTBOUND_SUCCEED', 'CANCEL_OUTBOUND_FAIL',
  'CLOSE_OUTBOUND', 'CLOSE_OUTBOUND_SUCCEED', 'CLOSE_OUTBOUND_FAIL',
  'SHOW_ASN_SELECT', 'HIDE_ASN_SELECT',
  'UPDATE_SOHEAD', 'UPDATE_SOHEAD_SUCCEED', 'UPDATE_SOHEAD_FAIL',
]);

const initialState = {
  submitting: false,
  dock: {
    visible: false,
    tabKey: null,
    order: {
      so_no: '',
      outboundNo: '',
      status: 0,
      uuid: '',
    },
  },
  dockLoading: false,
  solist: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
    loading: true,
    loaded: true,
  },
  soFilters: { status: 'all', ownerCode: 'all', receiverCode: 'all', carrierCode: 'all' },
  wave: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
    loading: true,
  },
  waveFilters: { status: 'all', ownerCode: 'all' },
  addToMoveModal: {
    visible: false,
    ownerId: '',
  },
  waveHead: {},
  waveOrders: [],
  waveDetails: [],
  waveReload: false,
  asnSelectModal: {
    visible: false,
  },
};

export const { CANCEL_OUTBOUND_SUCCEED, CLOSE_OUTBOUND_SUCCEED } = actionTypes;
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.ADD_SO:
    case actionTypes.UPDATE_SO:
      return { ...state, submitting: true };
    case actionTypes.ADD_SO_SUCCEED:
    case actionTypes.ADD_SO_FAIL:
    case actionTypes.UPDATE_SO_SUCCEED:
    case actionTypes.UPDATE_SO_FAIL:
      return { ...state, submitting: false };
    case actionTypes.HIDE_DOCK:
      return { ...state, dock: { ...state.dock, visible: false } };
    case actionTypes.SHOW_DOCK:
      return { ...state, dock: { ...state.dock, visible: true, order: { ...state.dock.order, so_no: action.soNo, outboundNo: action.outboundNo, status: 0 } } };
    case actionTypes.CHANGE_DOCK_TAB:
      return { ...state, dock: { ...state.dock, tabKey: action.data.tabKey } };
    case actionTypes.LOAD_SOS:
      return { ...state, soFilters: JSON.parse(action.params.filters), solist: { ...state.solist, loading: true } };
    case actionTypes.LOAD_SOS_SUCCEED:
      return { ...state, solist: { ...action.result.data, loading: false, loaded: true } };
    case actionTypes.LOAD_WAVES:
      return { ...state, waveFilters: JSON.parse(action.params.filters), wave: { ...state.wave, loading: true } };
    case actionTypes.LOAD_WAVES_SUCCEED:
      return { ...state, wave: { ...action.result.data, loading: false } };
    case actionTypes.SHOW_ADD_TO_WAVE:
      return { ...state, addToMoveModal: { ...state.addToMoveModal, visible: true, ownerCode: action.ownerCode } };
    case actionTypes.HIDE_ADD_TO_WAVE:
      return { ...state, addToMoveModal: { ...state.addToMoveModal, visible: false } };
    case actionTypes.LOAD_WAVE_HEAD_SUCCEED:
      return { ...state, waveHead: action.result.data, waveReload: false };
    case actionTypes.LOAD_WAVE_ORDERS_SUCCEED:
      return { ...state, waveOrders: action.result.data, waveReload: false };
    case actionTypes.LOAD_WAVE_DETAILS_SUCCEED:
      return { ...state, waveDetails: action.result.data, waveReload: false };
    case actionTypes.LOAD_WAVE_HEAD_FAIL:
    case actionTypes.LOAD_WAVE_ORDERS_FAIL:
    case actionTypes.LOAD_WAVE_DETAILS_FAIL:
      return { ...state, waveReload: false };
    case actionTypes.REMOVE_WAVE_ORDERS_SUCCEED:
      return { ...state, waveReload: true };
    case actionTypes.GET_SO_UUID_SUCCEED:
      return { ...state, dock: { ...state.dock, order: { ...state.dock.order, uuid: action.result.data.flow_instance_uuid } } };
    case actionTypes.CANCEL_OUTBOUND_SUCCEED:
      return { ...state, dock: { ...state.dock, visible: false }, solist: { ...state.solist, loaded: false } };
    case actionTypes.CLOSE_OUTBOUND_SUCCEED:
      return { ...state, dock: { ...state.dock, visible: false }, solist: { ...state.solist, loaded: false }, dockLoading: false };
    case actionTypes.SHOW_ASN_SELECT:
      return { ...state, asnSelectModal: { ...state.asnSelectModal, visible: true } };
    case actionTypes.HIDE_ASN_SELECT:
      return { ...state, asnSelectModal: { ...state.asnSelectModal, visible: false } };
    case actionTypes.GET_SO:
    case actionTypes.CLOSE_OUTBOUND:
      return { ...state, dockLoading: true };
    case actionTypes.GET_SO_SUCCEED:
    case actionTypes.GET_SO_FAIL:
    case actionTypes.CLOSE_OUTBOUND_FAIL:
      return { ...state, dockLoading: false };
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

export function showDock(soNo, outboundNo) {
  return {
    type: actionTypes.SHOW_DOCK,
    soNo,
    outboundNo,
  };
}

export function createSO(data) {
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

export function batchRelease(soNos, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.BATCH_RELEASE,
        actionTypes.BATCH_RELEASE_SUCCEED,
        actionTypes.BATCH_RELEASE_FAIL,
      ],
      endpoint: 'v1/cwm/shipping/batch/release',
      method: 'post',
      data: { soNos, loginId },
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

export function createWave(soNos, tenantName, whseCode, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_WAVES,
        actionTypes.CREATE_WAVES_SUCCEED,
        actionTypes.CREATE_WAVES_FAIL,
      ],
      endpoint: 'v1/cwm/create/waves',
      method: 'post',
      data: { soNos, tenantName, whseCode, loginId },
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

export function showAddToWave(ownerCode) {
  return {
    type: actionTypes.SHOW_ADD_TO_WAVE,
    ownerCode,
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

export function loadShftzRelease(soNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SHFTZ_RELEASE,
        actionTypes.LOAD_SHFTZ_RELEASE_SUCCEED,
        actionTypes.LOAD_SHFTZ_RELEASE_FAIL,
      ],
      endpoint: 'v1/cwm/shftz/release/load',
      method: 'get',
      params: { soNo },
    },
  };
}

export function getSoUuid(soNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GET_SO_UUID,
        actionTypes.GET_SO_UUID_SUCCEED,
        actionTypes.GET_SO_UUID_FAIL,
      ],
      endpoint: 'v1/cwm/get/so/uuid',
      method: 'get',
      params: { soNo },
    },
  };
}

export function getShipmtOrderNo(uuid) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GET_SHIPMT_ORDERNO,
        actionTypes.GET_SHIPMT_ORDERNO_SUCCEED,
        actionTypes.GET_SHIPMT_ORDERNO_FAIL,
      ],
      endpoint: 'v1/crm/get/shipmt/order/no',
      method: 'get',
      params: { uuid, type: 'outbound' },
    },
  };
}

export function cancelOutbound(body) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CANCEL_OUTBOUND,
        actionTypes.CANCEL_OUTBOUND_SUCCEED,
        actionTypes.CANCEL_OUTBOUND_FAIL,
      ],
      endpoint: 'v1/cwm/shipping/outbound/cancel',
      method: 'post',
      data: body,
    },
  };
}

export function closeOutbound(body) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CLOSE_OUTBOUND,
        actionTypes.CLOSE_OUTBOUND_SUCCEED,
        actionTypes.CLOSE_OUTBOUND_FAIL,
      ],
      endpoint: 'v1/cwm/shipping/outbound/close',
      method: 'post',
      data: body,
    },
  };
}

export function showAsnSelectModal() {
  return {
    type: actionTypes.SHOW_ASN_SELECT,
  };
}

export function hideAsnSelectModal() {
  return {
    type: actionTypes.HIDE_ASN_SELECT,
  };
}

export function updateSoHead(soNo, updates) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_SOHEAD,
        actionTypes.UPDATE_SOHEAD_SUCCEED,
        actionTypes.UPDATE_SOHEAD_FAIL,
      ],
      endpoint: 'v1/cwm/so/head/update/fields',
      method: 'post',
      data: { updates, soNo },
    },
  };
}
