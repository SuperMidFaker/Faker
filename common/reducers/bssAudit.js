import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/bss/audit/', [
  'LOAD_AUDITS', 'LOAD_AUDITS_SUCCEED', 'LOAD_AUDITS_FAIL',
  'CONFIRM_AUDITS', 'CONFIRM_AUDITS_SUCCEED', 'CONFIRM_AUDITS_FAIL',
  'REDO_AUDITS', 'REDO_AUDITS_SUCCEED', 'REDO_AUDITS_FAIL',
  'GET_AUDIT', 'GET_AUDIT_SUCCEED', 'GET_AUDIT_FAIL',
  'DELETE_FEE', 'DELETE_FEE_SUCCEED', 'DELETE_FEE_FAIL',
  'UPDATE_FEE', 'UPDATE_FEE_SUCCEED', 'UPDATE_FEE_FAIL',
  'CONFIRM_AUDIT', 'CONFIRM_AUDIT_SUCCEED', 'CONFIRM_AUDIT_FAIL',
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

export function getAudit(sofOrderNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GET_AUDIT,
        actionTypes.GET_AUDIT_SUCCEED,
        actionTypes.GET_AUDIT_FAIL,
      ],
      endpoint: 'v1/bss/audit/get',
      method: 'get',
      params: { sofOrderNo },
    },
  };
}

export function deleteFee(id, sumAmount, dataType, sofOrderNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_FEE,
        actionTypes.DELETE_FEE_SUCCEED,
        actionTypes.DELETE_FEE_FAIL,
      ],
      endpoint: 'v1/bss/audit/fee/delete',
      method: 'post',
      data: {
        id, sumAmount, dataType, sofOrderNo,
      },
    },
  };
}

export function updateFee(item, dataType, sofOrderNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_FEE,
        actionTypes.UPDATE_FEE_SUCCEED,
        actionTypes.UPDATE_FEE_FAIL,
      ],
      endpoint: 'v1/bss/audit/fee/update',
      method: 'post',
      data: { item, dataType, sofOrderNo },
    },
  };
}

export function confirmAudit(sofOrderNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CONFIRM_AUDIT,
        actionTypes.CONFIRM_AUDIT_SUCCEED,
        actionTypes.CONFIRM_AUDIT_FAIL,
      ],
      endpoint: 'v1/bss/audit/confirm',
      method: 'post',
      data: { sofOrderNo },
    },
  };
}
