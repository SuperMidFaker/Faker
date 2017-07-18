import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/warehouse/', [
  'SHOW_WAREHOUSE_MODAL', 'HIDE_WAREHOUSE_MODAL',
  'ADD_WAREHOUSE', 'ADD_WAREHOUSE_SUCCEED', 'ADD_WAREHOUSE_FAIL',
  'UPDATE_WHSE', 'UPDATE_WHSE_SUCCEED', 'UPDATE_WHSE_FAIL',
  'ADD_ZONE', 'ADD_ZONE_SUCCEED', 'ADD_ZONE_FAIL',
  'LOAD_ZONE', 'LOAD_ZONE_SUCCEED', 'LOAD_ZONE_FAIL',
  'SHOW_LOCATION_MODAL', 'HIDE_LOCATION_MODAL',
  'ADD_LOCATION', 'ADD_LOCATION_SUCCEED', 'ADD_LOCATION_FAIL',
  'LOAD_LOCATIONS', 'LOAD_LOCATIONS_SUCCEED', 'LOAD_LOCATIONS_FAIL',
  'DELETE_LOCATIONS', 'DELETE_LOCATIONS_SUCCEED', 'DELETE_LOCATIONS_FAIL',
  'UPDATE_LOCATIONS', 'UPDATE_LOCATIONS_SUCCEED', 'UPDATE_LOCATIONS_FAIL',
  'DELETE_ZONE', 'DELETE_ZONE_SUCCEED', 'DELETE_ZONE_FAIL',
  'UPDATE_ZONE', 'UPDATE_ZONE_SUCCEED', 'UPDATE_ZONE_FAIL',
  'HIDE_WHSE_OWNERS_MODAL', 'SHOW_WHSE_OWNERS_MODAL',
  'LOAD_WHSE_OWNERS', 'LOAD_WHSE_OWNERS_SUCCEED', 'LOAD_WHSE_OWNERS_FAIL',
  'ADD_WHSE_OWNERS', 'ADD_WHSE_OWNERS_SUCCEED', 'ADD_WHSE_OWNERS_FAIL',
  'SHOW_OWNER_CONTROL_MODAL', 'HIDE_OWNER_CONTROL_MODAL',
  'SAVE_OWNER_CODE', 'SAVE_OWNER_CODE_SUCCEED', 'SAVE_OWNER_CODE_FAIL',
  'SHOW_ZONE_MODAL', 'HIDE_ZONE_MODAL',
  'FREEZE_LOCATION', 'FREEZE_LOCATION_SUCCEED', 'FREEZE_LOCATION_FAIL',
  'ACTIVE_LOCATION', 'ACTIVE_LOCATION_SUCCEED', 'ACTIVE_LOCATION_FAIL',
  'DELETE_LOCATIONS', 'DELETE_LOCATIONS_SUCCEED', 'DELETE_LOCATIONS_FAIL',
]);

const initialState = {
  warehouseModal: {
    visible: false,
  },
  locationModal: {
    visible: false,
  },
  whseOwnersModal: {
    visible: false,
  },
  ownerControlModal: {
    visible: false,
  },
  warehouseList: [],
  zoneList: [],
  locations: [],
  locationLoading: true,
  record: {},
  whseOwners: [],
  zoneModal: {
    visible: false,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.SHOW_WAREHOUSE_MODAL:
      return { ...state, warehouseModal: { ...state.warehouseModal, visible: true } };
    case actionTypes.HIDE_WAREHOUSE_MODAL:
      return { ...state, warehouseModal: { ...state.warehouseModal, visible: false } };
    case actionTypes.LOAD_ZONE:
      return { ...state, locationLoading: true };
    case actionTypes.LOAD_ZONE_SUCCEED:
      return { ...state, zoneList: action.result.data, locationLoading: false };
    case actionTypes.SHOW_LOCATION_MODAL:
      return { ...state, locationModal: { ...state.locationModal, visible: true }, record: action.data ? action.data : {} };
    case actionTypes.HIDE_LOCATION_MODAL:
      return { ...state, locationModal: { ...state.locationModal, visible: false } };
    case actionTypes.LOAD_LOCATIONS_SUCCEED:
      return { ...state, locations: action.result.data };
    case actionTypes.SHOW_WHSE_OWNERS_MODAL:
      return { ...state, whseOwnersModal: { ...state.whseOwnersModal, visible: true } };
    case actionTypes.HIDE_WHSE_OWNERS_MODAL:
      return { ...state, whseOwnersModal: { ...state.whseOwnersModal, visible: false } };
    case actionTypes.SHOW_OWNER_CONTROL_MODAL:
      return { ...state, ownerControlModal: { ...state.ownerControlModal, visible: true } };
    case actionTypes.HIDE_OWNER_CONTROL_MODAL:
      return { ...state, ownerControlModal: { ...state.ownerControlModal, visible: false } };
    case actionTypes.LOAD_WHSE_OWNERS_SUCCEED:
      return { ...state, whseOwners: action.result.data };
    case actionTypes.SHOW_ZONE_MODAL:
      return { ...state, zoneModal: { ...state.zoneModal, visible: true } };
    case actionTypes.HIDE_ZONE_MODAL:
      return { ...state, zoneModal: { ...state.zoneModal, visible: false } };
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

export function updateWhse(whse, whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_WHSE,
        actionTypes.UPDATE_WHSE_SUCCEED,
        actionTypes.UPDATE_WHSE_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/update',
      method: 'post',
      data: { whse, whse_code: whseCode },
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

export function addLocation(whseCode, zoneCode, location, type, status, tenantId, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_LOCATION,
        actionTypes.ADD_LOCATION_SUCCEED,
        actionTypes.ADD_LOCATION_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/location/add',
      method: 'get',
      params: { whseCode, zoneCode, location, type, status, tenantId, loginId },
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

export function updateLocation(type, status, location, id, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_LOCATIONS,
        actionTypes.UPDATE_LOCATIONS_SUCCEED,
        actionTypes.UPDATE_LOCATIONS_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/location/update',
      method: 'get',
      params: { type, status, location, id, loginId },
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

export function showWhseOwnersModal() {
  return {
    type: actionTypes.SHOW_WHSE_OWNERS_MODAL,
  };
}

export function hideWhseOwnersModal() {
  return {
    type: actionTypes.HIDE_WHSE_OWNERS_MODAL,
  };
}

export function showOwnerControlModal() {
  return {
    type: actionTypes.SHOW_OWNER_CONTROL_MODAL,
  };
}

export function hideOwnerControlModal() {
  return {
    type: actionTypes.HIDE_OWNER_CONTROL_MODAL,
  };
}

export function loadwhseOwners(whseCode, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_WHSE_OWNERS,
        actionTypes.LOAD_WHSE_OWNERS_SUCCEED,
        actionTypes.LOAD_WHSE_OWNERS_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/owners/load',
      method: 'get',
      params: { whseCode, tenantId },
    },
  };
}

export function addWhseOwners(data, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_WHSE_OWNERS,
        actionTypes.ADD_WHSE_OWNERS_SUCCEED,
        actionTypes.ADD_WHSE_OWNERS_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/owners/add',
      method: 'post',
      data: { owners: data, loginId },
    },
  };
}

export function saveOwnerCode(ownerCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_OWNER_CODE,
        actionTypes.SAVE_OWNER_CODE_SUCCEED,
        actionTypes.SAVE_OWNER_CODE_FAIL,
      ],
      endpoint: 'v1/cwm/owner/code/save',
      method: 'post',
      data: { ownerCode },
    },
  };
}

export function showZoneModal() {
  return {
    type: actionTypes.SHOW_ZONE_MODAL,
  };
}

export function hideZoneModal() {
  return {
    type: actionTypes.HIDE_ZONE_MODAL,
  };
}

export function freezeLocation(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.FREEZE_LOCATION,
        actionTypes.FREEZE_LOCATION_SUCCEED,
        actionTypes.FREEZE_LOCATION_FAIL,
      ],
      endpoint: 'v1/cwm/freeze/location',
      method: 'post',
      data: { id },
    },
  };
}

export function activeLocation(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ACTIVE_LOCATION,
        actionTypes.ACTIVE_LOCATION_SUCCEED,
        actionTypes.ACTIVE_LOCATION_FAIL,
      ],
      endpoint: 'v1/cwm/active/location',
      method: 'post',
      data: { id },
    },
  };
}

export function batchDeleteLocations(ids) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_LOCATIONS,
        actionTypes.DELETE_LOCATIONS_SUCCEED,
        actionTypes.DELETE_LOCATIONS_FAIL,
      ],
      endpoint: 'v1/cwm/delete/locations',
      method: 'post',
      data: { ids },
    },
  };
}
