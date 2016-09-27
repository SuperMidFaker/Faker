import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scv/inbound/', [
  'LOAD_INBOUND', 'LOAD_INBOUND_SUCCEED', 'LOAD_INBOUND_FAIL',
]);

const initialState = {
  loading: false,
  list: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
    data: [],
  },
  listFilter: {
    sortField: '',
    sortOrder: '',
    status: 'all',
  },
  sendModal: {
    entryHeadId: -1,
    billSeqNo: '',
    delgNo: '',
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_INBOUND:
      return { ...state, loading: true, listFilter: JSON.parse(action.params.filter) };
    case actionTypes.LOAD_INBOUND_SUCCEED:
      return { ...state, loading: false, list: action.result.data };
    case actionTypes.LOAD_INBOUND_FAIL:
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function loadInbounds(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_INBOUND,
        actionTypes.LOAD_INBOUND_SUCCEED,
        actionTypes.LOAD_INBOUND_FAIL,
      ],
      endpoint: 'v1/scv/inbounds',
      method: 'get',
      params,
    },
  };
}
