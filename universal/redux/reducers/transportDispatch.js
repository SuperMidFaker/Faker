import { CLIENT_API } from 'reusable/redux-middlewares/api';
import { createActionTypes } from 'reusable/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/dispatch/',
  ['LOAD_APTSHIPMENT', 'LOAD_APTSHIPMENT_FAIL', 'LOAD_APTSHIPMENT_SUCCEED',
   'LOAD_LSPS', 'LOAD_LSPS_FAIL', 'LOAD_LSPS_SUCCEED',
   'LOAD_VEHICLES', 'LOAD_VEHICLES_FAIL', 'LOAD_VEHICLES_SUCCEED',
   'DO_DISPATCH', 'DO_DISPATCH_FAIL', 'DO_DISPATCH_SUCCEED',
   'DO_SEND', 'DO_SEND_FAIL', 'DO_SEND_SUCCEED',
   'DO_RETURN', 'DO_RETURN_FAIL', 'DO_RETURN_SUCCEED',
   'LOAD_SEGMENT_RQ', 'LOAD_SEGMENT_RQ_FAIL', 'LOAD_SEGMENT_RQ_SUCCEED',
   'SEGMENT', 'SEGMENT_SUCCEED', 'SEGMENT_FAIL',
   'LOAD_EXPANDLIST', 'LOAD_EXPANDLIST_FAIL', 'LOAD_EXPANDLIST_SUCCEED',
   'SEGMENT_CANCEL', 'SEGMENT_CANCEL_SUCCEED', 'SEGMENT_CANCEL_FAIL']);

const initialState = {
  loaded: false,
  loading: false,
  filters: {
    status: 'waiting',
    segmented: 0,
    merged: 0,
    origin: 0
  },
  shipmentlist: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: [],
  },
  expandList: {},
  lsps: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: []
  },
  vehicles: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: []
  },
  lspLoaded: false,
  vehicleLoaded: false,
  dispatched: false,
  segmented: false,
  dispDockShow: false,
  segDockShow: false,
  nodeLocations: [],
  transitModes: []
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_APTSHIPMENT:
      return { ...state, loading: true, dispatched: false};
    case actionTypes.LOAD_APTSHIPMENT_FAIL:
      return { ...state, loading: false, dispatched: false };
    case actionTypes.LOAD_APTSHIPMENT_SUCCEED:
      return { ...state, loading: false,
        loaded: true, shipmentlist: action.result.data,
        filters: JSON.parse(action.params.filters),
        dispatched: false,
        segmented: false,
        lspLoaded: false,
        vehicleLoaded: false
      };
    case actionTypes.LOAD_LSPS_SUCCEED:
      return { ...state, lsps: action.result.data, lspLoaded: true};
    case actionTypes.LOAD_VEHICLES_SUCCEED:
      return { ...state, vehicles: action.result.data, vehicleLoaded: true};
    case actionTypes.DO_DISPATCH_SUCCEED:
      return { ...state, dispatched: true};
    case actionTypes.LOAD_SEGMENT_RQ_SUCCEED:
      return { ...state, nodeLocations: action.result.data.nodeLocations,
      transitModes: action.result.data.transitModes};
    case actionTypes.SEGMENT_SUCCEED:
      return { ...state, segmented: true};
    case actionTypes.LOAD_EXPANDLIST_SUCCEED: {
      const expandList = { ...state.expandList };
      expandList[action.params.shipmtNo] = action.result.data;
      return { ...state, expandList };
    }
    default:
      return state;
  }
}

export function loadTable(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_APTSHIPMENT,
        actionTypes.LOAD_APTSHIPMENT_SUCCEED,
        actionTypes.LOAD_APTSHIPMENT_FAIL,
      ],
      endpoint: 'v1/transport/dispatch/shipmts',
      method: 'get',
      params,
      cookie
    }
  };
}

export function loadLsps(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_LSPS,
        actionTypes.LOAD_LSPS_SUCCEED,
        actionTypes.LOAD_LSPS_FAIL,
      ],
      endpoint: 'v1/transport/dispatch/lsps',
      method: 'get',
      params,
      cookie
    }
  };
}

export function loadVehicles(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_VEHICLES,
        actionTypes.LOAD_VEHICLES_SUCCEED,
        actionTypes.LOAD_VEHICLES_FAIL,
      ],
      endpoint: 'v1/transport/dispatch/vehicles',
      method: 'get',
      params,
      cookie
    }
  };
}

export function doDispatch(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DO_DISPATCH,
        actionTypes.DO_DISPATCH_SUCCEED,
        actionTypes.DO_DISPATCH_FAIL,
      ],
      endpoint: 'v1/transport/dispatch',
      method: 'post',
      data: params,
      cookie
    }
  };
}

export function doSend(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DO_SEND,
        actionTypes.DO_SEND_SUCCEED,
        actionTypes.DO_SEND_FAIL,
      ],
      endpoint: 'v1/transport/dispatch/send',
      method: 'post',
      data: params,
      cookie
    }
  };
}

export function doReturn(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DO_RETURN,
        actionTypes.DO_RETURN_SUCCEED,
        actionTypes.DO_RETURN_FAIL,
      ],
      endpoint: 'v1/transport/dispatch/return',
      method: 'post',
      data: params,
      cookie
    }
  };
}

export function loadSegRq(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SEGMENT_RQ,
        actionTypes.LOAD_SEGMENT_RQ_SUCCEED,
        actionTypes.LOAD_SEGMENT_RQ_FAIL,
      ],
      endpoint: 'v1/transport/dispatch/segrequires',
      method: 'get',
      params,
      cookie
    }
  };
}

export function segmentRequest(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEGMENT,
        actionTypes.SEGMENT_SUCCEED,
        actionTypes.SEGMENT_FAIL,
      ],
      endpoint: 'v1/transport/dispatch/segment',
      method: 'post',
      data: params,
      cookie
    }
  };
}

export function segmentCancelRequest(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEGMENT_CANCEL,
        actionTypes.SEGMENT_CANCEL_SUCCEED,
        actionTypes.SEGMENT_CANCEL_FAIL,
      ],
      endpoint: 'v1/transport/dispatch/segment/cancel',
      method: 'post',
      data: params,
      cookie
    }
  };
}

export function segmentCancelCheckRequest(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEGMENT_CANCEL,
        actionTypes.SEGMENT_CANCEL_SUCCEED,
        actionTypes.SEGMENT_CANCEL_FAIL,
      ],
      endpoint: 'v1/transport/dispatch/segment/cancelcheck',
      method: 'post',
      data: params,
      cookie
    }
  };
}

export function loadExpandList(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_EXPANDLIST,
        actionTypes.LOAD_EXPANDLIST_SUCCEED,
        actionTypes.LOAD_EXPANDLIST_FAIL,
      ],
      endpoint: 'v1/transport/dispatch/expandlist',
      method: 'get',
      params,
      cookie
    }
  };
}
