import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/tracking/land/exception/', [
  'LOAD_EXCPSHIPMT', 'LOAD_EXCPSHIPMT_FAIL', 'LOAD_EXCPSHIPMT_SUCCEED',
  'LOAD_EXCEPTIONS', 'LOAD_EXCEPTIONS_FAIL', 'LOAD_EXCEPTIONS_SUCCEED',
  'ADD_EXCEPTION', 'ADD_EXCEPTION_FAIL', 'ADD_EXCEPTION_SUCCEED',
  'REMOVE_EXCEPTION', 'REMOVE_EXCEPTION_FAIL', 'REMOVE_EXCEPTION_SUCCEED',
  'CREATE_SPECIALCHARGE', 'CREATE_SPECIALCHARGE_FAIL', 'CREATE_SPECIALCHARGE_SUCCEED',
  'ADD_SPECIALCHARGE', 'ADD_SPECIALCHARGE_FAIL', 'ADD_SPECIALCHARGE_SUCCEED',
  'CHANGE_FILTER', 'SHOW_EXCPMODAL',
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
    pageSize: 10,
    current: 1,
    data: [],
  },
  excpModal: {
    visible: false,
    dispId: -1,
    shipmtNo: '',
  },
  exceptions: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: [],
  },
};

export const LOAD_EXCPSHIPMT_SUCCEED = actionTypes.LOAD_EXCPSHIPMT_SUCCEED;
export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_EXCPSHIPMT:
      return { ...state, loading: true };
    case actionTypes.LOAD_EXCPSHIPMT_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_EXCPSHIPMT_SUCCEED:
      return { ...state, loading: false,
        loaded: true, shipmentlist: action.result.data,
        filters: JSON.parse(action.params.filters),
    };
    case actionTypes.CHANGE_FILTER: {
      const filters = state.filters.filter(flt => flt.name !== action.data.field);
      if (action.data.value !== '' && action.data.value !== null && action.data.value !== undefined) {
        filters.push({ name: action.data.field, value: action.data.value });
      }
      return { ...state, filters };
    }
    case actionTypes.SHOW_EXCPMODAL:
      return { ...state, excpModal: action.data };
    case actionTypes.LOAD_EXCEPTIONS_SUCCEED:
      return { ...state, exceptions: action.result.data };
    case actionTypes.ADD_EXCEPTION_SUCCEED: {
      return { ...state };
    }
    case actionTypes.REMOVE_EXCEPTION_SUCCEED: {
      const data = [...state.exceptions.data];
      const index = data.findIndex(item => item.excp_id === action.data.excpId);
      data.splice(index, 1);
      return { ...state, exceptions: { ...state.exceptions, data } };
    }
    case actionTypes.CREATE_SPECIALCHARGE_SUCCEED: {
      return { ...state };
    }
    case actionTypes.ADD_SPECIALCHARGE_SUCCEED: {
      return { ...state };
    }
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

export function showExcpModal(dispId, shipmtNo) {
  return {
    type: actionTypes.SHOW_EXCPMODAL,
    data: { visible: true, dispId, shipmtNo },
  };
}

export function hideExcpModal() {
  return {
    type: actionTypes.SHOW_EXCPMODAL,
    data: { visible: false, dispId: -1, shipmtNo: '' },
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
      endpoint: 'v1/transport/tracking/exceptions',
      method: 'get',
      params,
    },
  };
}

export function createException({ dispId, excpLevel, type, excpEvent, submitter }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_EXCEPTION,
        actionTypes.ADD_EXCEPTION_SUCCEED,
        actionTypes.ADD_EXCEPTION_FAIL,
      ],
      endpoint: 'v1/transport/tracking/exception',
      method: 'post',
      data: { dispId, excpLevel, type, excpEvent, submitter },
    },
  };
}

export function removeException(excpId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_EXCEPTION,
        actionTypes.REMOVE_EXCEPTION_SUCCEED,
        actionTypes.REMOVE_EXCEPTION_FAIL,
      ],
      endpoint: 'v1/transport/tracking/exception',
      method: 'delete',
      data: { excpId },
    },
  };
}

export function createSpecialCharge({ dispId, excpLevel, type, excpEvent, submitter, specialCharge }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_SPECIALCHARGE,
        actionTypes.CREATE_SPECIALCHARGE_SUCCEED,
        actionTypes.CREATE_SPECIALCHARGE_FAIL,
      ],
      endpoint: 'v1/transport/tracking/createSpecialCharge',
      method: 'post',
      data: { dispId, excpLevel, type, excpEvent, submitter, specialCharge },
    },
  };
}


export function addSpecialCharge({ dispId, excpLevel, type, excpEvent, submitter, specialCharge }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_SPECIALCHARGE,
        actionTypes.ADD_SPECIALCHARGE_SUCCEED,
        actionTypes.ADD_SPECIALCHARGE_FAIL,
      ],
      endpoint: 'v1/transport/tracking/addSpecialCharge',
      method: 'post',
      data: { dispId, excpLevel, type, excpEvent, submitter, specialCharge },
    },
  };
}
