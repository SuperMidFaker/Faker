import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/params/', [
  'LOAD_CURRENCIES', 'LOAD_CURRENCIES_SUCCEED', 'LOAD_CURRENCIES_FAIL',
  'LOAD_COUNTRIES', 'LOAD_COUNTRIES_SUCCEED', 'LOAD_COUNTRIES_FAIL',
  'LOAD_TRXN_MODES', 'LOAD_TRXN_MODES_SUCCEED', 'LOAD_TRXN_MODES_FAIL',
  'LOAD_TRANS_MODES', 'LOAD_TRANS_MODES_SUCCEED', 'LOAD_TRANS_MODES_FAIL',
  'LOAD_UNITS', 'LOAD_UNITS_SUCCEED', 'LOAD_UNITS_FAIL',
  'LOAD_PARAMS', 'LOAD_PARAMS_SUCCEED', 'LOAD_PARAMS_FAIL',
]);

const initialState = {
  currencies: [],
  countries: [],
  trxnModes: [],
  transModes: [],
  units: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_CURRENCIES_SUCCEED:
      return { ...state, currencies: action.result.data };
    case actionTypes.LOAD_COUNTRIES_SUCCEED:
      return { ...state, countries: action.result.data };
    case actionTypes.LOAD_TRXN_MODES_SUCCEED:
      return { ...state, trxnModes: action.result.data };
    case actionTypes.LOAD_TRANS_MODES_SUCCEED:
      return { ...state, transModes: action.result.data };
    case actionTypes.LOAD_UNITS_SUCCEED:
      return { ...state, units: action.result.data };
    case actionTypes.LOAD_PARAMS_SUCCEED:
      return {
        ...state,
        currencies: action.result.data.currencies,
        countries: action.result.data.countries,
        trxnModes: action.result.data.trxnModes,
        transModes: action.result.data.transModes,
        units: action.result.data.units,
      };
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

export function loadTrxnMode() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRXN_MODES,
        actionTypes.LOAD_TRXN_MODES_SUCCEED,
        actionTypes.LOAD_TRXN_MODES_FAIL,
      ],
      endpoint: 'v1/cms/params/trxn/modes/load',
      method: 'get',
    },
  };
}

export function loadTransModes() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRANS_MODES,
        actionTypes.LOAD_TRANS_MODES_SUCCEED,
        actionTypes.LOAD_TRANS_MODES_FAIL,
      ],
      endpoint: 'v1/cms/params/trans/modes/load',
      method: 'get',
    },
  };
}

export function loadUnits() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_UNITS,
        actionTypes.LOAD_UNITS_SUCCEED,
        actionTypes.LOAD_UNITS_FAIL,
      ],
      endpoint: 'v1/cms/params/units/load',
      method: 'get',
    },
  };
}

export function loadParams() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARAMS,
        actionTypes.LOAD_PARAMS_SUCCEED,
        actionTypes.LOAD_PARAMS_FAIL,
      ],
      endpoint: 'v1/cms/params/load',
      method: 'get',
    },
  };
}

