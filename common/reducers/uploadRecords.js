import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/upload/records/', [
  'UPLOAD_RECORDS_LOAD', 'UPLOAD_RECORDS_LOAD_SUCCEED', 'UPLOAD_RECORDS_LOAD_FAIL',
  'SET_RECORDS_RELOAD', 'TOGGLE_PANEL_VISIBLE',
]);

const initialState = {
  uploadRecords: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
    reload: false,
  },
  filter: {},
  visible: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.UPLOAD_RECORDS_LOAD:
      return {
        ...state,
        uploadRecords: { ...state.uploadRecords, reload: false },
        filter: JSON.parse(action.params.filter),
      };
    case actionTypes.UPLOAD_RECORDS_LOAD_SUCCEED:
      return { ...state, uploadRecords: { ...action.result.data } };
    case actionTypes.UPLOAD_RECORDS_LOAD_FAIL:
      return { ...state, uploadRecords: { ...state.uploadRecords } };
    case actionTypes.SET_RECORDS_RELOAD: {
      return { ...state, uploadRecords: { ...state.uploadRecords, reload: action.reload } };
    }
    case actionTypes.TOGGLE_PANEL_VISIBLE: {
      return { ...state, visible: action.visible };
    }
    default:
      return state;
  }
}

export function loadUploadRecords({
  pageSize, current, type, filter,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPLOAD_RECORDS_LOAD,
        actionTypes.UPLOAD_RECORDS_LOAD_SUCCEED,
        actionTypes.UPLOAD_RECORDS_LOAD_FAIL,
      ],
      endpoint: 'v1/upload/records/load',
      method: 'get',
      params: {
        pageSize, current, type, filter,
      },
    },
  };
}

export function setUploadRecordsReload(reload) {
  return {
    type: actionTypes.SET_RECORDS_RELOAD,
    reload,
  };
}

export function togglePanelVisible(visible) {
  return {
    type: actionTypes.TOGGLE_PANEL_VISIBLE,
    visible,
  };
}
