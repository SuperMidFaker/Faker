import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/bss/audit/', [
  'LOAD_AUDITS', 'LOAD_AUDITS_SUCCEED', 'LOAD_AUDITS_FAIL',
  'CONFIRM_AUDITS', 'CONFIRM_AUDITS_SUCCEED', 'CONFIRM_AUDITS_FAIL',
  'REDO_AUDITS', 'REDO_AUDITS_SUCCEED', 'REDO_AUDITS_FAIL',
]);

const initialState = {
  auditslist: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  listFilter: {
    status: 'submitted',
    clientPid: 'all',
  },
  loading: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_AUDITS:
      return {
        ...state,
        listFilter: JSON.parse(action.params.filter),
        loading: true,
      };
    case actionTypes.LOAD_AUDITS_SUCCEED:
      return { ...state, loading: false, auditslist: action.result.data };
    case actionTypes.LOAD_AUDITS_FAIL:
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function loadAudits(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_AUDITS,
        actionTypes.LOAD_AUDITS_SUCCEED,
        actionTypes.LOAD_AUDITS_FAIL,
      ],
      endpoint: 'v1/bss/audits/load',
      method: 'get',
      params,
    },
  };
}

export function confirmAudits(sofOrderNos) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CONFIRM_AUDITS,
        actionTypes.CONFIRM_AUDITS_SUCCEED,
        actionTypes.CONFIRM_AUDITS_FAIL,
      ],
      endpoint: 'v1/bss/audits/confirm',
      method: 'post',
      data: { sofOrderNos },
    },
  };
}

export function redoAudits(sofOrderNos) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REDO_AUDITS,
        actionTypes.REDO_AUDITS_SUCCEED,
        actionTypes.REDO_AUDITS_FAIL,
      ],
      endpoint: 'v1/bss/audits/redo',
      method: 'post',
      data: { sofOrderNos },
    },
  };
}
