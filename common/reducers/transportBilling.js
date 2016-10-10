import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/billing/', [
  'UPDATE_BILLING',
  'LOAD_PARTNERS', 'LOAD_PARTNERS_SUCCEED', 'LOAD_PARTNERS_FAIL',
  'LOAD_FEES', 'LOAD_FEES_SUCCEED', 'LOAD_FEES_FAIL',
  'LOAD_FEES_BYCHOOSEMODAL', 'LOAD_FEES_BYCHOOSEMODAL_SUCCEED', 'LOAD_FEES_BYCHOOSEMODAL_FAIL',
  'LOAD_FEES_BYBILLINGID', 'LOAD_FEES_BYBILLINGID_SUCCEED', 'LOAD_FEES_BYBILLINGID_FAIL',
  'LOAD_BILLINGS', 'LOAD_BILLINGS_SUCCEED', 'LOAD_BILLINGS_FAIL',
  'CREATE_BILLING', 'CREATE_BILLING_SUCCEED', 'CREATE_BILLING_FAIL',
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
    id: -1,
    beginDate: new Date(),
    endDate: new Date(),
    name: '',
    chooseModel: '',
    partnerId: -1,
    partnerTenantId: -1,
    partnerName: '',
    spName: '',
    spTenantId: -1,
    srName: '',
    srTenantId: -1,
    cancelCharge: 0,
    freightCharge: 0,
    advanceCharge: 0,
    excpCharge: 0,
    adjustCharge: 0,
    totalCharge: 0,
  },
  billingFees: {
    pageSize: 10,
    currentPage: 1,
    totalCount: 0,
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
    case actionTypes.LOAD_FEES_BYCHOOSEMODAL_SUCCEED:
      return { ...state, billingFees: action.result.data };
    case actionTypes.LOAD_FEES_BYBILLINGID_SUCCEED: {
      const billing = action.result.data.billing;
      return { ...state, billingFees: action.result.data, billing: {
        id: billing.id,
        beginDate: billing.begin_date,
        endDate: billing.end_date,
        name: billing.name,
        chooseModel: billing.choose_model,
        spName: billing.sp_name,
        spTenantId: billing.sp_tenant_id,
        srName: billing.sr_name,
        srTenantId: billing.sr_tenant_id,
        cancelCharge: billing.cancel_charge,
        freightCharge: billing.freight_charge,
        advanceCharge: billing.advance_charge,
        excpCharge: billing.excp_charge,
        adjustCharge: billing.adjust_charge,
        totalCharge: billing.total_charge,
      } };
    }
    case actionTypes.LOAD_BILLINGS_SUCCEED:
      return { ...state, billings: action.result.data };
    case actionTypes.CREATE_BILLING_SUCCEED:
      return { ...state, billingFees: initialState.billingFees };
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

export function loadFeesByChooseModal({ type, beginDate, endDate, chooseModel, partnerId, partnerTenantId, tenantId, pageSize, currentPage }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FEES_BYCHOOSEMODAL,
        actionTypes.LOAD_FEES_BYCHOOSEMODAL_SUCCEED,
        actionTypes.LOAD_FEES_BYCHOOSEMODAL_FAIL,
      ],
      endpoint: 'v1/transport/feesByChooseModal',
      method: 'get',
      params: { type, beginDate, endDate, chooseModel, partnerId, partnerTenantId, tenantId, pageSize, currentPage },
    },
  };
}

export function loadFeesByBillingId({ billingId, pageSize, currentPage }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FEES_BYBILLINGID,
        actionTypes.LOAD_FEES_BYBILLINGID_SUCCEED,
        actionTypes.LOAD_FEES_BYBILLINGID_FAIL,
      ],
      endpoint: 'v1/transport/feesByBillingId',
      method: 'get',
      params: { billingId, pageSize, currentPage },
    },
  };
}

export function loadBillings({ type, tenantId, pageSize, currentPage }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILLINGS,
        actionTypes.LOAD_BILLINGS_SUCCEED,
        actionTypes.LOAD_BILLINGS_FAIL,
      ],
      endpoint: 'v1/transport/billings',
      method: 'get',
      params: { type, tenantId, pageSize, currentPage },
    },
  };
}

export function createBilling({ type, tenantId, loginId, name, chooseModel, beginDate, endDate, cancelCharge, freightCharge,
    advanceCharge, excpCharge, adjustCharge, totalCharge, srTenantId, srName, spTenantId, spName, toTenantId,
    shipmtCount, fees }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_BILLING,
        actionTypes.CREATE_BILLING_SUCCEED,
        actionTypes.CREATE_BILLING_FAIL,
      ],
      endpoint: 'v1/transport/billing',
      method: 'post',
      data: { type, tenantId, loginId, name, chooseModel, beginDate, endDate, cancelCharge, freightCharge,
        advanceCharge, excpCharge, adjustCharge, totalCharge, srTenantId, srName, spTenantId, spName, toTenantId,
        shipmtCount, fees },
    },
  };
}
