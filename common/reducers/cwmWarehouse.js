import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/warehouse/', [
  'SHOW_WAREHOUSE_MODAL', 'HIDE_WAREHOUSE_MODAL',
  'LOAD_WAREHOUSE', 'LOAD_WAREHOUSE_SUCCEED', 'LOAD_WAREHOUSE_FAIL',
  'ADD_WAREHOUSE', 'ADD_WAREHOUSE_SUCCEED', 'ADD_WAREHOUSE_FAIL',
  'ADD_ZONE', 'ADD_ZONE_SUCCEED', 'ADD_ZONE_FAIL',
  'LOAD_ZONE', 'LOAD_ZONE_SUCCEED', 'LOAD_ZONE_FAIL',
  'SHOW_LOCATION_MODAL', 'HIDE_LOCATION_MODAL',
  'ADD_LOCATION', 'ADD_LOCATION_SUCCEED', 'ADD_LOCATION_FAIL',
  'LOAD_LOCATIONS', 'LOAD_LOCATIONS_SUCCEED', 'LOAD_LOCATIONS_FAIL',
  'DELETE_LOCATIONS', 'DELETE_LOCATIONS_SUCCEED', 'DELETE_LOCATIONS_FAIL',
  'UPDATE_LOCATIONS', 'UPDATE_LOCATIONS_SUCCEED', 'UPDATE_LOCATIONS_FAIL',
  'DELETE_ZONE', 'DELETE_ZONE_SUCCEED', 'DELETE_ZONE_FAIL',
  'UPDATE_ZONE', 'UPDATE_ZONE_SUCCEED', 'UPDATE_ZONE_FAIL',
]);

const initialState = {
  warehouseModal: {
    visible: false,
  },
  warehouseList: [],
  zoneList: [],
  locationModal: {
    visible: false,
  },
  locations: [],
  record: {},
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.SHOW_WAREHOUSE_MODAL:
      return { ...state, warehouseModal: { ...state.warehouseModal, visible: true } };
    case actionTypes.HIDE_WAREHOUSE_MODAL:
      return { ...state, warehouseModal: { ...state.warehouseModal, visible: false } };
    case actionTypes.LOAD_WAREHOUSE_SUCCEED:
      return { ...state, warehouseList: action.result.data };
    case actionTypes.LOAD_ZONE_SUCCEED:
      return { ...state, zoneList: action.result.data };
    case actionTypes.SHOW_LOCATION_MODAL:
      return { ...state, locationModal: { ...state.locationModal, visible: true }, record: action.data ? action.data : {} };
    case actionTypes.HIDE_LOCATION_MODAL:
      return { ...state, locationModal: { ...state.locationModal, visible: false } };
    case actionTypes.LOAD_LOCATIONS_SUCCEED:
      return { ...state, locations: action.result.data };
    default:
      return state;
  }
}

export function showWarehouseModal() {
  return {
    type: actionTypes.SHOW_WAREHOUSE_MODAL,
  };
}

export function hideWarehouseModal() {
  return {
    type: actionTypes.HIDE_WAREHOUSE_MODAL,
  };
}

export function loadwhList(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_WAREHOUSE,
        actionTypes.LOAD_WAREHOUSE_SUCCEED,
        actionTypes.LOAD_WAREHOUSE_FAIL,
      ],
      endpoint: 'v1/cwm/warehouses/load',
      method: 'get',
      params,
    },
  };
}

export function addWarehouse(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_WAREHOUSE,
        actionTypes.ADD_WAREHOUSE_SUCCEED,
        actionTypes.ADD_WAREHOUSE_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/add',
      method: 'get',
      params,
    },
  };
}

export function addZone(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_ZONE,
        actionTypes.ADD_ZONE_SUCCEED,
        actionTypes.ADD_ZONE_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/zone/add',
      method: 'get',
      params,
    },
  };
}

export function loadZones(whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ZONE,
        actionTypes.LOAD_ZONE_SUCCEED,
        actionTypes.LOAD_ZONE_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/zone/load',
      method: 'get',
      params: { whseCode },
    },
  };
}

export function showLocationModal(row) {
  return {
    type: actionTypes.SHOW_LOCATION_MODAL,
    data: row,
  };
}

export function hideLocationModal() {
  return {
    type: actionTypes.HIDE_LOCATION_MODAL,
  };
}

export function addLocation(whseCode, zoneCode, location, type, status) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_LOCATION,
        actionTypes.ADD_LOCATION_SUCCEED,
        actionTypes.ADD_LOCATION_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/location/add',
      method: 'get',
      params: { whseCode, zoneCode, location, type, status },
    },
  };
}

export function loadLocations(whseCode, zoneCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_LOCATIONS,
        actionTypes.LOAD_LOCATIONS_SUCCEED,
        actionTypes.LOAD_LOCATIONS_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/location/load',
      method: 'get',
      params: { whseCode, zoneCode },
    },
  };
}

export function deleteLocation(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_LOCATIONS,
        actionTypes.DELETE_LOCATIONS_SUCCEED,
        actionTypes.DELETE_LOCATIONS_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/location/delete',
      method: 'get',
      params: { id },
    },
  };
}

export function updateLocation(type, status, location, id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_LOCATIONS,
        actionTypes.UPDATE_LOCATIONS_SUCCEED,
        actionTypes.UPDATE_LOCATIONS_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/location/update',
      method: 'get',
      params: { type, status, location, id },
    },
  };
}

export function deleteZone(whseCode, zoneCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_ZONE,
        actionTypes.DELETE_ZONE_SUCCEED,
        actionTypes.DELETE_ZONE_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/zone/delete',
      method: 'get',
      params: { whseCode, zoneCode },
    },
  };
}

export function updateZone(whseCode, zoneCode, id, zoneName) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_ZONE,
        actionTypes.UPDATE_ZONE_SUCCEED,
        actionTypes.UPDATE_ZONE_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/zone/update',
      method: 'get',
      params: { whseCode, zoneCode, id, zoneName },
    },
  };
}
