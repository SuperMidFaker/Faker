import { CLIENT_API } from 'reusable/redux-middlewares/api';
import { createActionTypes } from 'reusable/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/dispatch/',
  ['LOAD_APTSHIPMENT', 'LOAD_APTSHIPMENT_FAIL', 'LOAD_APTSHIPMENT_SUCCEED',
   'LOAD_LSPS', 'LOAD_LSPS_FAIL', 'LOAD_LSPS_SUCCEED',
   'LOAD_VEHICLES', 'LOAD_VEHICLES_FAIL', 'LOAD_VEHICLES_SUCCEED']);

const initialState = {
  loaded: false,
  loading: false,
  filters: {
    status: 'waiting',
    type: 'subline',
    typeConsignorStep: 20,
    typeConsigneeStep: 20
  },
  shipmentlist: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: [],
  },
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
  dispatched: false
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_APTSHIPMENT:
      return { ...state, loading: true};
    case actionTypes.LOAD_APTSHIPMENT_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_APTSHIPMENT_SUCCEED:
      return { ...state, loading: false,
        loaded: true, shipmentlist: action.result.data,
        filters: JSON.parse(action.params.filters)};
    case actionTypes.LOAD_LSPS_SUCCEED:
      return { ...state, lsps: action.result.data};
    case actionTypes.LOAD_VEHICLES_SUCCEED:
      return { ...state, vehicles: action.result.data};
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
