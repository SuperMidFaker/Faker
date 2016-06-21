import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/declaration/', [
  'LOAD_DELG', 'LOAD_DELG_SUCCEED', 'LOAD_DELG_FAIL',
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
    sortField: '',
    sortOrder: '',
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_DELG:
      return { ...state, delgList: { ...state.delgList, loading: true }};
    case actionTypes.LOAD_DELG_SUCCEED:
      return { ...state, delgList: {
        ...state.delgList, loaded: true, listFilter: JSON.parse(action.params.filter),
        loading: false, ...action.result.data
      }};
    case actionTypes.LOAD_DELG_FAIL:
      return { ...state, delgList: { ...state.delgList, loading: false }};
    default:
      return state;
  }
}

export function loadDelgList(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DELG,
        actionTypes.LOAD_DELG_SUCCEED,
        actionTypes.LOAD_DELG_FAIL,
      ],
      endpoint: 'v1/cms/delegation/declaration',
      method: 'get',
      params,
      cookie,
    },
  };
}
