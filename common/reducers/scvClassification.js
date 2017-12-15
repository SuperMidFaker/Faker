import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scv/classification/', [
  'LOAD_TRADE_ITEMS', 'LOAD_TRADE_ITEMS_SUCCEED', 'LOAD_TRADE_ITEMS_FAIL',
  'LOAD_CONFLICT_ITEMS', 'LOAD_CONFLICT_ITEMS_SUCCEED', 'LOAD_CONFLICT_ITEMS_FAIL',
  'ADD_ITEM', 'ADD_ITEM_SUCCEED', 'ADD_ITEM_FAIL',
  'DELETE_ITEMS', 'DELETE_ITEMS_SUCCEED', 'DELETE_ITEMS_FAIL',
  'SET_ITEM_STATUS', 'SET_ITEM_STATUS_SUCCEED', 'SET_ITEM_STATUS_FAIL',
  'LOAD_TRADE_ITEM', 'LOAD_TRADE_ITEM_SUCCEED', 'LOAD_TRADE_ITEM_FAIL',
  'LOAD_SYNCS', 'LOAD_SYNCS_SUCCEED', 'LOAD_SYNCS_FAIL',
  'LOAD_REPOSLAVE', 'LOAD_REPOSLAVE_SUCCEED', 'LOAD_REPOSLAVE_FAIL',
  'LOAD_CLASBROKERS', 'LOAD_CLASBROKERS_SUCCEED', 'LOAD_CLASBROKERS_FAIL',
  'UPDATE_AUDIT', 'UPDATE_AUDIT_SUCCEED', 'UPDATE_AUDIT_FAIL',
  'RENEW_SHAREE', 'RENEW_SHAREE_SUCCEED', 'RENEW_SHAREE_FAIL',
  'SET_COMPARE_VISIBLE', 'SET_NOMINATED_VISIBLE',
  'COMPARED_DATAS_SAVE', 'COMPARED_DATAS_SAVE_SUCCEED', 'COMPARED_DATAS_SAVE_FAIL',
  'LOAD_MASTERCONF', 'LOAD_MASTERCONF_SUCCEED', 'LOAD_MASTERCONF_FAIL',
  'NOMINATED_IMPORT', 'NOMINATED_IMPORT_SUCCEED', 'NOMINATED_IMPORT_FAIL',
  'ITEM_EDITED_SAVE', 'ITEM_EDITED_SAVE_SUCCEED', 'ITEM_EDITED_SAVE_FAIL',
  'SET_STANDARD_ITEM', 'SET_STANDARD_ITEM_SUCCEED', 'SET_STANDARD_ITEM_FAIL',
  'GET_AUDIT_WAY', 'GET_AUDIT_WAY_SUCCEED', 'GET_AUDIT_WAY_FAIL',
  'OPEN_ADD_SLAVE_MODAL', 'CLOSE_ADD_SLAVE_MODAL',
  'LOAD_SLAVES', 'LOAD_SLAVES_SUCCEED', 'LOAD_SLAVES_FAIL',
  'ADD_SLAVES', 'ADD_SLAVES_SUCCEED', 'ADD_SLAVES_FAIL',
]);

const initialState = {
  reload: false,
  tradeItemSaving: false,
  tradeItemlist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    searchText: '',
    data: [],
  },
  conflictItemlist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    searchText: '',
    data: [],
  },
  listFilter: {
    status: 'pending',
  },
  tradeItemsLoading: false,
  visibleCompareModal: false,
  visibleNominatedModal: false,
  itemData: {},
  synclist: [],
  master: {
    sharees: [],
  },
  slaves: [],
  compareduuid: '',
  auditWay: '',
  addSlaveModal: {
    visible: false,
  },
  slavesLoading: false,
  slaveList: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_TRADE_ITEMS:
      return { ...state, tradeItemsLoading: true, itemData: initialState.itemData };
    case actionTypes.LOAD_TRADE_ITEMS_SUCCEED:
      return {
        ...state, tradeItemlist: action.result.data, listFilter: JSON.parse(action.params.filter), tradeItemsLoading: false,
      };
    case actionTypes.LOAD_TRADE_ITEMS_FAIL:
      return { ...state, tradeItemsLoading: false };
    case actionTypes.LOAD_CONFLICT_ITEMS:
      return { ...state, tradeItemsLoading: true };
    case actionTypes.LOAD_CONFLICT_ITEMS_SUCCEED:
      return {
        ...state, conflictItemlist: action.result.data, listFilter: JSON.parse(action.params.filter), tradeItemsLoading: false,
      };
    case actionTypes.LOAD_CONFLICT_ITEMS_FAIL:
      return { ...state, tradeItemsLoading: false };
    case actionTypes.ADD_ITEM:
    case actionTypes.ITEM_EDITED_SAVE:
      return { ...state, tradeItemSaving: true };
    case actionTypes.ADD_ITEM_SUCCEED:
    case actionTypes.ADD_ITEM_FAIL:
    case actionTypes.ITEM_EDITED_SAVE_SUCCEED:
    case actionTypes.ITEM_EDITED_SAVE_FAIL:
      return { ...state, tradeItemSaving: false };
    case actionTypes.LOAD_TRADE_ITEM_SUCCEED:
      return { ...state, itemData: action.result.data.tradeitem };
    case actionTypes.LOAD_SYNCS_SUCCEED:
      return { ...state, synclist: action.result.data };
    case actionTypes.LOAD_REPOSLAVE_SUCCEED:
      return { ...state, slaves: action.result.data };
    case actionTypes.SET_COMPARE_VISIBLE:
      return { ...state, visibleCompareModal: action.data };
    case actionTypes.SET_NOMINATED_VISIBLE:
      return { ...state, visibleNominatedModal: action.data };
    case actionTypes.NOMINATED_IMPORT_SUCCEED:
      return { ...state, compareduuid: action.result.data };
    case actionTypes.GET_AUDIT_WAY_SUCCEED:
      return { ...state, auditWay: action.result.data };
    case actionTypes.OPEN_ADD_SLAVE_MODAL:
      return { ...state, addSlaveModal: { visible: true } };
    case actionTypes.CLOSE_ADD_SLAVE_MODAL:
      return { ...state, addSlaveModal: { visible: false } };
    case actionTypes.LOAD_SLAVES:
      return { ...state, slavesLoading: true };
    case actionTypes.LOAD_SLAVES_SUCCEED:
      return { ...state, slaveList: action.result.data };
    case actionTypes.LOAD_SLAVES_FAIL:
      return { ...state, slavesLoading: false };
    case actionTypes.ADD_SLAVES_SUCCEED:
      return { ...state, reload: true };
    default:
      return state;
  }
}

export function loadTradeItems(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRADE_ITEMS,
        actionTypes.LOAD_TRADE_ITEMS_SUCCEED,
        actionTypes.LOAD_TRADE_ITEMS_FAIL,
      ],
      endpoint: 'v1/scv/tradeitem/items/load',
      method: 'get',
      params,
    },
  };
}

export function loadConflictItems(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CONFLICT_ITEMS,
        actionTypes.LOAD_CONFLICT_ITEMS_SUCCEED,
        actionTypes.LOAD_CONFLICT_ITEMS_FAIL,
      ],
      endpoint: 'v1/scv/tradeitem/items/conflicted/load',
      method: 'get',
      params,
    },
  };
}

export function addItem(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_ITEM,
        actionTypes.ADD_ITEM_SUCCEED,
        actionTypes.ADD_ITEM_FAIL,
      ],
      endpoint: 'v1/scv/tradeitem/item/add',
      method: 'post',
      data: datas,
    },
  };
}

export function itemEditedSave(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ITEM_EDITED_SAVE,
        actionTypes.ITEM_EDITED_SAVE_SUCCEED,
        actionTypes.ITEM_EDITED_SAVE_FAIL,
      ],
      endpoint: 'v1/scv/tradeitem/update',
      method: 'post',
      data: datas,
    },
  };
}

export function deleteItems(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_ITEMS,
        actionTypes.DELETE_ITEMS_SUCCEED,
        actionTypes.DELETE_ITEMS_FAIL,
      ],
      endpoint: 'v1/scv/tradeitem/delete/items',
      method: 'post',
      data,
    },
  };
}

export function setItemStatus(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SET_ITEM_STATUS,
        actionTypes.SET_ITEM_STATUS_SUCCEED,
        actionTypes.SET_ITEM_STATUS_FAIL,
      ],
      endpoint: 'v1/scv/tradeitem/status/set',
      method: 'post',
      data: datas,
    },
  };
}

export function loadScvTradeItem(itemId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRADE_ITEM,
        actionTypes.LOAD_TRADE_ITEM_SUCCEED,
        actionTypes.LOAD_TRADE_ITEM_FAIL,
      ],
      endpoint: 'v1/scv/tradeitem/editItem/load',
      method: 'get',
      params: { itemId },
    },
  };
}

export function loadSyncList(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SYNCS,
        actionTypes.LOAD_SYNCS_SUCCEED,
        actionTypes.LOAD_SYNCS_FAIL,
      ],
      endpoint: 'v1/scv/classification/slave/config',
      method: 'get',
      params,
    },
  };
}

export function loadRepoSlaves(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_REPOSLAVE,
        actionTypes.LOAD_REPOSLAVE_SUCCEED,
        actionTypes.LOAD_REPOSLAVE_FAIL,
      ],
      endpoint: 'v1/scv/classification/repo/slaves',
      method: 'get',
      params: { master: tenantId },
    },
  };
}

export function loadClassificatonBrokers(tenantId, role, businessType) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CLASBROKERS,
        actionTypes.LOAD_CLASBROKERS_SUCCEED,
        actionTypes.LOAD_CLASBROKERS_FAIL,
      ],
      endpoint: 'v1/cooperation/partners',
      method: 'get',
      params: { tenantId, role, businessType },
    },
  };
}

export function updateAudit(syncId, audit) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_AUDIT,
        actionTypes.UPDATE_AUDIT_SUCCEED,
        actionTypes.UPDATE_AUDIT_FAIL,
      ],
      endpoint: 'v1/scv/classification/sync/audit',
      method: 'post',
      data: { syncId, audit },
    },
  };
}

export function renewSharees(masterTenantId, contribute, sharees) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RENEW_SHAREE,
        actionTypes.RENEW_SHAREE_SUCCEED,
        actionTypes.RENEW_SHAREE_FAIL,
      ],
      endpoint: 'v1/scv/classification/sync/update/sharees',
      method: 'post',
      data: { tenantId: masterTenantId, contribute, sharees },
    },
  };
}


export function loadMasterConfig({ tenantId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_MASTERCONF,
        actionTypes.LOAD_MASTERCONF_SUCCEED,
        actionTypes.LOAD_MASTERCONF_FAIL,
      ],
      endpoint: 'v1/scv/classification/master/config',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function setCompareVisible(val) {
  return {
    type: actionTypes.SET_COMPARE_VISIBLE,
    data: val,
  };
}

export function setNominatedVisible(val) {
  return {
    type: actionTypes.SET_NOMINATED_VISIBLE,
    data: val,
  };
}

export function saveComparedItemDatas(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.COMPARED_DATAS_SAVE,
        actionTypes.COMPARED_DATAS_SAVE_SUCCEED,
        actionTypes.COMPARED_DATAS_SAVE_FAIL,
      ],
      endpoint: 'v1/scv/tradeitem/compared/datas/save',
      method: 'post',
      data: datas,
    },
  };
}

export function nominatedImport(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.NOMINATED_IMPORT,
        actionTypes.NOMINATED_IMPORT_SUCCEED,
        actionTypes.NOMINATED_IMPORT_FAIL,
      ],
      endpoint: 'v1/scv/tradeitems/compared/import',
      method: 'post',
      data: datas,
    },
  };
}

export function getAuditWay(brokerTenantId, masterTenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GET_AUDIT_WAY,
        actionTypes.GET_AUDIT_WAY_SUCCEED,
        actionTypes.GET_AUDIT_WAY_FAIL,
      ],
      endpoint: 'v1/scv/classification/sync/auditway',
      method: 'get',
      params: {
        masterTenantId,
        brokerTenantId,
      },
    },
  };
}

export function setStandardItem(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SET_STANDARD_ITEM,
        actionTypes.SET_STANDARD_ITEM_SUCCEED,
        actionTypes.SET_STANDARD_ITEM_FAIL,
      ],
      endpoint: 'v1/scv/tradeitems/set/standard',
      method: 'post',
      data: datas,
    },
  };
}

export function openAddSlaveModal() {
  return {
    type: actionTypes.OPEN_ADD_SLAVE_MODAL,
  };
}

export function closeAddSlaveModal() {
  return {
    type: actionTypes.CLOSE_ADD_SLAVE_MODAL,
  };
}

export function getSlaves(tenantId, role, businessType) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SLAVES,
        actionTypes.LOAD_SLAVES_SUCCEED,
        actionTypes.LOAD_SLAVES_FAIL,
      ],
      endpoint: 'v1/scv/classification/slaves/load',
      method: 'get',
      params: {
        tenantId,
        role,
        businessType,
      },
    },
  };
}

export function addSlaves(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_SLAVES,
        actionTypes.ADD_SLAVES_SUCCEED,
        actionTypes.ADD_SLAVES_FAIL,
      ],
      endpoint: 'v1/scv/classification/slave/add',
      method: 'post',
      data,
    },
  };
}
