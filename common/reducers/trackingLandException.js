import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/tracking/land/exception/', [
  'LOAD_EXCPSHIPMT', 'LOAD_EXCPSHIPMT_FAIL', 'LOAD_EXCPSHIPMT_SUCCEED',
  'LOAD_EXCEPTIONS', 'LOAD_EXCEPTIONS_FAIL', 'LOAD_EXCEPTIONS_SUCCEED',
  'CREATE_EXCEPTION', 'CREATE_EXCEPTION_FAIL', 'CREATE_EXCEPTION_SUCCEED',
  'DEAL_EXCEPTION', 'DEAL_EXCEPTION_FAIL', 'DEAL_EXCEPTION_SUCCEED',
  'CHANGE_FILTER', 'SHOW_EXCPMODAL', 'SHOW_DEAL_EXCEPTION_MODAL',
  'LOAD_EXCEPTION_REASONS', 'LOAD_EXCEPTION_REASONS_FAIL', 'LOAD_EXCEPTION_REASONS_SUCCEED',
]);

const initialState = {
  loaded: false,
  loading: false,
  filters: [
    { name: 'type', value: 'error' },
    { name: 'excp_level', value: 'all' },
    { name: 'shipmt_no', value: '' },
  ],
  shipmentlist: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
  },
  dealExcpModal: {
    visible: false,
    exception: {},
    shipmtNo: '',
  },
  exceptions: {
    totalCount: 0,
    pageSize: 9999,
    current: 1,
    data: [],
  },
  exceptionReasons: [],
};

export const { CREATE_EXCEPTION_SUCCEED, LOAD_EXCPSHIPMT, DEAL_EXCEPTION_SUCCEED } = actionTypes;
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_EXCPSHIPMT:
      return { ...state, loading: true };
    case actionTypes.LOAD_EXCPSHIPMT_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_EXCPSHIPMT_SUCCEED:
      return { ...state,
        loading: false,
        loaded: true,
        shipmentlist: action.result.data,
        filters: JSON.parse(action.params.filters),
      };
    case actionTypes.CHANGE_FILTER: {
      const filters = state.filters.filter(flt => flt.name !== action.data.field);
      if (action.data.value !== '' && action.data.value !== null && action.data.value !== undefined) {
        filters.push({ name: action.data.field, value: action.data.value });
      }
      return { ...state, filters };
    }
    case actionTypes.LOAD_EXCEPTIONS_SUCCEED:
      return { ...state, exceptions: action.result.data };
    case actionTypes.SHOW_DEAL_EXCEPTION_MODAL:
      return { ...state, dealExcpModal: action.data };
    case actionTypes.LOAD_EXCEPTION_REASONS_SUCCEED:
      return { ...state, exceptionReasons: action.result.data };
    default:
      return state;
  }
}

export function loadExcpShipments(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_EXCPSHIPMT,
        actionTypes.LOAD_EXCPSHIPMT_SUCCEED,
        actionTypes.LOAD_EXCPSHIPMT_FAIL,
      ],
      endpoint: 'v1/transport/tracking/exception/shipmts',
      method: 'get',
      params,
      cookie,
    },
  };
}

export function changeExcpFilter(field, value) {
  return {
    type: actionTypes.CHANGE_FILTER,
    data: { field, value },
  };
}

export function loadExceptions(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_EXCEPTIONS,
        actionTypes.LOAD_EXCEPTIONS_SUCCEED,
        actionTypes.LOAD_EXCEPTIONS_FAIL,
      ],
      endpoint: 'public/v1/transport/tracking/exceptions',
      method: 'get',
      params,
    },
  };
}

export function createException(dispId, excpLevel, type, typeName, remark, exception, tenantId, tenantName, loginId, loginName) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_EXCEPTION,
        actionTypes.CREATE_EXCEPTION_SUCCEED,
        actionTypes.CREATE_EXCEPTION_FAIL,
      ],
      endpoint: 'v1/transport/tracking/exception',
      method: 'post',
      data: { dispId, excpLevel, type, typeName, remark, exception, tenantId, tenantName, loginId, loginName },
    },
  };
}

export function showDealExcpModal({ visible, shipmtNo = '', exception = {} }) {
  return {
    type: actionTypes.SHOW_DEAL_EXCEPTION_MODAL,
    data: { visible, shipmtNo, exception },
  };
}

export function dealException({ shipmtNo, excpId, solution, solver }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DEAL_EXCEPTION,
        actionTypes.DEAL_EXCEPTION_SUCCEED,
        actionTypes.DEAL_EXCEPTION_FAIL,
      ],
      endpoint: 'v1/transport/tracking/dealException',
      method: 'post',
      data: { shipmtNo, excpId, solution, solver },
    },
  };
}

export function loadExceptionReasons(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_EXCEPTION_REASONS,
        actionTypes.LOAD_EXCEPTION_REASONS_SUCCEED,
        actionTypes.LOAD_EXCEPTION_REASONS_FAIL,
      ],
      endpoint: 'v1/transport/tracking/exception/reasons',
      method: 'get',
      params: { tenantId },
    },
  };
}
