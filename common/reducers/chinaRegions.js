import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
const initialState = {
  provLoaded: false,
  provinces: [],
  cities: [],
  districts: [],
  streets: [],
};

const actions = [
  'PROV_LOAD', 'PROV_LOAD_SUCCEED', 'PROV_LOAD_FAIL',
  'CITY_LOAD', 'CITY_LOAD_SUCCEED', 'CITY_LOAD_FAIL',
];
const domain = '@@welogix/chinaRegions/';
const actionTypes = createActionTypes(domain, actions);

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.PROV_LOAD_SUCCEED:
      return { ...state, provLoaded: true, provinces: action.result.data };
    case actionTypes.CITY_LOAD_SUCCEED:
      return { ...state, cities: action.result.data };
    case actionTypes.DISTRICT_LOAD_SUCCEED:
      return { ...state, districts: action.result.data };
    case actionTypes.STREET_LOAD_SUCCEED:
      return { ...state, streets: action.result.data };
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

export function loadCities(province) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.CITY_LOAD, actionTypes.CITY_LOAD_SUCCEED, actionTypes.CITY_LOAD_FAIL],
      endpoint: 'v1/china/region/cities',
      method: 'get',
      params: { province },
    },
  };
}
