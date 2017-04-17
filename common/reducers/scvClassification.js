import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scv/classification/', [
  'LOAD_TRADE_ITEMS', 'LOAD_TRADE_ITEMS_SUCCEED', 'LOAD_TRADE_ITEMS_FAIL',
  'SET_ADD_ITEM_VISIBLE',
  'ADD_ITEM', 'ADD_ITEM_SUCCEED', 'ADD_ITEM_FAIL',
  'DELETE_ITEM', 'DELETE_ITEM_SUCCEED', 'DELETE_ITEM_FAIL',
  'DELETE_SELECT_ITEMS', 'DELETE_SELECT_ITEMS_SUCCEED', 'DELETE_SELECT_ITEMS_FAIL',
  'SET_ITEM_STATUS', 'SET_ITEM_STATUS_SUCCEED', 'SET_ITEM_STATUS_FAIL',
  'LOAD_TRADE_ITEM', 'LOAD_TRADE_ITEM_SUCCEED', 'LOAD_TRADE_ITEM_FAIL',
  'LOAD_SYNCS', 'LOAD_SYNCS_SUCCEED', 'LOAD_SYNCS_FAIL',
  'LOAD_CLASBROKERS', 'LOAD_CLASBROKERS_SUCCEED', 'LOAD_CLASBROKERS_FAIL',
  'UPDATE_AUDIT', 'UPDATE_AUDIT_SUCCEED', 'UPDATE_AUDIT_FAIL',
  'RENEW_SHAREE', 'RENEW_SHAREE_SUCCEED', 'RENEW_SHAREE_FAIL',
]);

const initialState = {
  tradeItemlist: {
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
  visibleAddItemModal: false,
  itemData: {},
  synclist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  shareBrokers: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_TRADE_ITEMS:
      return { ...state, tradeItemsLoading: true, itemData: initialState.itemData };
    case actionTypes.LOAD_TRADE_ITEMS_SUCCEED:
      return { ...state, tradeItemlist: action.result.data, listFilter: JSON.parse(action.params.filter), tradeItemsLoading: false };
    case actionTypes.LOAD_TRADE_ITEMS_FAIL:
      return { ...state, tradeItemsLoading: false };
    case actionTypes.SET_ADD_ITEM_VISIBLE:
      return { ...state, visibleAddItemModal: action.data };
    case actionTypes.LOAD_TRADE_ITEM_SUCCEED:
      return { ...state, itemData: action.result.data.tradeitem };
    case actionTypes.LOAD_SYNCS_SUCCEED:
      return { ...state, synclist: action.result.data };
    case actionTypes.LOAD_CLASBROKERS_SUCCEED:
      return { ...state, shareBrokers: action.result.data.filter(data => data.partner_tenant_id > 0)
        .map(data => ({ tenant_id: data.partner_tenant_id, name: data.name })) };
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

export function setAdditemModalVisible(val) {
  return {
    type: actionTypes.SET_ADD_ITEM_VISIBLE,
    data: val,
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

export function deleteItem(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_ITEM,
        actionTypes.DELETE_ITEM_SUCCEED,
        actionTypes.DELETE_ITEM_FAIL,
      ],
      endpoint: 'v1/scv/tradeitem/item/delete',
      method: 'post',
      data: { id },
    },
  };
}

export function deleteSelectedItems(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_SELECT_ITEMS,
        actionTypes.DELETE_SELECT_ITEMS_SUCCEED,
        actionTypes.DELETE_SELECT_ITEMS_FAIL,
      ],
      endpoint: 'v1/scv/tradeitem/selected/deleted',
      method: 'post',
      data: datas,
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
      endpoint: 'v1/scv/classification/syncs',
      method: 'get',
      params,
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

export function renewSharees(contribute, sharees) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RENEW_SHAREE,
        actionTypes.RENEW_SHAREE_SUCCEED,
        actionTypes.RENEW_SHAREE_FAIL,
      ],
      endpoint: 'v1/scv/classification/sync/update/sharees',
      method: 'post',
      data: { contribute, sharees },
    },
  };
}
