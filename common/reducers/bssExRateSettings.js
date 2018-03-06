import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/bss/rate/settings/', [
  'VISIBLE_NEW_Rate_MODAL',
  'LOAD_EXCHANGE_RATES', 'LOAD_EXCHANGE_RATES_SUCCEED', 'LOAD_EXCHANGE_RATES_FAIL',
  'ADD_EXCHANGE_RATE', 'ADD_EXCHANGE_RATE_SUCCEED', 'ADD_EXCHANGE_RATE_FAIL',
  'DELETE_EXCHANGE_RATE', 'DELETE_EXCHANGE_RATE_SUCCEED', 'DELETE_EXCHANGE_RATE_FAIL',
  'ALTER_EXCHANGE_RATE', 'ALTER_EXCHANGE_RATE_SUCCEED', 'ALTER_EXCHANGE_RATE_FAIL',
]);

const initialState = {
  visibleExRateModal: false,
  loading: false,
  exRateList: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  currencies: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.VISIBLE_NEW_Rate_MODAL:
      return { ...state, visibleExRateModal: action.data };
    case actionTypes.LOAD_EXCHANGE_RATES:
      return {
        ...state,
        loading: true,
      };
    case actionTypes.LOAD_EXCHANGE_RATES_SUCCEED:
      return {
        ...state,
        loading: false,
        exRateList: action.result.data.exRateList,
        currencies: action.result.data.currencies,
      };
    default:
      return state;
  }
}

export function toggleNewExRateModal(visible) {
  return {
    type: actionTypes.VISIBLE_NEW_Rate_MODAL,
    data: visible,
  };
}

export function loadExRates(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_EXCHANGE_RATES,
        actionTypes.LOAD_EXCHANGE_RATES_SUCCEED,
        actionTypes.LOAD_EXCHANGE_RATES_FAIL,
      ],
      endpoint: 'v1/bss/exchange/rate/load',
      method: 'get',
      params,
    },
  };
}

export function addExRate(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_EXCHANGE_RATE,
        actionTypes.ADD_EXCHANGE_RATE_SUCCEED,
        actionTypes.ADD_EXCHANGE_RATE_FAIL,
      ],
      endpoint: 'v1/bss/exchange/rate/add',
      method: 'post',
      data,
    },
  };
}

export function deleteExRate(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_EXCHANGE_RATE,
        actionTypes.DELETE_EXCHANGE_RATE_SUCCEED,
        actionTypes.DELETE_EXCHANGE_RATE_FAIL,
      ],
      endpoint: 'v1/bss/exchange/rate/delete',
      method: 'post',
      data: { id },
    },
  };
}

export function alterExRateVal(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ALTER_EXCHANGE_RATE,
        actionTypes.ALTER_EXCHANGE_RATE_SUCCEED,
        actionTypes.ALTER_EXCHANGE_RATE_FAIL,
      ],
      endpoint: 'v1/bss/exchange/rate/alter',
      method: 'post',
      data,
    },
  };
}
