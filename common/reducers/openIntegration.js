import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/open/integration/', [
  'LOAD_INSTALLED', 'LOAD_INSTALLED_SUCCEED', 'LOAD_INSTALLED_FAIL',
]);

const initialState = {
  loading: false,
  list: {
    totalCount: 0,
    current: 1,
    pageSize: 10,
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
    case actionTypes.LOAD_INSTALLED:
      return { ...state, listFilter: JSON.parse(action.params.filter),
        sortFilter: JSON.parse(action.params.sorter), loading: true };
    case actionTypes.LOAD_INSTALLED_SUCCEED:
      return { ...state, loading: false, list: action.result.data };
    case actionTypes.LOAD_INSTALLED_FAIL:
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function loadInstalledApps(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_INSTALLED,
        actionTypes.LOAD_INSTALLED_SUCCEED,
        actionTypes.LOAD_INSTALLED_FAIL,
      ],
      endpoint: 'v1/platform/integration/installed',
      method: 'get',
      params,
    },
  };
}
