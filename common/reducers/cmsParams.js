import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/params/', [
  'LOAD_CURRENCIES', 'LOAD_CURRENCIES_SUCCEED', 'LOAD_CURRENCIES_FAIL',
  'LOAD_COUNTRIES', 'LOAD_COUNTRIES_SUCCEED', 'LOAD_COUNTRIES_FAIL',
]);

const initialState = {
  currencies: [],
  countries: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_CURRENCIES_SUCCEED:
      return { ...state, currencies: action.result.data };
    case actionTypes.LOAD_COUNTRIES_SUCCEED:
      return { ...state, countries: action.result.data };
    default:
      return state;
  }
}

export function loadCurrencies() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CURRENCIES,
        actionTypes.LOAD_CURRENCIES_SUCCEED,
        actionTypes.LOAD_CURRENCIES_FAIL,
      ],
      endpoint: 'v1/cms/params/currencies/load',
      method: 'get',
    },
  };
}

export function loadCountries() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_COUNTRIES,
        actionTypes.LOAD_COUNTRIES_SUCCEED,
        actionTypes.LOAD_COUNTRIES_FAIL,
      ],
      endpoint: 'v1/cms/params/countries/load',
      method: 'get',
    },
  };
}

