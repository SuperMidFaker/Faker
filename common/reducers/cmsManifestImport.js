import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/manifest/import', [
  'TOGGLE_DIMP_MODAL',
  'LOAD_DECLENTR', 'LOAD_DECLENTR_SUCCEED', 'LOAD_DECLENTR_FAIL',
  'LOAD_ENTRGNOD', 'LOAD_ENTRGNOD_SUCCEED', 'LOAD_ENTRGNOD_FAIL',
  'IMP_DECLB', 'IMP_DECLB_SUCCEED', 'IMP_DECLB_FAIL',
]);

const initialState = {
  submitting: false,
  visibleDeclBodyModal: false,
  declEntries: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TOGGLE_DIMP_MODAL:
      return { ...state, visibleDeclBodyModal: action.data.visible };
    case actionTypes.LOAD_DECLENTR_SUCCEED:
      return { ...state, declEntries: action.result.data };
    case actionTypes.IMP_DECLB:
      return { ...state, submitting: true };
    case actionTypes.IMP_DECLB_SUCCEED:
    case actionTypes.IMP_DECLB_FAIL:
      return { ...state, submitting: false };
    default:
      return state;
  }
}

export function toggleDeclImportModal(visible) {
  return {
    type: actionTypes.TOGGLE_DIMP_MODAL,
    data: { visible },
  };
}

export function loadDeclEntries(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DECLENTR,
        actionTypes.LOAD_DECLENTR_SUCCEED,
        actionTypes.LOAD_DECLENTR_FAIL,
      ],
      endpoint: 'v1/cms/customs/decl/entries',
      method: 'get',
      params,
    },
  };
}

export function loadEntryGnoDetails(preEntrySeqNo, filtered) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ENTRGNOD,
        actionTypes.LOAD_ENTRGNOD_SUCCEED,
        actionTypes.LOAD_ENTRGNOD_FAIL,
      ],
      endpoint: 'v1/cms/manifest/decl/gno/details',
      method: 'get',
      params: { preEntrySeqNo, filtered },
    },
  };
}

export function importDeclBodies(delgNo, action, bodyInfo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.IMP_DECLB,
        actionTypes.IMP_DECLB_SUCCEED,
        actionTypes.IMP_DECLB_FAIL,
      ],
      endpoint: 'v1/cms/manifest/import/decl/bodies',
      method: 'post',
      data: { delgNo, bodyInfo, action },
    },
  };
}
