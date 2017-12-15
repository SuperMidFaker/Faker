import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes(
  '@@welogix/transport/dispatch/',
  ['LOAD_DISPSHIPMENT', 'LOAD_DISPSHIPMENT_FAIL', 'LOAD_DISPSHIPMENT_SUCCEED',
    'LOAD_LSPS', 'LOAD_LSPS_FAIL', 'LOAD_LSPS_SUCCEED',
    'LOAD_VEHICLES', 'LOAD_VEHICLES_FAIL', 'LOAD_VEHICLES_SUCCEED',
    'DO_DISPATCH', 'DO_DISPATCH_FAIL', 'DO_DISPATCH_SUCCEED',
    'DO_SEND', 'DO_SEND_FAIL', 'DO_SEND_SUCCEED',
    'DO_DISPATCH_SEND', 'DO_DISPATCH_SEND_FAIL', 'DO_DISPATCH_SEND_SUCCEED',
    'DO_RETURN', 'DO_RETURN_FAIL', 'DO_RETURN_SUCCEED',
    'LOAD_SEGMENT_RQ', 'LOAD_SEGMENT_RQ_FAIL', 'LOAD_SEGMENT_RQ_SUCCEED',
    'SEGMENT', 'SEGMENT_SUCCEED', 'SEGMENT_FAIL',
    'LOAD_EXPANDLIST', 'LOAD_EXPANDLIST_FAIL', 'LOAD_EXPANDLIST_SUCCEED',
    'SEGMENT_CANCEL', 'SEGMENT_CANCEL_SUCCEED', 'SEGMENT_CANCEL_FAIL',
    'GROUPED_LIST', 'GROUPED_LIST_SUCCEED', 'GROUPED_LIST_FAIL',
    'WITHDRAW', 'WITHDRAW_FAIL', 'WITHDRAW_SUCCEED',
    'REMOVE_GROUPEDSUB', 'CHANGE_DOCK_STATUS',
    'SHOW_DISPATCH_CONFIRM_MODAL',
  ]
);

const initialState = {
  loaded: true,
  loading: false,
  filters: {
    status: 'waiting',
    segmented: 0,
    merged: 0,
    origin: 0,
  },
  cond: {
    type: 'none',
    consignerStep: 20,
    consigneeStep: 20,
  },
  shipmentlist: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
  },
  expandList: {},
  lsps: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
  },
  vehicles: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
  },
  lspLoaded: false,
  vehicleLoaded: false,
  dispatched: false,
  segmented: false,
  dispDockShow: false,
  segDockShow: false,
  shipmts: [],
  nodeLocations: [],
  transitModes: [],
  vehicleLengths: [],
  vehicleTypes: [],
  shipmt: {},
  dispatchConfirmModal: {
    type: '',
    target: {},
    visible: false,
  },
};
export const {
  LOAD_DISPSHIPMENT, DO_DISPATCH_SUCCEED, DO_DISPATCH_SEND_SUCCEED, SEGMENT_SUCCEED,
} = actionTypes;
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_DISPSHIPMENT:
      return { ...state, loading: true, dispatched: false };
    case actionTypes.LOAD_DISPSHIPMENT_FAIL:
      return { ...state, loading: false, dispatched: false };
    case actionTypes.LOAD_DISPSHIPMENT_SUCCEED: {
      const filters = JSON.parse(action.params.filters);
      return {
        ...state,
        loading: false,
        shipmentlist: action.result.data,
        filters,
        cond: { type: 'none' },
        dispatched: false,
        segmented: false,
        lspLoaded: false,
        vehicleLoaded: false,
        loaded: true,
      };
    }
    case actionTypes.LOAD_LSPS_SUCCEED:
      return { ...state, lsps: action.result.data, lspLoaded: true };
    case actionTypes.LOAD_VEHICLES_SUCCEED:
      return { ...state, vehicles: action.result.data, vehicleLoaded: true };
    case actionTypes.DO_DISPATCH_SUCCEED:
      return { ...state, dispatched: true, loaded: false };
    case actionTypes.LOAD_SEGMENT_RQ_SUCCEED:
      return {
        ...state,
        nodeLocations: action.result.data.nodeLocations,
        transitModes: action.result.data.transitModes,
        vehicleLengths: action.result.data.vehicleLengths,
        vehicleTypes: action.result.data.vehicleTypes,
      };
    case actionTypes.SEGMENT_SUCCEED:
      return { ...state, segmented: true };
    case actionTypes.LOAD_EXPANDLIST_SUCCEED: {
      const expandList = { ...state.expandList };
      expandList[action.params.shipmtNo] = action.result.data;
      return { ...state, expandList };
    }
    case actionTypes.GROUPED_LIST_SUCCEED: {
      const { shipmentlist } = { ...state };
      shipmentlist.data = action.result.data;
      shipmentlist.totalCount = shipmentlist.data.length;
      return {
        ...state,
        loading: false,
        loaded: true,
        shipmentlist,
        cond: JSON.parse(action.params.filters),
        dispatched: false,
        segmented: false,
        lspLoaded: false,
        vehicleLoaded: false,
      };
    }
    case actionTypes.REMOVE_GROUPEDSUB: {
      const { expandList } = { ...state };
      const keys = Object.keys(expandList);
      let idx = -1;
      let key = '';
      for (let i = 0; i < keys.length; i++) {
        key = keys[i];
        for (let j = 0; j < expandList[key].length; j++) {
          const val = expandList[key][j];
          if (val.shipmt_no === action.data.shipmtNo) {
            idx = i;
            break;
          }
        }
        if (idx > -1) {
          break;
        }
      }
      if (idx > -1) {
        expandList[key].splice(idx, 1);
      }
      return { ...state, expandList };
    }
    case actionTypes.CHANGE_DOCK_STATUS:
      return { ...state, ...action.data };
    case actionTypes.DO_SEND:
      return { ...state, loading: false };
    case actionTypes.DO_SEND_SUCCEED:
      return { ...state, loaded: false, filters: { ...state.filters, status: 'dispatching' } };
    case actionTypes.DO_RETURN_SUCCEED:
      return { ...state, loaded: false, filters: { ...state.filters, status: 'dispatching' } };
    case actionTypes.WITHDRAW_SUCCEED:
      return { ...state, loaded: false, filters: { ...state.filters, status: 'dispatching' } };
    case actionTypes.DO_DISPATCH_SEND:
      return { ...state, loading: false };
    case actionTypes.DO_DISPATCH_SEND_SUCCEED:
      return { ...state, loaded: false, filters: { ...state.filters, status: 'dispatched' } };
    case actionTypes.SHOW_DISPATCH_CONFIRM_MODAL:
      return { ...state, dispatchConfirmModal: action.data };
    default:
      return state;
  }
}

export function loadTable(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DISPSHIPMENT,
        actionTypes.LOAD_DISPSHIPMENT_SUCCEED,
        actionTypes.LOAD_DISPSHIPMENT_FAIL,
      ],
      endpoint: 'v1/transport/dispatch/shipmts',
      method: 'get',
      params,
      cookie,
    },
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
      cookie,
    },
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
      cookie,
    },
  };
}

export function doDispatch(params) {
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
    },
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
      cookie,
    },
  };
}

export function doDispatchAndSend(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DO_DISPATCH_SEND,
        actionTypes.DO_DISPATCH_SEND_SUCCEED,
        actionTypes.DO_DISPATCH_SEND_FAIL,
      ],
      endpoint: 'v1/transport/dispatch/dispatcnSend',
      method: 'post',
      data: params,
    },
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
      cookie,
    },
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
      cookie,
    },
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
      cookie,
    },
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
      cookie,
    },
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
      cookie,
    },
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
      cookie,
    },
  };
}

export function loadShipmtsGrouped(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GROUPED_LIST,
        actionTypes.GROUPED_LIST_SUCCEED,
        actionTypes.GROUPED_LIST_FAIL,
      ],
      endpoint: 'v1/transport/dispatch/shipmts/grouped',
      method: 'get',
      params,
      cookie,
    },
  };
}

export function loadShipmtsGroupedSub(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_EXPANDLIST,
        actionTypes.LOAD_EXPANDLIST_SUCCEED,
        actionTypes.LOAD_EXPANDLIST_FAIL,
      ],
      endpoint: 'v1/transport/dispatch/shipmts/groupedsub',
      method: 'get',
      params,
      cookie,
    },
  };
}

export function removeGroupedSubShipmt(key, shipmtNo) {
  return { type: actionTypes.REMOVE_GROUPEDSUB, data: { key, shipmtNo } };
}

export function changeDockStatus(params) {
  return {
    type: actionTypes.CHANGE_DOCK_STATUS,
    data: params,
  };
}

export function withDraw(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.WITHDRAW,
        actionTypes.WITHDRAW_SUCCEED,
        actionTypes.WITHDRAW_FAIL,
      ],
      endpoint: 'v1/transport/dispatch/withdraw',
      method: 'post',
      data: params,
    },
  };
}

export function showDispatchConfirmModal(visible, type, target) {
  return {
    type: actionTypes.SHOW_DISPATCH_CONFIRM_MODAL,
    data: { visible, type, target },
  };
}
