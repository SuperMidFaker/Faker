import { CLIENT_API } from 'reusable/redux-middlewares/api';
import { createActionTypes } from 'reusable/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/dispatch/',
  ['LOAD_APTSHIPMENT', 'LOAD_APTSHIPMENT_FAIL', 'LOAD_APTSHIPMENT_SUCCEED']);

const initialState = {
  loaded: false,
  loading: false,
  filters: {
    status: 'waiting',
    type: 'subline',
    typeConsignorStep: 20,
    typeConsigneeStep: 20
  },
  shipmentlist: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: [],
  }
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_APTSHIPMENT:
      return { ...state, loading: true};
    case actionTypes.LOAD_APTSHIPMENT_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_APTSHIPMENT_SUCCEED:
      return { ...state, loading: false,
        loaded: true, shipmentlist: action.result.data,
        filters: JSON.parse(action.params.filters)};
    default:
      return state;
  }
}

export function loadTable(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_APTSHIPMENT,
        actionTypes.LOAD_APTSHIPMENT_SUCCEED,
        actionTypes.LOAD_APTSHIPMENT_FAIL,
      ],
      endpoint: 'v1/transport/dispatch/shipmts',
      method: 'get',
      params,
      cookie
    }
  };
}
