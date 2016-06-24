import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/declaration/', [
  'LOAD_DELGLIST', 'LOAD_DELGLIST_SUCCEED', 'LOAD_DELGLIST_FAIL',
  'LOAD_BILL', 'LOAD_BILL_SUCCEED', 'LOAD_BILL_FAIL',
]);

const initialState = {
  delgList: {
    loaded: false,
    loading: false,
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: [],
  },
  listFilter: {
    declareType: '',
    name: '',
    sortField: '',
    sortOrder: '',
  },
  billHead: {
  },
  billBody: {
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_DELGLIST:
      return { ...state, delgList: { ...state.delgList, loading: true }};
    case actionTypes.LOAD_DELGLIST_SUCCEED:
      return { ...state,
        listFilter: JSON.parse(action.params.filter),
        delgList: {
        ...state.delgList, loaded: true,
        loading: false, ...action.result.data,
      }};
    case actionTypes.LOAD_DELGLIST_FAIL:
      return { ...state, delgList: { ...state.delgList, loading: false }};
    case actionTypes.LOAD_BILL_SUCCEED:
      return { ...state, billHead: { ...state.billHead, ...action.result.data }};
    default:
      return state;
  }
}

export function loadDelgList(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DELGLIST,
        actionTypes.LOAD_DELGLIST_SUCCEED,
        actionTypes.LOAD_DELGLIST_FAIL,
      ],
      endpoint: 'v1/cms/delegation/declares',
      method: 'get',
      params,
      cookie,
    },
  };
}

export function loadBill(cookie, delgNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILL,
        actionTypes.LOAD_BILL_SUCCEED,
        actionTypes.LOAD_BILL_FAIL,
      ],
      endpoint: 'v1/cms/declare/bill',
      method: 'get',
      params: { delgNo },
      cookie,
    },
  };
}
