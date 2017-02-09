import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/tradeitem/', [
  'LOAD_OWNERS', 'LOAD_OWNERS_SUCCEED', 'LOAD_OWNERS_FAIL',
  'OPEN_ADD_MODEL', 'CLOSE_ADD_MODEL',
  'CREATE_REPO', 'CREATE_REPO_SUCCEED', 'CREATE_REPO_FAIL',
  'LOAD_TRADE_CODES', 'LOAD_TRADE_CODES_SUCCEED', 'LOAD_TRADE_CODES_FAIL',
  'SET_SELECTED_REPOID', 'SET_PANE_TABKEY',
  'LOAD_REPO_TRADES', 'LOAD_REPO_TRADES_SUCCEED', 'LOAD_REPO_TRADES_FAIL',
  'SAVE_REPO_TRADES', 'SAVE_REPO_TRADES_SUCCEED', 'SAVE_REPO_TRADES_FAIL',
  'DELETE_REPO_TRADE', 'DELETE_REPO_TRADE_SUCCEED', 'DELETE_REPO_TRADE_FAIL',
  'LOAD_TRADE_ITEMS', 'LOAD_TRADE_ITEMS_SUCCEED', 'LOAD_TRADE_ITEMS_FAIL',
]);

const initialState = {
  visibleAddModal: false,
  repoOwners: [],
  tradeCodes: [],
  tabKey: 'copCodes',
  repoId: null,
  repoTrades: [],
  tradeItems: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_OWNERS_SUCCEED:
      return { ...state, repoOwners: action.result.data };
    case actionTypes.OPEN_ADD_MODEL:
      return { ...state, visibleAddModal: true };
    case actionTypes.CLOSE_ADD_MODEL:
      return { ...state, visibleAddModal: false };
    case actionTypes.SET_PANE_TABKEY:
      return { ...state, tabKey: action.data };
    case actionTypes.LOAD_TRADE_CODES_SUCCEED:
      return { ...state, tradeCodes: action.result.data };
    case actionTypes.SET_SELECTED_REPOID:
      return { ...state, repoId: action.payload.repoId };
    case actionTypes.LOAD_REPO_TRADES_SUCCEED:
      return { ...state, repoTrades: action.result.data };
    case actionTypes.LOAD_TRADE_ITEMS_SUCCEED:
      return { ...state, tradeItems: action.result.data };
    default:
      return state;
  }
}

export function loadTradeItems(repoId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRADE_ITEMS,
        actionTypes.LOAD_TRADE_ITEMS_SUCCEED,
        actionTypes.LOAD_TRADE_ITEMS_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/items/load',
      method: 'get',
      params: { repoId },
    },
  };
}

export function loadOwners(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_OWNERS,
        actionTypes.LOAD_OWNERS_SUCCEED,
        actionTypes.LOAD_OWNERS_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/owners/load',
      method: 'get',
      params,
    },
  };
}

export function openAddModal() {
  return {
    type: actionTypes.OPEN_ADD_MODEL,
  };
}

export function closeAddModal() {
  return {
    type: actionTypes.CLOSE_ADD_MODEL,
  };
}

export function selectedRepoId(repoId) {
  return {
    type: actionTypes.SET_SELECTED_REPOID,
    payload: { repoId },
  };
}

export function setPaneTabkey(tabkey) {
  return {
    type: actionTypes.SET_PANE_TABKEY,
    data: tabkey,
  };
}

export function createRepo(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_REPO,
        actionTypes.CREATE_REPO_SUCCEED,
        actionTypes.CREATE_REPO_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/repo/create',
      method: 'post',
      data: datas,
    },
  };
}

export function loadTradeCodes(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRADE_CODES,
        actionTypes.LOAD_TRADE_CODES_SUCCEED,
        actionTypes.LOAD_TRADE_CODES_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/tradeCodes/load',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function loadRepoTrades(repoId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_REPO_TRADES,
        actionTypes.LOAD_REPO_TRADES_SUCCEED,
        actionTypes.LOAD_REPO_TRADES_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/repoTrades/load',
      method: 'get',
      params: { repoId },
    },
  };
}

export function saveRepoTrade(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_REPO_TRADES,
        actionTypes.SAVE_REPO_TRADES_SUCCEED,
        actionTypes.SAVE_REPO_TRADES_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/repo/trade/save',
      method: 'post',
      data: datas,
    },
  };
}

export function delRepoTrade(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_REPO_TRADE,
        actionTypes.DELETE_REPO_TRADE_SUCCEED,
        actionTypes.DELETE_REPO_TRADE_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/repo/trade/delete',
      method: 'post',
      data: { id },
    },
  };
}

