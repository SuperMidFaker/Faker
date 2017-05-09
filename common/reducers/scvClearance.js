import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scv/clearance/', [
  'LOAD_MANIFESTS', 'LOAD_MANIFESTS_SUCCEED', 'LOAD_MANIFESTS_FAIL',
]);

const initialState = {
  manifestLoading: false,
  customsDeclLoading: false,
  manifestFilters: { ietype: 'import', status: 'all' },
  customsFilters: { ietype: 'import', status: 'all' },
  manifestList: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  customsList: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_MANIFESTS:
      return { ...state, manifestFilters: JSON.parse(action.params.filter),
        manifestList: { ...state.manifestList, manifestLoading: true } };
    case actionTypes.LOAD_MANIFESTS_FAIL:
      return { ...state, manifestList: { ...state.manifestList, manifestLoading: false } };
    case actionTypes.LOAD_MANIFESTS_SUCCEED:
      return { ...state, manifestList: { ...state.manifestList, manifestLoading: false, ...action.result.data },
        formRequire: action.result.data.formRequire };
    default:
      return state;
  }
}

export function loadManifests(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_MANIFESTS,
        actionTypes.LOAD_MANIFESTS_SUCCEED,
        actionTypes.LOAD_MANIFESTS_FAIL,
      ],
      endpoint: 'v1/scv/manifests',
      method: 'get',
      params,
    },
  };
}
