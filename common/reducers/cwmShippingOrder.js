import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/shipping/', [
  'ADD_SO', 'ADD_SO_SUCCEED', 'ADD_SO_FAIL',
  'LOAD_SOS', 'LOAD_SOS_SUCCEED', 'LOAD_SOS_FAIL',
  'GET_SO', 'GET_SO_SUCCEED', 'GET_SO_FAIL',
  'UPDATE_SO', 'UPDATE_SO_SUCCEED', 'UPDATE_SO_FAIL',
]);

const initialState = {
  solist: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
  },
  soFilters: { status: 'pending', ownerCode: 'all' },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_SOS:
      return { ...state, soFilters: JSON.parse(action.params.filters) };
    case actionTypes.LOAD_SOS_SUCCEED:
      return { ...state, solist: action.result.data };
    default:
      return state;
  }
}

export function addSo(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_SO,
        actionTypes.ADD_SO_SUCCEED,
        actionTypes.ADD_SO_FAIL,
      ],
      endpoint: 'v1/cwm/shipping/so/add',
      method: 'post',
      data,
    },
  };
}

export function loadSos({ whseCode, pageSize, current, filters }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SOS,
        actionTypes.LOAD_SOS_SUCCEED,
        actionTypes.LOAD_SOS_FAIL,
      ],
      endpoint: 'v1/cwm/shipping/sos/load',
      method: 'get',
      params: { whseCode, pageSize, current, filters: JSON.stringify(filters) },
    },
  };
}

export function getSo(soNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GET_SO,
        actionTypes.GET_SO_SUCCEED,
        actionTypes.GET_SO_FAIL,
      ],
      endpoint: 'v1/cwm/shipping/so/get',
      method: 'get',
      params: { soNo },
    },
  };
}

export function updateSo(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_SO,
        actionTypes.UPDATE_SO_SUCCEED,
        actionTypes.UPDATE_SO_FAIL,
      ],
      endpoint: 'v1/cwm/shipping/so/update',
      method: 'post',
      data,
    },
  };
}
