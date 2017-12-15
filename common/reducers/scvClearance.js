import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scv/clearance/', [
  'LOAD_MANIFESTS', 'LOAD_MANIFESTS_SUCCEED', 'LOAD_MANIFESTS_FAIL',
  'LOAD_MANIFESTTP', 'LOAD_MANIFESTTP_SUCCEED', 'LOAD_MANIFESTTP_FAIL',
  'LOAD_CUSTOMS', 'LOAD_CUSTOMS_SUCCEED', 'LOAD_CUSTOMS_FAIL',
  'LOAD_CUSTOMSRES', 'LOAD_CUSTOMSRES_SUCCEED', 'LOAD_CUSTOMSRES_FAIL',
  'CLEAN_CUSTOMSRES',
]);

const initialState = {
  manifestLoading: false,
  customsDeclLoading: false,
  manifestFilters: { ietype: 'all', status: 'all' },
  customsFilters: { ietype: 'all', status: 'all' },
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
  manifestParams: { customs: [], tradeModes: [], transModes: [] },
  customsDeclParams: { customs: [] },
  customsResults: [],
  customsResultsLoading: false,
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_MANIFESTS:
      return {
        ...state,
        manifestFilters: JSON.parse(action.params.filter),
        manifestList: { ...state.manifestList, manifestLoading: true },
      };
    case actionTypes.LOAD_MANIFESTS_FAIL:
      return { ...state, manifestList: { ...state.manifestList, manifestLoading: false } };
    case actionTypes.LOAD_MANIFESTS_SUCCEED:
      return {
        ...state,
        manifestList: { ...state.manifestList, manifestLoading: false, ...action.result.data },
        formRequire: action.result.data.formRequire,
      };
    case actionTypes.LOAD_MANIFESTTP_SUCCEED:
      return { ...state, manifestParams: action.result.data };
    case actionTypes.LOAD_CUSTOMS:
      return {
        ...state,
        customsFilters: JSON.parse(action.params.filter),
        manifestList: { ...state.customsList, customsDeclLoading: true },
      };
    case actionTypes.LOAD_CUSTOMS_SUCCEED:
      return {
        ...state,
        customsList: { ...state.customsList, customsDeclLoading: false, ...action.result.data },
        customsDeclParams: { ...state.customsDeclParams, customs: action.result.data.customs },
      };
    case actionTypes.LOAD_CUSTOMSRES:
      return { ...state, customsResultsLoading: true };
    case actionTypes.LOAD_CUSTOMSRES_SUCCEED:
      return { ...state, customsResultsLoading: false, customsResults: action.result.data };
    case actionTypes.LOAD_CUSTOMSRES_FAIL:
      return { ...state, customsResultsLoading: false };
    case actionTypes.CLEAN_CUSTOMSRES:
      return { ...state, customsResults: [] };
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

export function loadManifestTableParams() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_MANIFESTTP,
        actionTypes.LOAD_MANIFESTTP_SUCCEED,
        actionTypes.LOAD_MANIFESTTP_FAIL,
      ],
      endpoint: 'v1/cms/manifests/table/params',
      method: 'get',
    },
  };
}

export function loadCustomsDecls(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CUSTOMS,
        actionTypes.LOAD_CUSTOMS_SUCCEED,
        actionTypes.LOAD_CUSTOMS_FAIL,
      ],
      endpoint: 'v1/scv/decl/customs',
      method: 'get',
      params,
    },
  };
}

export function loadClearanceResults(entryId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CUSTOMSRES,
        actionTypes.LOAD_CUSTOMSRES_SUCCEED,
        actionTypes.LOAD_CUSTOMSRES_FAIL,
      ],
      endpoint: 'v1/cms/customs/results',
      method: 'get',
      params: { entryId },
    },
  };
}

export function clearClearanceResults() {
  return { type: actionTypes.CLEAN_CUSTOMSRES };
}
