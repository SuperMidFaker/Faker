import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/upload/records/', [
  'UPLOAD_RECORDS_LOAD', 'UPLOAD_RECORDS_LOAD_SUCCEED', 'UPLOAD_RECORDS_LOAD_FAIL',
  'UPLOAD_RECORDS_BATCH_DELETE', 'UPLOAD_RECORDS_BATCH_DELETE_SUCCEED', 'UPLOAD_RECORDS_BATCH_DELETE_FAIL',
  'SET_RECORDS_RELOAD',
]);

const initialState = {
  uploadRecords: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
    reload: false,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.UPLOAD_RECORDS_LOAD:
      return { ...state, uploadRecords: { ...state.uploadRecords } };
    case actionTypes.UPLOAD_RECORDS_LOAD_SUCCEED:
      return { ...state, uploadRecords: { ...action.result.data, reload: false } };
    case actionTypes.UPLOAD_RECORDS_LOAD_FAIL:
      return { ...state, uploadRecords: { ...state.uploadRecords, reload: false } };
    case actionTypes.SET_RECORDS_RELOAD: {
      return { ...state, uploadRecords: { ...state.uploadRecords, reload: action.reload } };
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

export function uploadRecordsBatchDelete(uploadNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPLOAD_RECORDS_BATCH_DELETE,
        actionTypes.UPLOAD_RECORDS_BATCH_DELETE_SUCCEED,
        actionTypes.UPLOAD_RECORDS_BATCH_DELETE_FAIL,
      ],
      endpoint: 'v1/upload/records/batch/delete',
      method: 'post',
      data: { uploadNo },
    },
  };
}

export function setUploadRecordsReload(reload) {
  return {
    type: actionTypes.SET_RECORDS_RELOAD,
    reload,
  };
}
