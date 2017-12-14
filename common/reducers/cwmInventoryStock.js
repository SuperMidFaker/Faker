import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/inventory/stock/', [
  'LOAD_STOCKS', 'LOAD_STOCKS_SUCCEED', 'LOAD_STOCKS_FAIL',
  'CHANGE_SEARCH_TYPE',
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
    product_no: null,
    whse_code: '',
    owner: '',
    whse_location: '',
    search_type: 2,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_STOCKS:
      return {
        ...state,
        loading: true,
        listFilter: JSON.parse(action.params.filter),
      };
    case actionTypes.LOAD_STOCKS_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_STOCKS_SUCCEED:
      return { ...state, list: action.result.data, loading: false };
    case actionTypes.CHANGE_SEARCH_TYPE:
      return { ...state, list: initialState.list, listFilter: { ...state.listFilter, search_type: action.value } };
    default:
      return state;
  }
}

export function loadStocks(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_STOCKS,
        actionTypes.LOAD_STOCKS_SUCCEED,
        actionTypes.LOAD_STOCKS_FAIL,
      ],
      endpoint: 'v1/cwm/inventory/stock',
      method: 'get',
      params,
    },
  };
}

export function changeSearchType(value) {
  return {
    type: actionTypes.CHANGE_SEARCH_TYPE,
    value,
  };
}
