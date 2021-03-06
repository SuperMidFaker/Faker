import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/manual/', [
  'SHOW_IMPORT_MODAL', 'HIDE_IMPORT_MODAL',
  'LOAD_MANUALS', 'LOAD_MANUALS_SUCCEED', 'LOAD_MANUALS_FAIL',
  'LOAD_MANUAL_HEAD', 'LOAD_MANUAL_HEAD_SUCCEED', 'LOAD_MANUAL_HEAD_FAIL',
  'LOAD_MANUAL_GOODS', 'LOAD_MANUAL_GOODS_SUCCEED', 'LOAD_MANUAL_GOODS_FAIL',
]);

const initialState = {
  importModal: {
    visible: false,
  },
  manuallist: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
    loading: true,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.SHOW_IMPORT_MODAL:
      return { ...state, importModal: { ...state.importModal, visible: true } };
    case actionTypes.HIDE_IMPORT_MODAL:
      return { ...state, importModal: { ...state.importModal, visible: false } };
    case actionTypes.LOAD_MANUALS:
      return { ...state, manuallist: { ...state.manuallist, loading: true } };
    case actionTypes.LOAD_MANUALS_SUCCEED:
      return { ...state, manuallist: { ...state.manuallist, loading: false, data: action.result.data.data } };
    case actionTypes.LOAD_MANUALS_FAIL:
      return { ...state, manuallist: { ...state.manuallist, loading: false } };
    default:
      return state;
  }
}

export function showImportModal() {
  return {
    type: actionTypes.SHOW_IMPORT_MODAL,
  };
}

export function hideImportModal() {
  return {
    type: actionTypes.HIDE_IMPORT_MODAL,
  };
}

export function loadManualLists({ pageSize, current, filters = {} }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_MANUALS,
        actionTypes.LOAD_MANUALS_SUCCEED,
        actionTypes.LOAD_MANUALS_FAIL,
      ],
      endpoint: 'v1/cms/manuals/load',
      method: 'get',
      params: { pageSize, current, filters: JSON.stringify(filters) },
    },
  };
}

export function loadManualHead(manualNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_MANUAL_HEAD,
        actionTypes.LOAD_MANUAL_HEAD_SUCCEED,
        actionTypes.LOAD_MANUAL_HEAD_FAIL,
      ],
      endpoint: 'v1/cms/manual/head/load',
      method: 'get',
      params: { manualNo },
    },
  };
}

export function loadManualGoods(manualNo, type) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_MANUAL_GOODS,
        actionTypes.LOAD_MANUAL_GOODS_SUCCEED,
        actionTypes.LOAD_MANUAL_GOODS_FAIL,
      ],
      endpoint: 'v1/cms/manual/goods/load',
      method: 'get',
      params: { manualNo, type },
    },
  };
}
