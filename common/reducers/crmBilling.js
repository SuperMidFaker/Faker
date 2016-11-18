import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
import moment from 'moment';

const actionTypes = createActionTypes('@@welogix/crm/billing/', [
  'LOAD_FEES', 'LOAD_FEES_SUCCEED', 'LOAD_FEES_FAIL',
  'LOAD_PARTNERS', 'LOAD_PARTNERS_SUCCEED', 'LOAD_PARTNERS_FAIL',
  'CHANGE_FEES_FILTER',
  'TOGGLE_ADVANCECHARGE_MODAL',
]);

const sDate = new Date();
sDate.setMonth(sDate.getMonth() - 3);
const eDate = new Date();

const initialState = {
  loaded: true,
  loading: false,
  fees: {
    startDate: sDate,
    endDate: eDate,
    searchValue: '',
    pageSize: 10,
    current: 1,
    totalCount: 0,
    data: [],
    filters: {
      customer_name: [],
    },
  },
  billings: {
    searchValue: '',
    pageSize: 10,
    currentPage: 1,
    data: [],
    filters: {
      sr_name: [],
      sp_name: [],
    },
  },
  billingFees: {
    data: [],
  },
  partners: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_FEES_SUCCEED: {
      return { ...state, fees: action.result.data };
    }
    case actionTypes.LOAD_PARTNERS_SUCCEED:
      return { ...state, partners: action.result.data };
    case actionTypes.CHANGE_FEES_FILTER: {
      const fees = { ...state.fees, [action.data.key]: action.data.value };
      return { ...state, fees };
    }
    case actionTypes.TOGGLE_ADVANCECHARGE_MODAL: {
      return { ...state, advanceChargeModal: { visible: action.data.visible } };
    }
    default:
      return state;
  }
}

export function loadFees({ tenantId, pageSize, current, searchValue, filters, startDate, endDate }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FEES,
        actionTypes.LOAD_FEES_SUCCEED,
        actionTypes.LOAD_FEES_FAIL,
      ],
      endpoint: 'v1/crm/billing/fees',
      method: 'get',
      params: {
        tenantId,
        pageSize,
        current,
        searchValue,
        filters: JSON.stringify(filters),
        startDate: moment(startDate).format('YYYY-MM-DD 00:00:00'),
        endDate: moment(endDate).format('YYYY-MM-DD 23:59:59'),
      },
    },
  };
}

export function loadPartners(tenantId, typeCodes) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARTNERS,
        actionTypes.LOAD_PARTNERS_SUCCEED,
        actionTypes.LOAD_PARTNERS_FAIL,
      ],
      endpoint: 'v1/cooperation/type/partners',
      method: 'get',
      params: { tenantId, typeCodes: JSON.stringify(typeCodes) },
    },
  };
}

export function changeFeesFilter(key, value) {
  return { type: actionTypes.CHANGE_FEES_FILTER, data: { key, value } };
}

export function toggleAdvanceChargeModal(visible) {
  return { type: actionTypes.TOGGLE_ADVANCECHARGE_MODAL, data: { visible } };
}
