import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scv/warehouse/', [
  'OPEN_ADD_WAREHOUSE_MODAL', 'CLOSE_ADD_WAREHOUSE_MODAL',
  'ADD_WAREHOUSE', 'ADD_WAREHOUSE_SUCCEED', 'ADD_WAREHOUSE_FAIL',
  'OPEN_WHSEAUTH_MODAL', 'CLOSE_WHSEAUTH_MODAL',
  'LOAD_WAREHOUSES', 'LOAD_WAREHOUSES_SUCCEED', 'LOAD_WAREHOUSES_FAIL',
  'LOAD_OWNERPARTNERS', 'LOAD_OWNERPARTNERS_SUCCEED', 'LOAD_OWNERPARTNERS_FAIL',
  'SAVE_WHSEAUTHS', 'SAVE_WHSEAUTHS_SUCCEED', 'SAVE_WHSEAUTHS_FAIL',
]);

const initialState = {
  loading: false,
  reload: false,
  list: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  listFilter: {
    status: 'all',
    shipment_no: '',
  },
  sortFilter: {
    sortField: '',
    sortOrder: '',
  },
  addWarehouseModal: {
    visible: false,
  },
  whseOwners: [],
  whseAuthModal: {
    warehouse: { auths: [] },
    visible: false,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_WAREHOUSES:
      return {
        ...state,
        listFilter: JSON.parse(action.params.filter),
        reload: false,
        sortFilter: JSON.parse(action.params.sorter),
        loading: true,
      };
    case actionTypes.LOAD_WAREHOUSES_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_WAREHOUSES_SUCCEED:
      return { ...state, list: action.result.data, loading: false };
    case actionTypes.LOAD_OWNERPARTNERS_SUCCEED:
      return { ...state, whseOwners: action.result.data };
    case actionTypes.OPEN_ADD_WAREHOUSE_MODAL:
      return { ...state, addWarehouseModal: { visible: true } };
    case actionTypes.CLOSE_ADD_WAREHOUSE_MODAL:
      return { ...state, addWarehouseModal: { visible: false } };
    case actionTypes.ADD_WAREHOUSE_SUCCEED:
      return { ...state, reload: true };
    case actionTypes.OPEN_WHSEAUTH_MODAL:
      return { ...state, whseAuthModal: { visible: true, warehouse: action.data } };
    case actionTypes.CLOSE_WHSEAUTH_MODAL:
      return { ...state, whseAuthModal: initialState.whseAuthModal };
    case actionTypes.SAVE_WHSEAUTHS_SUCCEED:
      return { ...state, reload: true, whseAuthModal: initialState.whseAuthModal };
    default:
      return state;
  }
}

export function loadWarehouses(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_WAREHOUSES,
        actionTypes.LOAD_WAREHOUSES_SUCCEED,
        actionTypes.LOAD_WAREHOUSES_FAIL,
      ],
      endpoint: 'v1/cwm/warehouses',
      method: 'get',
      params,
    },
  };
}

export function loadOwnerPartners(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_OWNERPARTNERS,
        actionTypes.LOAD_OWNERPARTNERS_SUCCEED,
        actionTypes.LOAD_OWNERPARTNERS_FAIL,
      ],
      endpoint: 'v1/cwm/partner/owners',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function openAddWarehouseModal() {
  return {
    type: actionTypes.OPEN_ADD_WAREHOUSE_MODAL,
  };
}

export function closeAddWarehouseModal() {
  return {
    type: actionTypes.CLOSE_ADD_WAREHOUSE_MODAL,
  };
}

export function openWhseAuthModal(warehouse) {
  return {
    type: actionTypes.OPEN_WHSEAUTH_MODAL,
    data: warehouse,
  };
}

export function closeWhseAuthModal() {
  return {
    type: actionTypes.CLOSE_WHSEAUTH_MODAL,
  };
}

export function saveWhseAuths(ownerChanges) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_WHSEAUTHS,
        actionTypes.SAVE_WHSEAUTHS_SUCCEED,
        actionTypes.SAVE_WHSEAUTHS_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/auths',
      method: 'post',
      data: ownerChanges,
    },
  };
}

export function addWarehouse(warehouse) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_WAREHOUSE,
        actionTypes.ADD_WAREHOUSE_SUCCEED,
        actionTypes.ADD_WAREHOUSE_FAIL,
      ],
      endpoint: 'v1/scv/inbound/create/shipment',
      method: 'post',
      data: warehouse,
      origin: 'scv',
    },
  };
}
