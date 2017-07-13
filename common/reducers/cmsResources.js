import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/resources/', [
  'LOAD_BUSINESS_UNITS', 'LOAD_BUSINESS_UNITS_SUCCEED', 'LOAD_BUSINESS_UNITS_FAIL',
  'ADD_BUSINESS_UNIT', 'ADD_BUSINESS_UNIT_SUCCEED', 'ADD_BUSINESS_UNIT_FAIL',
  'UPDATE_BUSINESS_UNIT', 'UPDATE_BUSINESS_UNIT_SUCCEED', 'UPDATE_BUSINESS_UNIT_FAIL',
  'DELETE_BUSINESS_UNIT', 'DELETE_BUSINESS_UNIT_SUCCEED', 'DELETE_BUSINESS_UNIT_FAIL',
  'TOGGLE_BUSINESS_UNIT', 'SET_RES_TABKEY',
]);

const initialState = {
  loaded: true,
  loading: false,
  businessUnits: [],
  businessUnitModal: {
    visible: false,
    businessUnit: {},
  },
  tabkey: 'owners',
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_BUSINESS_UNITS_SUCCEED:
      return { ...state, businessUnits: action.result.data, loading: false, loaded: true };
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
    default:
      return state;
  }
}

export function loadBusinessUnits(cookie, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BUSINESS_UNITS,
        actionTypes.LOAD_BUSINESS_UNITS_SUCCEED,
        actionTypes.LOAD_BUSINESS_UNITS_FAIL,
      ],
      endpoint: 'v1/cms/resources/business_units',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function addBusinessUnit(name, code, customsCode, type, ieType, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_BUSINESS_UNIT,
        actionTypes.ADD_BUSINESS_UNIT_SUCCEED,
        actionTypes.ADD_BUSINESS_UNIT_FAIL,
      ],
      endpoint: 'v1/cms/resources/business_unit/add',
      method: 'post',
      data: { name, code, customsCode, type, ieType, tenantId },
    },
  };
}

export function updateBusinessUnit(id, name, code, customsCode, ieType) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_BUSINESS_UNIT,
        actionTypes.UPDATE_BUSINESS_UNIT_SUCCEED,
        actionTypes.UPDATE_BUSINESS_UNIT_FAIL,
      ],
      endpoint: 'v1/cms/resources/business_unit/update',
      method: 'post',
      data: { id, name, code, customsCode, ieType },
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
