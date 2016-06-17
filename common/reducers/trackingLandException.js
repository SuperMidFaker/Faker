import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/tracking/land/exception/', [
  'LOAD_EXCPSHIPMT', 'LOAD_EXCPSHIPMT_FAIL', 'LOAD_EXCPSHIPMT_SUCCEED',
]);

const initialState = {
  loaded: false,
  loading: false,
  filters: [
    { name: 'type', value : 'all' },
    /* { name: 'shipmt_no', value: ''} */
  ],
  shipmentlist: {
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
        filters: JSON.parse(action.params.filters)
    };
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
      cookie
    }
  };
}
