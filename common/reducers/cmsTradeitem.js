import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/tradeitem/', [
  'LOAD_REPOS', 'LOAD_REPOS_SUCCEED', 'LOAD_REPOS_FAIL',
  'OPEN_ADD_MODEL', 'CLOSE_ADD_MODEL',
  'CREATE_REPO', 'CREATE_REPO_SUCCEED', 'CREATE_REPO_FAIL',
  'DELETE_REPO', 'DELETE_REPO_SUCCEED', 'DELETE_REPO_FAIL',
  'LOAD_TRADE_CODES', 'LOAD_TRADE_CODES_SUCCEED', 'LOAD_TRADE_CODES_FAIL',
  'SET_SELECTED_REPOID', 'SET_PANE_TABKEY',
  'LOAD_REPO_TRADES', 'LOAD_REPO_TRADES_SUCCEED', 'LOAD_REPO_TRADES_FAIL',
  'SAVE_REPO_TRADES', 'SAVE_REPO_TRADES_SUCCEED', 'SAVE_REPO_TRADES_FAIL',
  'DELETE_REPO_TRADE', 'DELETE_REPO_TRADE_SUCCEED', 'DELETE_REPO_TRADE_FAIL',
  'LOAD_TRADE_ITEMS', 'LOAD_TRADE_ITEMS_SUCCEED', 'LOAD_TRADE_ITEMS_FAIL',
  'DELETE_ITEM', 'DELETE_ITEM_SUCCEED', 'DELETE_ITEM_FAIL',
  'LOAD_PARAMS', 'LOAD_PARAMS_SUCCEED', 'LOAD_PARAMS_FAIL',
  'CREATE_ITEM', 'CREATE_ITEM_SUCCEED', 'CREATE_ITEM_FAIL',
  'LOAD_ITEM_EDIT', 'LOAD_ITEM_EDIT_SUCCEED', 'LOAD_ITEM_EDIT_FAIL',
  'ITEM_EDITED_SAVE', 'ITEM_EDITED_SAVE_SUCCEED', 'ITEM_EDITED_SAVE_FAIL',
  'DELETE_SELECT_ITEMS', 'DELETE_SELECT_ITEMS_SUCCEED', 'DELETE_SELECT_ITEMS_FAIL',
  'LOAD_BODY_ITEM', 'LOAD_BODY_ITEM_SUCCEED', 'LOAD_BODY_ITEM_FAIL',
  'LOAD_BODY_HSCODE', 'LOAD_BODY_HSCODE_SUCCEED', 'LOAD_BODY_HSCODE_FAIL',
  'SET_REPO', 'SET_COMPARE_VISIBLE',
  'COMPARED_DATAS_SAVE', 'COMPARED_DATAS_SAVE_SUCCEED', 'COMPARED_DATAS_SAVE_FAIL',
  'SET_ITEM_STATUS', 'SET_ITEM_STATUS_SUCCEED', 'SET_ITEM_STATUS_FAIL',
  'LOAD_REPO_USERS', 'LOAD_REPO_USERS_SUCCEED', 'LOAD_REPO_USERS_FAIL',
  'ADD_REPO_USER', 'ADD_REPO_USER_SUCCEED', 'ADD_REPO_USER_FAIL',
  'DELETE_REPO_USER', 'DELETE_REPO_USER_SUCCEED', 'DELETE_REPO_USER_FAIL',
]);

const initialState = {
  listFilter: {
    status: 'pending',
    sortField: '',
    sortOrder: '',
  },
  tradeItemlist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  visibleAddModal: false,
  repos: [],
  tradeCodes: [],
  tabKey: 'copCodes',
  repoId: null,
  repoTrades: [],
  repoUsers: [],
  params: {
    currencies: [],
    units: [],
    tradeCountries: [],
  },
  itemData: {},
  bodyItem: {},
  bodyHscode: {},
  hstabKey: 'declunit',
  repo: {},
  visibleCompareModal: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_REPOS_SUCCEED:
      return { ...state, repos: action.result.data };
    case actionTypes.OPEN_ADD_MODEL:
      return { ...state, visibleAddModal: true };
    case actionTypes.CLOSE_ADD_MODEL:
      return { ...state, visibleAddModal: false };
    case actionTypes.SET_PANE_TABKEY:
      return { ...state, tabKey: action.data };
    case actionTypes.SET_REPO:
      return { ...state, repo: action.data };
    case actionTypes.LOAD_TRADE_CODES_SUCCEED:
      return { ...state, tradeCodes: action.result.data };
    case actionTypes.SET_SELECTED_REPOID:
      return { ...state, repoId: action.payload.repoId };
    case actionTypes.LOAD_REPO_TRADES_SUCCEED:
      return { ...state, repoTrades: action.result.data };
    case actionTypes.LOAD_TRADE_ITEMS_SUCCEED:
      return { ...state, tradeItemlist: action.result.data, listFilter: JSON.parse(action.params.filter) };
    case actionTypes.LOAD_PARAMS_SUCCEED:
      return { ...state, params: action.result.data };
    case actionTypes.LOAD_ITEM_EDIT_SUCCEED:
      return { ...state, itemData: action.result.data.tradeitem };
    case actionTypes.LOAD_BODY_ITEM_SUCCEED:
      return { ...state, bodyItem: action.result.data };
    case actionTypes.LOAD_BODY_HSCODE_SUCCEED:
      return { ...state, bodyHscode: action.result.data };
    case actionTypes.CREATE_REPO_SUCCEED:
      return { ...state, repoId: action.result.data };
    case actionTypes.SET_COMPARE_VISIBLE:
      return { ...state, visibleCompareModal: action.data };
    case actionTypes.LOAD_REPO_USERS_SUCCEED:
      return { ...state, repoUsers: action.result.data };
    default:
      return state;
  }
}

export function saveComparedItemDatas(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.COMPARED_DATAS_SAVE,
        actionTypes.COMPARED_DATAS_SAVE_SUCCEED,
        actionTypes.COMPARED_DATAS_SAVE_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/compared/datas/save',
      method: 'post',
      data: datas,
    },
  };
}

export function loadTradeItem(itemId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ITEM_EDIT,
        actionTypes.LOAD_ITEM_EDIT_SUCCEED,
        actionTypes.LOAD_ITEM_EDIT_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/editItem/load',
      method: 'get',
      params: { itemId },
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
      endpoint: 'v1/cms/tradeitem/edited/save',
      method: 'post',
      data: datas,
    },
  };
}

export function loadTradeParams() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARAMS,
        actionTypes.LOAD_PARAMS_SUCCEED,
        actionTypes.LOAD_PARAMS_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/params',
      method: 'get',
    },
  };
}

export function loadTradeItems(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRADE_ITEMS,
        actionTypes.LOAD_TRADE_ITEMS_SUCCEED,
        actionTypes.LOAD_TRADE_ITEMS_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/items/load',
      method: 'get',
      params,
    },
  };
}

export function createTradeItem(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_ITEM,
        actionTypes.CREATE_ITEM_SUCCEED,
        actionTypes.CREATE_ITEM_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/create',
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
      endpoint: 'v1/cms/tradeitem/item/delete',
      method: 'post',
      data: { id },
    },
  };
}

export function loadRepos(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_REPOS,
        actionTypes.LOAD_REPOS_SUCCEED,
        actionTypes.LOAD_REPOS_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/repos/load',
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

export function setRepo(repo) {
  return {
    type: actionTypes.SET_REPO,
    data: repo,
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

export function deleteRepo(repoId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_REPO,
        actionTypes.DELETE_REPO_SUCCEED,
        actionTypes.DELETE_REPO_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/repo/delete',
      method: 'post',
      data: { repoId },
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

export function deleteSelectedItems(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_SELECT_ITEMS,
        actionTypes.DELETE_SELECT_ITEMS_SUCCEED,
        actionTypes.DELETE_SELECT_ITEMS_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/selected/deleted',
      method: 'post',
      data: datas,
    },
  };
}

export function getItemForBody(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BODY_ITEM,
        actionTypes.LOAD_BODY_ITEM_SUCCEED,
        actionTypes.LOAD_BODY_ITEM_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/load/item/forBody',
      method: 'get',
      params,
    },
  };
}

export function getHscodeForBody(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BODY_HSCODE,
        actionTypes.LOAD_BODY_HSCODE_SUCCEED,
        actionTypes.LOAD_BODY_HSCODE_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/load/hscode/forBody',
      method: 'get',
      params,
    },
  };
}

export function setCompareVisible(val) {
  return {
    type: actionTypes.SET_COMPARE_VISIBLE,
    data: val,
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
      endpoint: 'v1/cms/tradeitem/status/set',
      method: 'post',
      data: datas,
    },
  };
}

export function loadRepoUsers(repoId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_REPO_USERS,
        actionTypes.LOAD_REPO_USERS_SUCCEED,
        actionTypes.LOAD_REPO_USERS_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/repoUsers',
      method: 'get',
      params: { repoId },
    },
  };
}

export function addRepoUser(repoId, partnerTenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_REPO_USER,
        actionTypes.ADD_REPO_USER_SUCCEED,
        actionTypes.ADD_REPO_USER_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/repoUser/add',
      method: 'post',
      data: { repoId, partnerTenantId },
    },
  };
}

export function deleteRepoUser(repoUserId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_REPO_USER,
        actionTypes.DELETE_REPO_USER_SUCCEED,
        actionTypes.DELETE_REPO_USER_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/repoUser/delete',
      method: 'post',
      data: { repoUserId },
    },
  };
}
