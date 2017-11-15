import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/saas/lineadaptor/', [
  'LOAD_ADAPTORS', 'LOAD_ADAPTORS_SUCCEED', 'LOAD_ADAPTORS_FAIL',
  'LOAD_ADAPTOR', 'LOAD_ADAPTOR_SUCCEED', 'LOAD_ADAPTOR_FAIL',
  'ADD_ADAPTOR', 'ADD_ADAPTOR_SUCCEED', 'ADD_ADAPTOR_FAIL',
  'UPDATE_COLFD', 'UPDATE_COLFD_SUCCEED', 'UPDATE_COLFD_FAIL',
  'DEL_ADAPTOR', 'DEL_ADAPTOR_SUCCEED', 'DEL_ADAPTOR_FAIL',
]);

const initState = {
  loadingAdaptors: false,
  adaptors: [],
  loadingAdaptor: false,
  adaptor: { name: '', columns: [] },
};

export default function reducer(state = initState, action) {
  switch (action.type) {
    case actionTypes.LOAD_ADAPTORS:
      return { ...state, loadingAdaptors: true, adaptors: [] };
    case actionTypes.LOAD_ADAPTORS_SUCCEED:
      return { ...state, loadingAdaptors: false, adaptors: action.result.data };
    case actionTypes.LOAD_ADAPTORS_FAIL:
      return { ...state, loadingAdaptors: false };
    case actionTypes.LOAD_ADAPTOR:
      return { ...state, loadingAdaptors: true, adaptor: initState.adaptor };
    case actionTypes.LOAD_ADAPTOR_SUCCEED:
      return { ...state, loadingAdaptors: false, adaptor: action.result.data };
    case actionTypes.LOAD_ADAPTOR_FAIL:
      return { ...state, loadingAdaptors: false };
    default:
      return state;
  }
}

export function loadAdaptors(ownerPid, models, active) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ADAPTORS,
        actionTypes.LOAD_ADAPTORS_SUCCEED,
        actionTypes.LOAD_ADAPTORS_FAIL,
      ],
      endpoint: 'v1/saas/linefile/adaptors',
      method: 'get',
      params: { ownerPid, models: JSON.stringify(models), active },
    },
  };
}

export function loadAdaptor(code) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ADAPTOR,
        actionTypes.LOAD_ADAPTOR_SUCCEED,
        actionTypes.LOAD_ADAPTOR_FAIL,
      ],
      endpoint: 'v1/saas/linefile/adaptor',
      method: 'get',
      params: { code },
    },
  };
}

export function addAdaptor(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_ADAPTOR,
        actionTypes.ADD_ADAPTOR_SUCCEED,
        actionTypes.ADD_ADAPTOR_FAIL,
      ],
      endpoint: 'v1/saas/linefile/create/adaptor',
      method: 'post',
      data,
    },
  };
}

export function updateColumnField(columnId, field) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_COLFD,
        actionTypes.UPDATE_COLFD_SUCCEED,
        actionTypes.UPDATE_COLFD_FAIL,
      ],
      endpoint: 'v1/saas/linefile/update/col/field',
      method: 'post',
      data: { columnId, field },
    },
  };
}

export function delAdaptor(code) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DEL_ADAPTOR,
        actionTypes.DEL_ADAPTOR_SUCCEED,
        actionTypes.DEL_ADAPTOR_FAIL,
      ],
      endpoint: 'v1/saas/linefile/del/adaptor',
      method: 'post',
      data: { code },
    },
  };
}
