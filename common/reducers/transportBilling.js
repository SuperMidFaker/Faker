import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/billing/', [
  'UPDATE_BILLING',
  'LOAD_PARTNERS', 'LOAD_PARTNERS_SUCCEED', 'LOAD_PARTNERS_FAIL',
  'LOAD_FEES', 'LOAD_FEES_SUCCEED', 'LOAD_FEES_FAIL',
]);

const initialState = {
  fees: {
    pageSize: 10,
    currentPage: 1,
    totalCount: 0,
    data: [],
  },
  billings: {
    pageSize: 10,
    currentPage: 1,
    data: [],
  },
  billing: {
    beginDate: new Date(),
    endDate: new Date(),
    name: '',
    chooseModel: '',
    partnerId: -1,
    partnerName: '',
  },
  billingFees: {
    pageSize: 10,
    currentPage: 1,
    data: [],
  },
  partners: [],
};


export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.UPDATE_BILLING:
      return { ...state, billing: { ...state.billing, ...action.billing } };
    case actionTypes.LOAD_PARTNERS_SUCCEED:
      return { ...state, partners: action.result.data };
    case actionTypes.LOAD_FEES_SUCCEED:
      return { ...state, fees: action.result.data };
    default:
      return state;
  }
}

export function updateBilling(billing) {
  return { type: actionTypes.UPDATE_BILLING, billing };
}

export function loadPartners(tenantId, typeCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARTNERS,
        actionTypes.LOAD_PARTNERS_SUCCEED,
        actionTypes.LOAD_PARTNERS_FAIL,
      ],
      endpoint: 'v1/cooperation/type/partners',
      method: 'get',
      params: { tenantId, typeCode },
    },
  };
}

export function loadFees({ tenantId, pageSize, currentPage }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FEES,
        actionTypes.LOAD_FEES_SUCCEED,
        actionTypes.LOAD_FEES_FAIL,
      ],
      endpoint: 'v1/transport/fees',
      method: 'get',
      params: { tenantId, pageSize, currentPage },
    },
  };
}
