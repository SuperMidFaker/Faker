import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/sku/', [
  'LOAD_WHSKU', 'LOAD_WHSKU_SUCCEED', 'LOAD_WHSKU_FAIL',
  'LOAD_OWNSKU', 'LOAD_OWNSKU_SUCCEED', 'LOAD_OWNSKU_FAIL',
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
    sku: '',
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_WHSKU:
    case actionTypes.LOAD_OWNSKU:
      return { ...state, listFilter: JSON.parse(action.params.filter),
        sortFilter: JSON.parse(action.params.sorter), loading: true };
    case actionTypes.LOAD_WHSKU_SUCCEED:
    case actionTypes.LOAD_OWNSKU_SUCCEED:
      return { ...state, loading: false, list: action.result.data };
    case actionTypes.LOAD_WHSKU_FAIL:
    case actionTypes.LOAD_OWNSKU_FAIL:
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function loadSkusByWarehouse(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_WHSKU,
        actionTypes.LOAD_WHSKU_SUCCEED,
        actionTypes.LOAD_WHSKU_FAIL,
      ],
      endpoint: 'v1/cwm/warehouse/skus',
      method: 'get',
      params,
    },
  };
}

export function loadSkusByOwner(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_OWNSKU,
        actionTypes.LOAD_OWNSKU_SUCCEED,
        actionTypes.LOAD_OWNSKU_FAIL,
      ],
      endpoint: 'v1/cwm/owner/skus',
      method: 'get',
      params,
    },
  };
}
