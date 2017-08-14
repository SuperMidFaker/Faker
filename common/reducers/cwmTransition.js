import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/transition/', [
  'LOAD_TRANSITIONS', 'LOAD_TRANSITIONS_SUCCEED', 'LOAD_TRANSITIONS_FAIL',
]);

const initialState = {
  loading: false,
  list: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  sortFilter: {
    field: '',
    order: '',
  },
  listFilter: {
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_TRANSITIONS:
      return { ...state,
        listFilter: JSON.parse(action.params.filter),
        sortFilter: JSON.parse(action.params.sorter),
        loading: true };
    case actionTypes.LOAD_TRANSITIONS_SUCCEED:
      return { ...state, loading: false, list: action.result.data };
    case actionTypes.LOAD_TRANSITIONS_FAIL:
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function loadTransitions(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRANSITIONS,
        actionTypes.LOAD_TRANSITIONS_SUCCEED,
        actionTypes.LOAD_TRANSITIONS_FAIL,
      ],
      endpoint: 'v1/cwm/stock/inbound/transitions',
      method: 'get',
      params,
    },
  };
}

