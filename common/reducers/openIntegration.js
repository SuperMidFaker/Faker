import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/hub/integration/', [
  'LOAD_INSTALLED', 'LOAD_INSTALLED_SUCCEED', 'LOAD_INSTALLED_FAIL',
  'UPDATE_APPSTATUS', 'UPDATE_APPSTATUS_SUCCEED', 'UPDATE_APPSTATUS_FAIL',
  'INSTALL_EASI', 'INSTALL_EASI_SUCCEED', 'INSTALL_EASI_FAIL',
  'LOAD_EASI', 'LOAD_EASI_SUCCEED', 'LOAD_EASI_FAIL',
  'UPDATE_EASI', 'UPDATE_EASI_SUCCEED', 'UPDATE_EASI_FAIL',
  'DEL_APP', 'DEL_APP_SUCCEED', 'DEL_APP_FAIL',
  'LOAD_ARC', 'LOAD_ARC_SUCCEED', 'LOAD_ARC_FAIL',
  'INSTALL_ARC', 'INSTALL_ARC_SUCCEED', 'INSTALL_ARC_FAIL',
  'UPDATE_ARC', 'UPDATE_ARC_SUCCEED', 'UPDATE_ARC_FAIL',
  'LOAD_SHFTZ', 'LOAD_SHFTZ_SUCCEED', 'LOAD_SHFTZ_FAIL',
  'INSTALL_SHFTZ', 'INSTALL_SHFTZ_SUCCEED', 'INSTALL_SHFTZ_FAIL',
  'UPDATE_SHFTZ', 'UPDATE_SHFTZ_SUCCEED', 'UPDATE_SHFTZ_FAIL',
  'LOAD_WHSESUPV', 'LOAD_WHSESUPV_SUCCEED', 'LOAD_WHSESUPV_FAIL',
  'INSTALL_SHUNFENG', 'INSTALL_SHUNFENG_SUCCEED', 'INSTALL_SHUNFENG_FAIL',
  'LOAD_SHUNFENG', 'LOAD_SHUNFENG_SUCCEED', 'LOAD_SHUNFENG_FAIL',
  'UPDATE_SHUNFENG', 'UPDATE_SHUNFENG_SUCCEED', 'UPDATE_SHUNFENG_FAIL',
]);

const initialState = {
  loading: false,
  list: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  sortFilter: {
    field: '',
    order: '',
  },
  listFilter: {},
  easipassApp: {},
  quickpassApp: {},
  arctm: {},
  shftzApp: {},
  shunfeng: {},
  whseSupervisonApps: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_INSTALLED:
      return { ...state,
        listFilter: JSON.parse(action.params.filter),
        sortFilter: JSON.parse(action.params.sorter),
        loading: true };
    case actionTypes.LOAD_INSTALLED_SUCCEED:
      return { ...state, loading: false, list: action.result.data };
    case actionTypes.LOAD_INSTALLED_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_EASI_SUCCEED:
      return { ...state, easipassApp: action.result.data };
    case actionTypes.LOAD_ARC_SUCCEED:
      return { ...state, arctm: action.result.data };
    case actionTypes.LOAD_SHFTZ_SUCCEED:
      return { ...state, shftzApp: action.result.data };
    case actionTypes.LOAD_SHUNFENG_SUCCEED:
      return { ...state, shunfeng: action.result.data };
    case actionTypes.LOAD_WHSESUPV_SUCCEED:
      return { ...state, whseSupervisonApps: action.result.data };
    default:
      return state;
  }
}

export function loadInstalledApps(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_INSTALLED,
        actionTypes.LOAD_INSTALLED_SUCCEED,
        actionTypes.LOAD_INSTALLED_FAIL,
      ],
      endpoint: 'v1/platform/integration/installed',
      method: 'get',
      params,
    },
  };
}

export function installEasipassApp(easipass) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.INSTALL_EASI,
        actionTypes.INSTALL_EASI_SUCCEED,
        actionTypes.INSTALL_EASI_FAIL,
      ],
      endpoint: 'v1/platform/integration/install/easipass',
      method: 'post',
      data: easipass,
    },
  };
}

export function loadEasipassApp(appuuid) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_EASI,
        actionTypes.LOAD_EASI_SUCCEED,
        actionTypes.LOAD_EASI_FAIL,
      ],
      endpoint: 'v1/platform/integration/easipass',
      method: 'get',
      params: { uuid: appuuid },
    },
  };
}

export function updateEasipassApp(easipass) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_EASI,
        actionTypes.UPDATE_EASI_SUCCEED,
        actionTypes.UPDATE_EASI_FAIL,
      ],
      endpoint: 'v1/platform/integration/update/easipass',
      method: 'post',
      data: easipass,
    },
  };
}

export function updateAppStatus(easipass) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_APPSTATUS,
        actionTypes.UPDATE_APPSTATUS_SUCCEED,
        actionTypes.UPDATE_APPSTATUS_FAIL,
      ],
      endpoint: 'v1/platform/integration/update/app/status',
      method: 'post',
      data: easipass,
    },
  };
}

export function deleteApp(appuuid) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DEL_APP,
        actionTypes.DEL_APP_SUCCEED,
        actionTypes.DEL_APP_FAIL,
      ],
      endpoint: 'v1/platform/integration/delete',
      method: 'post',
      data: { uuid: appuuid },
    },
  };
}

export function loadArCtmApp(uuid) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ARC,
        actionTypes.LOAD_ARC_SUCCEED,
        actionTypes.LOAD_ARC_FAIL,
      ],
      endpoint: 'v1/platform/integration/arctm',
      method: 'get',
      params: { uuid },
    },
  };
}

export function installArCtmApp(arctm) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.INSTALL_ARC,
        actionTypes.INSTALL_ARC_SUCCEED,
        actionTypes.INSTALL_ARC_FAIL,
      ],
      endpoint: 'v1/platform/integration/install/arctm',
      method: 'post',
      data: arctm,
    },
  };
}

export function updateArCtmApp(arctm) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_ARC,
        actionTypes.UPDATE_ARC_SUCCEED,
        actionTypes.UPDATE_ARC_FAIL,
      ],
      endpoint: 'v1/platform/integration/update/arctm',
      method: 'post',
      data: arctm,
    },
  };
}

export function loadShftzApp(uuid) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SHFTZ,
        actionTypes.LOAD_SHFTZ_SUCCEED,
        actionTypes.LOAD_SHFTZ_FAIL,
      ],
      endpoint: 'v1/platform/integration/shftz',
      method: 'get',
      params: { uuid },
    },
  };
}

export function installShftzApp(shftz) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.INSTALL_SHFTZ,
        actionTypes.INSTALL_SHFTZ_SUCCEED,
        actionTypes.INSTALL_SHFTZ_FAIL,
      ],
      endpoint: 'v1/platform/integration/install/shftz',
      method: 'post',
      data: shftz,
    },
  };
}

export function updateShftzApp(shftz) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_SHFTZ,
        actionTypes.UPDATE_SHFTZ_SUCCEED,
        actionTypes.UPDATE_SHFTZ_FAIL,
      ],
      endpoint: 'v1/platform/integration/update/shftz',
      method: 'post',
      data: shftz,
    },
  };
}

export function loadWhseSupervisionApps(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_WHSESUPV,
        actionTypes.LOAD_WHSESUPV_SUCCEED,
        actionTypes.LOAD_WHSESUPV_FAIL,
      ],
      endpoint: 'v1/platform/integration/whse/supervisions',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function installShunfengApp(easipass) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.INSTALL_SHUNFENG,
        actionTypes.INSTALL_SHUNFENG_SUCCEED,
        actionTypes.INSTALL_SHUNFENG_FAIL,
      ],
      endpoint: 'v1/platform/integration/install/shunfeng',
      method: 'post',
      data: easipass,
    },
  };
}

export function loadShunfengApp(appuuid) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SHUNFENG,
        actionTypes.LOAD_SHUNFENG_SUCCEED,
        actionTypes.LOAD_SHUNFENG_FAIL,
      ],
      endpoint: 'v1/platform/integration/shunfeng',
      method: 'get',
      params: { uuid: appuuid },
    },
  };
}

export function updateShunfengApp(easipass) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_SHUNFENG,
        actionTypes.UPDATE_SHUNFENG_SUCCEED,
        actionTypes.UPDATE_SHUNFENG_FAIL,
      ],
      endpoint: 'v1/platform/integration/update/shunfeng',
      method: 'post',
      data: easipass,
    },
  };
}
