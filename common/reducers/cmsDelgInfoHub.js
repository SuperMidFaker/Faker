import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/delegation/', [
  'HIDE_PREVIEWER', 'SET_PREW_STATUS',
  'SHOW_PREVIEWER', 'SHOW_PREVIEWER_SUCCEED', 'SHOW_PREVIEWER_FAILED',
  'SET_PREW_TABKEY',
  'LOAD_DELG_PANEL', 'LOAD_DELG_PANEL_SUCCEED', 'LOAD_DELG_PANEL_FAILED',
  'LOAD_DECLCIQ_PANEL', 'LOAD_DECLCIQ_PANEL_SUCCEED', 'LOAD_DECLCIQ_PANEL_FAIL',
  'UPDATE_CERT_PARAM', 'UPDATE_CERT_PARAM_SUCCEED', 'UPDATE_CERT_PARAM_FAIL',
  'UPDATE_BLNO', 'UPDATE_BLNO_SUCCEED', 'UPDATE_BLNO_FAIL',
]);

const initialState = {
  previewer: {
    visible: false,
    tabKey: 'basic',
    delegation: {},
    files: [],
    delgDispatch: {},
    activities: [],
    ciqdecl: { ciqlist: [] },
  },
  delgPanel: {
    bills: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.SHOW_PREVIEWER_SUCCEED: {
      let tabKey = 'customsDecl';
      if (action.result.data.delgDispatch.status === 0) {
        tabKey = 'basic';
      }
      return { ...state, previewer: {
        ...state.previewer,
        tabKey: action.payload.tabKey || tabKey,
        visible: action.visible,
        delgNo: action.payload.delgNo,
        ...action.result.data }, preStatus: '' };
    }
    case actionTypes.HIDE_PREVIEWER:
      return { ...state, previewer: { ...state.previewer, visible: action.visible } };
    case actionTypes.SET_PREW_STATUS:
      return { ...state, ...action.data };
    case actionTypes.SET_PREW_TABKEY:
      return { ...state, previewer: { ...state.previewer, tabKey: action.data } };
    case actionTypes.LOAD_DELG_PANEL_SUCCEED:
      return { ...state, delgPanel: action.result.data };
    case actionTypes.LOAD_DECLCIQ_PANEL_SUCCEED:
      return { ...state, previewer: { ...state.previewer, ciqdecl: action.result.data } };
    default:
      return state;
  }
}

export function showPreviewer(tenantId, delgNo, tabKey) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SHOW_PREVIEWER,
        actionTypes.SHOW_PREVIEWER_SUCCEED,
        actionTypes.SHOW_PREVIEWER_FAILED,
      ],
      endpoint: 'v1/cms/delegate/previewer',
      method: 'get',
      params: { tenantId, delgNo },
      visible: true,
      payload: { delgNo, tabKey },
    },
  };
}

export function setPreviewTabkey(tabkey) {
  return {
    type: actionTypes.SET_PREW_TABKEY,
    data: tabkey,
  };
}

export function hidePreviewer(delgNo) {
  return {
    type: actionTypes.HIDE_PREVIEWER,
    delgNo,
    visible: false,
  };
}

export function setPreviewStatus(status) {
  return {
    type: actionTypes.SET_PREW_STATUS,
    data: status,
  };
}

export function loadCustPanel(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DELG_PANEL,
        actionTypes.LOAD_DELG_PANEL_SUCCEED,
        actionTypes.LOAD_DELG_PANEL_FAILED,
      ],
      endpoint: 'v1/cms/delegate/load/custPanel',
      method: 'get',
      params,
    },
  };
}

export function loadDeclCiqPanel(delgNo, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DECLCIQ_PANEL,
        actionTypes.LOAD_DECLCIQ_PANEL_SUCCEED,
        actionTypes.LOAD_DECLCIQ_PANEL_FAIL,
      ],
      endpoint: 'v1/cms/declare/delgno/ciqDecls',
      method: 'get',
      params: { delgNo, tenantId },
    },
  };
}

export function updateCertParam(delgNo, dispId, cert, qty) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_CERT_PARAM,
        actionTypes.UPDATE_CERT_PARAM_SUCCEED,
        actionTypes.UPDATE_CERT_PARAM_FAIL,
      ],
      endpoint: 'v1/cms/delegation/update/certParam',
      method: 'post',
      data: { delgNo, dispId, cert, qty },
      origin: 'mongo',
    },
  };
}

export function exchangeBlNo(delgNo, blNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_BLNO,
        actionTypes.UPDATE_BLNO_SUCCEED,
        actionTypes.UPDATE_BLNO_FAIL,
      ],
      endpoint: 'v1/cms/delegation/exchange',
      method: 'post',
      data: { delgNo, blNo },
    },
  };
}
