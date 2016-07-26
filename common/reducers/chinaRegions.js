import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
const initialState = {
  provLoaded: false,
  provinces: [],
};

const actions = [
  'PROV_LOAD', 'PROV_LOAD_SUCCEED', 'PROV_LOAD_FAIL',
  'REGIONCHILD_LOAD', 'REGIONCHILD_LOAD_SUCCEED', 'REGIONCHILD_LOAD_FAIL',
  'REGIONLIST_LOAD', 'REGIONLIST_LOAD_SUCCEED', 'REGIONLIST_LOAD_FAIL',
];
const domain = '@@welogix/chinaRegions/';
const actionTypes = createActionTypes(domain, actions);

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.PROV_LOAD_SUCCEED:
      return { ...state, provLoaded: true, provinces: action.result.data };
    default:
      return state;
  }
}

export function loadProvinces() {
  return {
    [CLIENT_API]: {
      types: [actionTypes.PROV_LOAD, actionTypes.PROV_LOAD_SUCCEED, actionTypes.PROV_LOAD_FAIL],
      endpoint: 'v1/china/region/provinces',
      method: 'get',
    },
  };
}

export function loadRegionChildren(parentId) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.REGIONCHILD_LOAD, actionTypes.REGIONCHILD_LOAD_SUCCEED, actionTypes.REGIONCHILD_LOAD_FAIL],
      endpoint: 'v1/china/region/children',
      method: 'get',
      params: { parentId },
    },
  };
}

export function loadNextRegionList(province, city, district) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.REGIONLIST_LOAD, actionTypes.REGIONLIST_LOAD_SUCCEED, actionTypes.REGIONLIST_LOAD_FAIL],
      endpoint: 'v1/china/region/nextlists',
      method: 'get',
      params: { province, city, district },
    },
  };
}
