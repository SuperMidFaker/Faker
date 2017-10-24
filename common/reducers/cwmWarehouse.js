import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/warehouse/', [
  'SHOW_WAREHOUSE_MODAL', 'HIDE_WAREHOUSE_MODAL',
  'ADD_WAREHOUSE', 'ADD_WAREHOUSE_SUCCEED', 'ADD_WAREHOUSE_FAIL',
  'EDIT_WAREHOUSE', 'EDIT_WAREHOUSE_SUCCEED', 'EDIT_WAREHOUSE_FAIL',
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
  'SHOW_ZONE_MODAL', 'HIDE_ZONE_MODAL', 'CLEAR_LOCATIONS',
  'CHNAGE_OWNER_STATUS', 'CHNAGE_OWNER_STATUS_SUCCEED', 'CHNAGE_OWNER_STATUS_FAIL',
  'DELETE_LOCATIONS', 'DELETE_LOCATIONS_SUCCEED', 'DELETE_LOCATIONS_FAIL',
  'SHOW_EDIT_WHSE', 'HIDE_EDIT_WHSE',
  'UPDATE_WHOWNCONTROL', 'UPDATE_WHOWNCONTROL_SUCCEED', 'UPDATE_WHOWNCONTROL_FAIL',
  'SHOW_STAFF_MODAL', 'HIDE_STAFF_MODAL',
  'ADD_STAFF', 'ADD_STAFF_SUCCEED', 'ADD_STAFF_FAIL',
  'LOAD_STAFFS', 'LOAD_STAFFS_SUCCEED', 'LOAD_STAFFS_FAIL',
  'CHNAGE_STAFF_STATUS', 'CHNAGE_STAFF_STATUS_SUCCEED', 'CHNAGE_STAFF_STATUS_FAIL',
  'DELETE_STAFF', 'DELETE_STAFF_SUCCEED', 'DELETE_STAFF_FAIL',
  'ADD_RECEIVER', 'ADD_RECEIVER_SUCCEED', 'ADD_RECEIVER_FAIL',
  'LOAD_RECEIVERS', 'LOAD_RECEIVERS_SUCCEED', 'LOAD_RECEIVERS_FAIL',
  'DELETE_RECEIVER', 'DELETE_RECEIVER_SUCCEED', 'DELETE_RECEIVER_FAIL',
  'UPDATE_RECEIVER', 'UPDATE_RECEIVER_SUCCEED', 'UPDATE_RECEIVER_FAIL',
  'TOGGLE_RECEIVER_MODAL',
  'UPDATE_RECEIVER_STATUS', 'UPDATE_RECEIVER_STATUS_SUCCEED', 'UPDATE_RECEIVER_STATUS_FAIL',
  'LOAD_SUPPLIERS', 'LOAD_SUPPLIERS_SUCCEED', 'LOAD_SUPPLIERS_FAIL',
  'TOGGLE_SUPPLIER_MODAL',
  'ADD_SUPPLIER', 'ADD_SUPPLIER_SUCCEED', 'ADD_SUPPLIER_FAIL',
  'UPDATE_SUPPLIER_STATUS', 'UPDATE_SUPPLIER_STATUS_SUCCEED', 'UPDATE_SUPPLIER_STATUS_FAIL',
  'DELETE_SUPPLIER', 'DELETE_SUPPLIER_SUCCEED', 'DELETE_SUPPLIER_FAIL',
  'UPDATE_SUPPLIER', 'UPDATE_SUPPLIER_SUCCEED', 'UPDATE_SUPPLIER_FAIL',
  'LOAD_CARRIERS', 'LOAD_CARRIERS_SUCCEED', 'LOAD_CARRIERS_FAIL',
  'TOGGLE_CARRIER_MODAL',
  'ADD_CARRIER', 'ADD_CARRIER_SUCCEED', 'ADD_CARRIER_FAIL',
  'UPDATE_CARRIER_STATUS', 'UPDATE_CARRIER_STATUS_SUCCEED', 'UPDATE_CARRIER_STATUS_FAIL',
  'DELETE_CARRIER', 'DELETE_CARRIER_SUCCEED', 'DELETE_CARRIER_FAIL',
  'UPDATE_CARRIER', 'UPDATE_CARRIER_SUCCEED', 'UPDATE_CARRIER_FAIL',
  'LOAD_BROKERS', 'LOAD_BROKERS_SUCCEED', 'LOAD_BROKERS_FAIL',
  'TOGGLE_BROKER_MODAL',
  'ADD_BROKER', 'ADD_BROKER_SUCCEED', 'ADD_BROKER_FAIL',
  'UPDATE_BROKER_STATUS', 'UPDATE_BROKER_STATUS_SUCCEED', 'UPDATE_BROKER_STATUS_FAIL',
  'DELETE_BROKER', 'DELETE_BROKER_SUCCEED', 'DELETE_BROKER_FAIL',
  'UPDATE_BROKER', 'UPDATE_BROKER_SUCCEED', 'UPDATE_BROKER_FAIL',
  'LOAD_CCBS', 'LOAD_CCBS_SUCCEED', 'LOAD_CCBS_FAIL',
  'LOAD_ADVICE_LOCATIONS', 'LOAD_ADVICE_LOCATIONS_SUCCEED', 'LOAD_ADVICE_LOCATIONS_FAIL',
  'AUTHORIZE_BROKER', 'AUTHORIZE_BROKER_SUCCEED', 'AUTHORIZE_BROKER_FAIL',
  'LOAD_BRKP', 'LOAD_BRKP_SUCCEED', 'LOAD_BRKP_FAIL',
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
    whOwnerAuth: {},
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
  editWarehouseModal: {
    visible: false,
    warehouse: {},
  },
  staffModal: {
    visible: false,
  },
  staffs: [],
  receivers: [],
  receiverModal: {
    visible: false,
    receiver: {},
  },
  suppliers: [],
  supplierModal: {
    visible: false,
    supplier: {},
  },
  carriers: [],
  carrierModal: {
    visible: false,
    carrier: {},
  },
  brokers: [],
  brokerModal: {
    visible: false,
    broker: {},
  },
  CCBs: [],
  brokerPartners: [],
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
      return { ...state, ownerControlModal: { ...state.ownerControlModal, visible: true, whOwnerAuth: action.data } };
    case actionTypes.HIDE_OWNER_CONTROL_MODAL:
      return { ...state, ownerControlModal: { ...state.ownerControlModal, visible: false } };
    case actionTypes.LOAD_WHSE_OWNERS_SUCCEED:
      return { ...state, whseOwners: action.result.data };
    case actionTypes.SHOW_ZONE_MODAL:
      return { ...state, zoneModal: { ...state.zoneModal, visible: true } };
    case actionTypes.HIDE_ZONE_MODAL:
      return { ...state, zoneModal: { ...state.zoneModal, visible: false } };
    case actionTypes.CLEAR_LOCATIONS:
      return { ...state, locations: [] };
    case actionTypes.SHOW_EDIT_WHSE:
      return { ...state, editWarehouseModal: { ...state.editWarehouseModal, ...action.data, visible: true } };
    case actionTypes.HIDE_EDIT_WHSE:
      return { ...state, editWarehouseModal: { ...state.editWarehouseModal, visible: false } };
    case actionTypes.SHOW_STAFF_MODAL:
      return { ...state, staffModal: { visible: true } };
    case actionTypes.HIDE_STAFF_MODAL:
      return { ...state, staffModal: { visible: false } };
    case actionTypes.LOAD_STAFFS_SUCCEED:
      return { ...state, staffs: action.result.data };
    case actionTypes.TOGGLE_RECEIVER_MODAL:
      return { ...state, receiverModal: { ...state.receiverModal, ...action.data } };
    case actionTypes.LOAD_RECEIVERS_SUCCEED:
      return { ...state, receivers: action.result.data };
    case actionTypes.LOAD_SUPPLIERS_SUCCEED:
      return { ...state, suppliers: action.result.data };
    case actionTypes.TOGGLE_SUPPLIER_MODAL:
      return { ...state, supplierModal: { ...state.supplierModal, ...action.data } };
    case actionTypes.LOAD_CARRIERS_SUCCEED:
      return { ...state, carriers: action.result.data };
    case actionTypes.TOGGLE_CARRIER_MODAL:
      return { ...state, carrierModal: { ...state.carrierModal, ...action.data } };
    case actionTypes.LOAD_BROKERS_SUCCEED:
      return { ...state, brokers: action.result.data };
    case actionTypes.TOGGLE_BROKER_MODAL:
      return { ...state, brokerModal: { ...state.brokerModal, ...action.data } };
    case actionTypes.LOAD_CCBS_SUCCEED:
      return { ...state, CCBs: action.result.data };
    case actionTypes.LOAD_BRKP_SUCCEED:
      return { ...state, brokerPartners: action.result.data };
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

export function editWarehouse(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_WAREHOUSE,
        actionTypes.EDIT_WAREHOUSE_SUCCEED,
        actionTypes.EDIT_WAREHOUSE_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/edit',
      method: 'post',
      data,
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

export function loadZones(whseCode, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ZONE,
        actionTypes.LOAD_ZONE_SUCCEED,
        actionTypes.LOAD_ZONE_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/zone/load',
      method: 'get',
      params: { whseCode, tenantId },
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

export function loadLocations(whseCode, zoneCode, tenantId, text) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_LOCATIONS,
        actionTypes.LOAD_LOCATIONS_SUCCEED,
        actionTypes.LOAD_LOCATIONS_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/location/load',
      method: 'get',
      params: { whseCode, zoneCode, tenantId, text },
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

export function deleteZone(whseCode, zoneCode, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_ZONE,
        actionTypes.DELETE_ZONE_SUCCEED,
        actionTypes.DELETE_ZONE_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/zone/delete',
      method: 'get',
      params: { whseCode, zoneCode, tenantId },
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

export function showOwnerControlModal(owner) {
  return {
    type: actionTypes.SHOW_OWNER_CONTROL_MODAL,
    data: owner,
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

export function changeOwnerStatus(id, status) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CHNAGE_OWNER_STATUS,
        actionTypes.CHNAGE_OWNER_STATUS_SUCCEED,
        actionTypes.CHNAGE_OWNER_STATUS_FAIL,
      ],
      endpoint: 'v1/cwm/change/owner/status',
      method: 'post',
      data: { id, status },
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

export function clearLocations() {
  return {
    type: actionTypes.CLEAR_LOCATIONS,
  };
}

export function showEditWhseModal(warehouse) {
  return {
    type: actionTypes.SHOW_EDIT_WHSE,
    data: { warehouse },
  };
}

export function hideEditWhseModal() {
  return {
    type: actionTypes.HIDE_EDIT_WHSE,
  };
}

export function updateWhOwnerControl(whauth, control, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_WHOWNCONTROL,
        actionTypes.UPDATE_WHOWNCONTROL_SUCCEED,
        actionTypes.UPDATE_WHOWNCONTROL_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/owner/control',
      method: 'post',
      data: { whauth, control, loginId },
    },
  };
}

export function showStaffModal() {
  return {
    type: actionTypes.SHOW_STAFF_MODAL,
  };
}

export function hideStaffModal() {
  return {
    type: actionTypes.HIDE_STAFF_MODAL,
  };
}

export function addStaff(whseCode, tenantId, staffs, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_STAFF,
        actionTypes.ADD_STAFF_SUCCEED,
        actionTypes.ADD_STAFF_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/add/staffs',
      method: 'post',
      data: { whseCode, tenantId, staffs, loginId },
    },
  };
}

export function loadStaffs(whseCode, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_STAFFS,
        actionTypes.LOAD_STAFFS_SUCCEED,
        actionTypes.LOAD_STAFFS_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/load/staffs',
      method: 'get',
      params: { whseCode, tenantId },
    },
  };
}

export function changeStaffStatus(status, id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CHNAGE_STAFF_STATUS,
        actionTypes.CHNAGE_STAFF_STATUS_SUCCEED,
        actionTypes.CHNAGE_STAFF_STATUS_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/change/staff/status',
      method: 'post',
      data: { status, id },
    },
  };
}

export function deleteStaff(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_STAFF,
        actionTypes.DELETE_STAFF_SUCCEED,
        actionTypes.DELETE_STAFF_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/delete/staff',
      method: 'post',
      data: { id },
    },
  };
}

export function addReceiver(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_RECEIVER,
        actionTypes.ADD_RECEIVER_SUCCEED,
        actionTypes.ADD_RECEIVER_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/receiver/add',
      method: 'post',
      data,
    },
  };
}

export function loadReceivers(whseCode, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_RECEIVERS,
        actionTypes.LOAD_RECEIVERS_SUCCEED,
        actionTypes.LOAD_RECEIVERS_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/receiver/load',
      method: 'get',
      params: { whseCode, tenantId },
    },
  };
}

export function deleteReceiver(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_RECEIVER,
        actionTypes.DELETE_RECEIVER_SUCCEED,
        actionTypes.DELETE_RECEIVER_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/receiver/delete',
      method: 'post',
      data: { id },
    },
  };
}

export function updateReceiver(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_RECEIVER,
        actionTypes.UPDATE_RECEIVER_SUCCEED,
        actionTypes.UPDATE_RECEIVER_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/receiver/update',
      method: 'post',
      data,
    },
  };
}

export function toggleReceiverModal(visible, receiver = {}) {
  return {
    type: actionTypes.TOGGLE_RECEIVER_MODAL,
    data: { visible, receiver },
  };
}

export function changeReceiverStatus(id, status, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_RECEIVER_STATUS,
        actionTypes.UPDATE_RECEIVER_STATUS_SUCCEED,
        actionTypes.UPDATE_RECEIVER_STATUS_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/receiver/status/update',
      method: 'post',
      data: { id, status, loginId },
    },
  };
}

export function loadSuppliers(whseCode, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SUPPLIERS,
        actionTypes.LOAD_SUPPLIERS_SUCCEED,
        actionTypes.LOAD_SUPPLIERS_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/suppliers/load',
      method: 'get',
      params: { whseCode, tenantId },
    },
  };
}

export function toggleSupplierModal(visible, supplier = {}) {
  return {
    type: actionTypes.TOGGLE_SUPPLIER_MODAL,
    data: { visible, supplier },
  };
}

export function addSupplier(data, tenantId, whseCode, loginId, ownerTenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_SUPPLIER,
        actionTypes.ADD_SUPPLIER_SUCCEED,
        actionTypes.ADD_SUPPLIER_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/supplier/add',
      method: 'post',
      data: { data, tenantId, whseCode, loginId, ownerTenantId },
    },
  };
}

export function changeSupplierStatus(id, status, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_SUPPLIER_STATUS,
        actionTypes.UPDATE_SUPPLIER_STATUS_SUCCEED,
        actionTypes.UPDATE_SUPPLIER_STATUS_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/supplier/status/update',
      method: 'post',
      data: { id, status, loginId },
    },
  };
}

export function deleteSupplier(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_SUPPLIER,
        actionTypes.DELETE_SUPPLIER_SUCCEED,
        actionTypes.DELETE_SUPPLIER_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/supplier/delete',
      method: 'post',
      data: { id },
    },
  };
}

export function updateSupplier(data, id, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_SUPPLIER,
        actionTypes.UPDATE_SUPPLIER_SUCCEED,
        actionTypes.UPDATE_SUPPLIER_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/supplier/update',
      method: 'post',
      data: { data, id, loginId },
    },
  };
}

export function loadCarriers(whseCode, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CARRIERS,
        actionTypes.LOAD_CARRIERS_SUCCEED,
        actionTypes.LOAD_CARRIERS_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/carriers/load',
      method: 'get',
      params: { whseCode, tenantId },
    },
  };
}

export function toggleCarrierModal(visible, carrier = {}) {
  return {
    type: actionTypes.TOGGLE_CARRIER_MODAL,
    data: { visible, carrier },
  };
}

export function addCarrier(data, tenantId, whseCode, loginId, ownerTenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_CARRIER,
        actionTypes.ADD_CARRIER_SUCCEED,
        actionTypes.ADD_CARRIER_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/carrier/add',
      method: 'post',
      data: { data, tenantId, whseCode, loginId, ownerTenantId },
    },
  };
}

export function changeCarrierStatus(id, status, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_CARRIER_STATUS,
        actionTypes.UPDATE_CARRIER_STATUS_SUCCEED,
        actionTypes.UPDATE_CARRIER_STATUS_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/carrier/status/update',
      method: 'post',
      data: { id, status, loginId },
    },
  };
}

export function deleteCarrier(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_CARRIER,
        actionTypes.DELETE_CARRIER_SUCCEED,
        actionTypes.DELETE_CARRIER_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/carrier/delete',
      method: 'post',
      data: { id },
    },
  };
}

export function updateCarrier(data, id, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_CARRIER,
        actionTypes.UPDATE_CARRIER_SUCCEED,
        actionTypes.UPDATE_CARRIER_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/carrier/update',
      method: 'post',
      data: { data, id, loginId },
    },
  };
}

export function loadBrokers(whseCode, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BROKERS,
        actionTypes.LOAD_BROKERS_SUCCEED,
        actionTypes.LOAD_BROKERS_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/brokers/load',
      method: 'get',
      params: { whseCode, tenantId },
    },
  };
}

export function toggleBrokerModal(visible, broker = {}) {
  return {
    type: actionTypes.TOGGLE_BROKER_MODAL,
    data: { visible, broker },
  };
}

export function addBroker(data, tenantId, whseCode, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_BROKER,
        actionTypes.ADD_BROKER_SUCCEED,
        actionTypes.ADD_BROKER_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/broker/add',
      method: 'post',
      data: { data, tenantId, whseCode, loginId },
    },
  };
}

export function changeBrokerStatus(id, status, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_BROKER_STATUS,
        actionTypes.UPDATE_BROKER_STATUS_SUCCEED,
        actionTypes.UPDATE_BROKER_STATUS_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/broker/status/update',
      method: 'post',
      data: { id, status, loginId },
    },
  };
}

export function deleteBroker(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_BROKER,
        actionTypes.DELETE_BROKER_SUCCEED,
        actionTypes.DELETE_BROKER_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/broker/delete',
      method: 'post',
      data: { id },
    },
  };
}

export function updateBroker(data, id, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_BROKER,
        actionTypes.UPDATE_BROKER_SUCCEED,
        actionTypes.UPDATE_BROKER_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/broker/update',
      method: 'post',
      data: { data, id, loginId },
    },
  };
}

export function loadCCBs(tenantId, role, businessType, business) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CCBS,
        actionTypes.LOAD_CCBS_SUCCEED,
        actionTypes.LOAD_CCBS_FAIL,
      ],
      endpoint: 'v1/cwm/ccbs/load',
      method: 'get',
      params: { tenantId, role, businessType, business },
    },
  };
}

export function loadBrokerPartners(tenantId, role, businessType, business) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BRKP,
        actionTypes.LOAD_BRKP_SUCCEED,
        actionTypes.LOAD_BRKP_FAIL,
      ],
      endpoint: 'v1/cooperation/partners',
      method: 'get',
      params: { tenantId, role, businessType, business },
    },
  };
}

export function loadAdviceLocations(productNo, tenantId, whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ADVICE_LOCATIONS,
        actionTypes.LOAD_ADVICE_LOCATIONS_SUCCEED,
        actionTypes.LOAD_ADVICE_LOCATIONS_FAIL,
      ],
      endpoint: 'v1/cwm/get/advice/locations',
      method: 'get',
      params: { productNo, tenantId, whseCode },
    },
  };
}

export function authorizeBroker(whseCode, ownerTenantId, partnerId, name, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.AUTHORIZE_BROKER,
        actionTypes.AUTHORIZE_BROKER_SUCCEED,
        actionTypes.AUTHORIZE_BROKER_FAIL,
      ],
      endpoint: 'v1/cwm/authorize/broker',
      method: 'post',
      data: { whseCode, ownerTenantId, partnerId, name, loginId },
    },
  };
}
