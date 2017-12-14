import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/resources/', [
  'LOAD_BUSINESS_UNITS', 'LOAD_BUSINESS_UNITS_SUCCEED', 'LOAD_BUSINESS_UNITS_FAIL',
  'ADD_BUSINESS_UNIT', 'ADD_BUSINESS_UNIT_SUCCEED', 'ADD_BUSINESS_UNIT_FAIL',
  'UPDATE_BUSINESS_UNIT', 'UPDATE_BUSINESS_UNIT_SUCCEED', 'UPDATE_BUSINESS_UNIT_FAIL',
  'DELETE_BUSINESS_UNIT', 'DELETE_BUSINESS_UNIT_SUCCEED', 'DELETE_BUSINESS_UNIT_FAIL',
  'TOGGLE_BUSINESS_UNIT', 'SET_RES_TABKEY', 'SET_CUSTOMER',
  'TOGGLE_UNIT_RULE_SET',
  'LOAD_BUSINESS_UNITS_USERS', 'LOAD_BUSINESS_UNITS_USERS_SUCCEED', 'LOAD_BUSINESS_UNITS_USERS_FAIL',
  'ADD_TRADE_USER', 'ADD_TRADE_USER_SUCCEED', 'ADD_TRADE_USER_FAIL',
  'DELETE_TRADE_USER', 'DELETE_TRADE_USER_SUCCEED', 'DELETE_TRADE_USER_FAIL',
  'LOAD_BROKERS', 'LOAD_BROKERS_SUCCEED', 'LOAD_BROKERS_FAIL',
]);

const initialState = {
  loaded: true,
  loading: false,
  businessUnits: [],
  businessUnitModal: {
    visible: false,
    businessUnit: {},
  },
  customer: {},
  tabkey: 'owners',
  unitRuleSetModal: {
    visible: false,
    relationId: null,
  },
  businessUnitUsers: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_BUSINESS_UNITS_SUCCEED:
      return {
        ...state, businessUnits: action.result.data, loading: false, loaded: true,
      };
    case actionTypes.ADD_BUSINESS_UNIT_SUCCEED: {
      const businessUnits = [...state.businessUnits];
      businessUnits.unshift(action.result.data);
      return { ...state, businessUnits };
    }
    case actionTypes.UPDATE_BUSINESS_UNIT_SUCCEED:
      return { ...state, loading: true, loaded: false };
    case actionTypes.DELETE_BUSINESS_UNIT_SUCCEED:
      return { ...state, loading: true, loaded: false };
    case actionTypes.TOGGLE_BUSINESS_UNIT: {
      return { ...state, businessUnitModal: { ...state.businessUnitModal, ...action.data } };
    }
    case actionTypes.SET_RES_TABKEY:
      return { ...state, tabkey: action.data.key };
    case actionTypes.SET_CUSTOMER:
      return { ...state, customer: action.data.customer };
    case actionTypes.TOGGLE_UNIT_RULE_SET:
      return { ...state, unitRuleSetModal: { ...state.unitRuleSetModal, ...action.data } };
    case actionTypes.LOAD_BUSINESS_UNITS_USERS_SUCCEED:
      return { ...state, businessUnitUsers: action.result.data };
    default:
      return state;
  }
}

export function loadBusinessUnits(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BUSINESS_UNITS,
        actionTypes.LOAD_BUSINESS_UNITS_SUCCEED,
        actionTypes.LOAD_BUSINESS_UNITS_FAIL,
      ],
      endpoint: 'v1/cms/resources/business_units',
      method: 'get',
      params,
    },
  };
}

export function addBusinessUnit(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_BUSINESS_UNIT,
        actionTypes.ADD_BUSINESS_UNIT_SUCCEED,
        actionTypes.ADD_BUSINESS_UNIT_FAIL,
      ],
      endpoint: 'v1/cms/resources/business_unit/add',
      method: 'post',
      data,
    },
  };
}

export function updateBusinessUnit(id, name, code, customsCode, ciqCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_BUSINESS_UNIT,
        actionTypes.UPDATE_BUSINESS_UNIT_SUCCEED,
        actionTypes.UPDATE_BUSINESS_UNIT_FAIL,
      ],
      endpoint: 'v1/cms/resources/business_unit/update',
      method: 'post',
      data: {
        id, name, code, customsCode, ciqCode,
      },
    },
  };
}

export function deleteBusinessUnit(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_BUSINESS_UNIT,
        actionTypes.DELETE_BUSINESS_UNIT_SUCCEED,
        actionTypes.DELETE_BUSINESS_UNIT_FAIL,
      ],
      endpoint: 'v1/cms/resources/business_unit/delete',
      method: 'post',
      data: { id },
    },
  };
}

export function toggleBusinessUnitModal(visible, operation, businessUnit = {}) {
  return {
    type: actionTypes.TOGGLE_BUSINESS_UNIT,
    data: { visible, operation, businessUnit },
  };
}

export function setResTabkey(key) {
  return {
    type: actionTypes.SET_RES_TABKEY,
    data: { key },
  };
}

export function setCustomer(customer) {
  return {
    type: actionTypes.SET_CUSTOMER,
    data: { customer },
  };
}

export function toggleUnitRuleSetModal(visible, relationId) {
  return {
    type: actionTypes.TOGGLE_UNIT_RULE_SET,
    data: { visible, relationId },
  };
}

export function loadBusinessUnitUsers(relationId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BUSINESS_UNITS_USERS,
        actionTypes.LOAD_BUSINESS_UNITS_USERS_SUCCEED,
        actionTypes.LOAD_BUSINESS_UNITS_USERS_FAIL,
      ],
      endpoint: 'v1/cms/resources/business_units/users/get',
      method: 'get',
      params: { relationId },
    },
  };
}

export function loadBrokers(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BROKERS,
        actionTypes.LOAD_BROKERS_SUCCEED,
        actionTypes.LOAD_BROKERS_FAIL,
      ],
      endpoint: 'v1/cooperation/partners',
      method: 'get',
      params,
    },
  };
}

export function addTradeUser(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_TRADE_USER,
        actionTypes.ADD_TRADE_USER_SUCCEED,
        actionTypes.ADD_TRADE_USER_FAIL,
      ],
      endpoint: 'v1/cms/resources/business_units/user/add',
      method: 'post',
      data,
    },
  };
}

export function deleteTradeUser(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_TRADE_USER,
        actionTypes.DELETE_TRADE_USER_SUCCEED,
        actionTypes.DELETE_TRADE_USER_FAIL,
      ],
      endpoint: 'v1/cms/resources/business_units/user/delete',
      method: 'post',
      data: { id },
    },
  };
}
