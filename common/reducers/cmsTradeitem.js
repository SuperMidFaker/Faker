import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/tradeitem/', [
  'LOAD_REPOS', 'LOAD_REPOS_SUCCEED', 'LOAD_REPOS_FAIL',
  'OPEN_ADD_MODEL', 'CLOSE_ADD_MODEL',
  'CREATE_REPO', 'CREATE_REPO_SUCCEED', 'CREATE_REPO_FAIL',
  'DELETE_REPO', 'DELETE_REPO_SUCCEED', 'DELETE_REPO_FAIL',
  'SET_SELECTED_REPOID', 'SET_PANE_TABKEY',
  'LOAD_TRADE_ITEMS', 'LOAD_TRADE_ITEMS_SUCCEED', 'LOAD_TRADE_ITEMS_FAIL',
  'LOAD_PARAMS', 'LOAD_PARAMS_SUCCEED', 'LOAD_PARAMS_FAIL',
  'CREATE_ITEM', 'CREATE_ITEM_SUCCEED', 'CREATE_ITEM_FAIL',
  'LOAD_ITEM_EDIT', 'LOAD_ITEM_EDIT_SUCCEED', 'LOAD_ITEM_EDIT_FAIL',
  'ITEM_EDITED_SAVE', 'ITEM_EDITED_SAVE_SUCCEED', 'ITEM_EDITED_SAVE_FAIL',
  'DELETE_ITEMS', 'DELETE_ITEMS_SUCCEED', 'DELETE_ITEMS_FAIL',
  'LOAD_BODY_ITEM', 'LOAD_BODY_ITEM_SUCCEED', 'LOAD_BODY_ITEM_FAIL',
  'LOAD_BODY_HSCODE', 'LOAD_BODY_HSCODE_SUCCEED', 'LOAD_BODY_HSCODE_FAIL',
  'SET_REPO', 'SET_COMPARE_VISIBLE',
  'COMPARED_DATAS_SAVE', 'COMPARED_DATAS_SAVE_SUCCEED', 'COMPARED_DATAS_SAVE_FAIL',
  'SET_ITEM_STATUS', 'SET_ITEM_STATUS_SUCCEED', 'SET_ITEM_STATUS_FAIL',
  'LOAD_REPO_USERS', 'LOAD_REPO_USERS_SUCCEED', 'LOAD_REPO_USERS_FAIL',
  'ADD_REPO_USER', 'ADD_REPO_USER_SUCCEED', 'ADD_REPO_USER_FAIL',
  'DELETE_REPO_USER', 'DELETE_REPO_USER_SUCCEED', 'DELETE_REPO_USER_FAIL',
  'LOAD_TEMP_ITEMS', 'LOAD_TEMP_ITEMS_SUCCEED', 'LOAD_TEMP_ITEMS_FAIL',
  'COMPARED_CANCEL', 'COMPARED_CANCEL_SUCCEED', 'COMPARED_CANCEL_FAIL',
  'DELETE_TEMP_DATA', 'DELETE_TEMP_DATA_SUCCEED', 'DELETE_TEMP_DATA_FAIL',
  'UPGRADE_MODE', 'UPGRADE_MODE_SUCCEED', 'UPGRADE_MODE_FAIL',
  'SET_DATA_SHARED', 'SET_DATA_SHARED_SUCCEED', 'SET_DATA_SHARED_FAIL',
  'COPY_ITEM_STAGE', 'COPY_ITEM_STAGE_SUCCEED', 'COPY_ITEM_STAGE_FAIL',
  'ITEM_NEWSRC_SAVE', 'ITEM_NEWSRC_SAVE_SUCCEED', 'ITEM_NEWSRC_SAVE_FAIL',
  'SWITCH_REPOMD', 'SWITCH_REPOMD_SUCCEED', 'SWITCH_REPOMD_FAIL',
  'LOAD_WSLITEMS', 'LOAD_WSLITEMS_SUCCEED', 'LOAD_WSLITEMS_FAIL',
]);

const initialState = {
  reposLoading: false,
  tradeItemsLoading: false,
  listFilter: {
    status: 'classified',
    sortField: '',
    sortOrder: '',
  },
  tradeItemlist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    searchText: '',
    data: [],
  },
  tempItems: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: [],
  },
  visibleAddModal: false,
  repos: [],
  reposLoaded: false,
  tradeCodes: [],
  tabKey: 'copCodes',
  repoId: null,
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
  workspaceItemsLoading: false,
  workspaceItemList: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_REPOS:
      return { ...state, reposLoading: true };
    case actionTypes.LOAD_REPOS_SUCCEED:
      return { ...state, repos: action.result.data, reposLoading: false, reposLoaded: true };
    case actionTypes.LOAD_REPOS_FAIL:
      return { ...state, reposLoading: false };
    case actionTypes.OPEN_ADD_MODEL:
      return { ...state, visibleAddModal: true };
    case actionTypes.CLOSE_ADD_MODEL:
      return { ...state, visibleAddModal: false };
    case actionTypes.SET_PANE_TABKEY:
      return { ...state, tabKey: action.data };
    case actionTypes.SET_REPO:
      return { ...state, repo: action.data };
    case actionTypes.SET_SELECTED_REPOID:
      return { ...state, repoId: action.payload.repoId };
    case actionTypes.LOAD_TRADE_ITEMS:
      return { ...state, tradeItemsLoading: true, itemData: initialState.itemData };
    case actionTypes.LOAD_TRADE_ITEMS_SUCCEED:
      return { ...state, tradeItemlist: action.result.data, listFilter: JSON.parse(action.params.filter), tradeItemsLoading: false };
    case actionTypes.LOAD_TRADE_ITEMS_FAIL:
      return { ...state, tradeItemsLoading: false };
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
    case actionTypes.LOAD_TEMP_ITEMS_SUCCEED:
      return { ...state, tempItems: action.result.data };
    case actionTypes.SWITCH_REPOMD_SUCCEED:
      return { ...state, repos: state.repos.map(rep => rep.id === action.data.repoId ? { ...rep, mode: action.result.data } : rep) };
    case actionTypes.LOAD_WSLITEMS:
      return { ...state, workspaceItemsLoading: true };
    case actionTypes.LOAD_WSLITEMS_SUCCEED:
      return { ...state, workspaceItemsLoading: false, workspaceItemList: action.result.data };
    case actionTypes.LOAD_WSLITEMS_FAIL:
      return { ...state, workspaceItemsLoading: false };
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

export function loadTradeItem(itemId, action) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ITEM_EDIT,
        actionTypes.LOAD_ITEM_EDIT_SUCCEED,
        actionTypes.LOAD_ITEM_EDIT_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/editItem/load',
      method: 'get',
      params: { itemId, action },
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

export function loadRepos() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_REPOS,
        actionTypes.LOAD_REPOS_SUCCEED,
        actionTypes.LOAD_REPOS_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/repos/load',
      method: 'get',
    },
  };
}

export function loadTempItems(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TEMP_ITEMS,
        actionTypes.LOAD_TEMP_ITEMS_SUCCEED,
        actionTypes.LOAD_TEMP_ITEMS_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/temp/items/load',
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

export function deleteItems(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_ITEMS,
        actionTypes.DELETE_ITEMS_SUCCEED,
        actionTypes.DELETE_ITEMS_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/delete/items',
      method: 'post',
      data,
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

export function addRepoUser(tenantId, repoId, partnerTenantId, name) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_REPO_USER,
        actionTypes.ADD_REPO_USER_SUCCEED,
        actionTypes.ADD_REPO_USER_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/repoUser/add',
      method: 'post',
      data: { tenantId, repoId, partnerTenantId, name },
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

export function comparedCancel(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.COMPARED_CANCEL,
        actionTypes.COMPARED_CANCEL_SUCCEED,
        actionTypes.COMPARED_CANCEL_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/compared/datas/cancel',
      method: 'post',
      data: datas,
    },
  };
}

export function deleteTempData(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_TEMP_DATA,
        actionTypes.DELETE_TEMP_DATA_SUCCEED,
        actionTypes.DELETE_TEMP_DATA_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/compared/del',
      method: 'post',
      data: { id },
    },
  };
}

export function upgradeMode(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPGRADE_MODE,
        actionTypes.UPGRADE_MODE_SUCCEED,
        actionTypes.UPGRADE_MODE_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/upgrade/repo',
      method: 'post',
      data: datas,
    },
  };
}

export function setDatasShare(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SET_DATA_SHARED,
        actionTypes.SET_DATA_SHARED_SUCCEED,
        actionTypes.SET_DATA_SHARED_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/set/data/shared',
      method: 'post',
      data: datas,
    },
  };
}

export function copyToStage(datas) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.COPY_ITEM_STAGE,
        actionTypes.COPY_ITEM_STAGE_SUCCEED,
        actionTypes.COPY_ITEM_STAGE_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/item/stage/copy',
      method: 'post',
      data: datas,
    },
  };
}

export function itemNewSrcSave(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ITEM_NEWSRC_SAVE,
        actionTypes.ITEM_NEWSRC_SAVE_SUCCEED,
        actionTypes.ITEM_NEWSRC_SAVE_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/newSrc/save',
      method: 'post',
      data,
    },
  };
}

export function switchRepoMode(repoId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SWITCH_REPOMD,
        actionTypes.SWITCH_REPOMD_SUCCEED,
        actionTypes.SWITCH_REPOMD_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/switch/repomode',
      method: 'post',
      data: { repoId },
    },
  };
}

export function loadWorkspaceItems(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_WSLITEMS,
        actionTypes.LOAD_WSLITEMS_SUCCEED,
        actionTypes.LOAD_WSLITEMS_FAIL,
      ],
      endpoint: 'v1/cms/tradeitem/workspace/items',
      method: 'get',
      params,
    },
  };
}
