import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/billing/', [
  'UPDATE_BILLING',
  'UPDATE_BILLINGFEES',
  'ALTER_BILLINGFEES',
  'CHANGE_FEES_FILTER',
  'CHANGE_BILLINGS_FILTER',
  'TOGGLE_ADVANCECHARGE_MODAL',
  'LOAD_PARTNERS', 'LOAD_PARTNERS_SUCCEED', 'LOAD_PARTNERS_FAIL',
  'LOAD_FEES', 'LOAD_FEES_SUCCEED', 'LOAD_FEES_FAIL',
  'LOAD_FEES_BYCHOOSEMODAL', 'LOAD_FEES_BYCHOOSEMODAL_SUCCEED', 'LOAD_FEES_BYCHOOSEMODAL_FAIL',
  'LOAD_FEES_BEFORE_TIME', 'LOAD_FEES_BEFORE_TIME_SUCCEED', 'LOAD_FEES_BEFORE_TIME_FAIL',
  'LOAD_FEES_BYBILLINGID', 'LOAD_FEES_BYBILLINGID_SUCCEED', 'LOAD_FEES_BYBILLINGID_FAIL',
  'LOAD_BILLINGS', 'LOAD_BILLINGS_SUCCEED', 'LOAD_BILLINGS_FAIL',
  'CREATE_BILLING', 'CREATE_BILLING_SUCCEED', 'CREATE_BILLING_FAIL',
  'SEND_BILLING', 'SEND_BILLING_SUCCEED', 'SEND_BILLING_FAIL',
  'CHECK_BILLING', 'CHECK_BILLING_SUCCEED', 'CHECK_BILLING_FAIL',
  'EDIT_BILLING', 'EDIT_BILLING_SUCCEED', 'EDIT_BILLING_FAIL',
  'ACCEPT_BILLING', 'ACCEPT_BILLING_SUCCEED', 'ACCEPT_BILLING_FAIL',
  'REMOVE_BILLING', 'REMOVE_BILLING_SUCCEED', 'REMOVE_BILLING_FAIL',
  'CANCEL_CHARGE', 'CANCEL_CHARGE_SUCCEED', 'CANCEL_CHARGE_FAIL',
  'IMPORT_ADVANCECHARGE', 'IMPORT_ADVANCECHARGE_SUCCEED', 'IMPORT_ADVANCECHARGE_FAIL',
  'LOAD_SPECIALCHARGES', 'LOAD_SPECIALCHARGES_SUCCEED', 'LOAD_SPECIALCHARGES_FAIL',
]);
const sDate = new Date();
sDate.setMonth(sDate.getMonth() - 3);
const eDate = new Date();

const initialState = {
  loading: false,
  fees: {
    startDate: sDate,
    endDate: eDate,
    searchValue: '',
    pageSize: 10,
    currentPage: 1,
    totalCount: 0,
    data: [],
    filters: {
      p_sr_name: [],
      sp_name: [],
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
    freightCharge: 0,
    advanceCharge: 0,
    excpCharge: 0,
    adjustCharge: 0,
    totalCharge: 0,
    modifyTimes: 0,
  },
  billingFees: {
    data: [],
  },
  partners: [],
  advanceChargeModal: {
    visible: false,
  },
};

function calculateBillingCharges(fees) {
  const billing = {
    freightCharge: 0,
    advanceCharge: 0,
    excpCharge: 0,
    adjustCharge: 0,
    totalCharge: 0,
  };
  fees.forEach((item) => {
    if (item.advance_charge !== null) {
      billing.advanceCharge += item.advance_charge;
      billing.totalCharge += item.advance_charge;
    }
    if (item.excp_charge !== null) {
      billing.excpCharge += item.excp_charge;
      billing.totalCharge += item.excp_charge;
    }
    if (item.adjust_charge !== null) {
      billing.adjustCharge += item.adjust_charge;
      billing.totalCharge += item.adjust_charge;
    }
    if (item.total_charge !== null) {
      billing.freightCharge += item.total_charge;
      billing.totalCharge += item.total_charge;
    }
  });
  return {
    freightCharge: Number(billing.freightCharge.toFixed(2)),
    advanceCharge: Number(billing.advanceCharge.toFixed(2)),
    excpCharge: Number(billing.excpCharge.toFixed(2)),
    adjustCharge: Number(billing.adjustCharge.toFixed(2)),
    totalCharge: Number(billing.totalCharge.toFixed(2)),
  };
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.UPDATE_BILLING:
      return { ...state, billing: { ...state.billing, ...action.billing } };
    case actionTypes.UPDATE_BILLINGFEES: {
      const billingFees = state.billingFees.data.map((item) => {
        if (item.id === action.data.feeId) {
          const fee = { ...item,
            [action.data.field]: action.data.value,
            last_updated_tenant_id: action.data.tenantId,
            last_updated_date: new Date(),
            updated_field: action.data.field,
          };
          return fee;
        }
        return item;
      });
      const billing = calculateBillingCharges(billingFees.filter(item => item.status === 1));
      return { ...state, billingFees: { ...state.billingFees, data: billingFees }, billing: { ...state.billing, ...billing } };
    }
    case actionTypes.ALTER_BILLINGFEES: {
      const billingFees = [...state.billingFees.data, action.data.fee];
      const billing = calculateBillingCharges(billingFees.filter(item => item.status === 1));
      return { ...state, billingFees: { ...state.billingFees, data: billingFees }, billing: { ...state.billing, ...billing } };
    }
    case actionTypes.LOAD_PARTNERS_SUCCEED:
      return { ...state, partners: action.result.data };
    case actionTypes.LOAD_FEES:
      return { ...state, loading: true };
    case actionTypes.LOAD_FEES_SUCCEED:
      return { ...state, fees: { ...state.fees, ...action.result.data }, loading: false };
    case actionTypes.LOAD_FEES_FAIL:
      return { ...state, fees: { ...state.fees, ...action.result.data }, loading: false };
    case actionTypes.LOAD_FEES_BYCHOOSEMODAL_SUCCEED: {
      const billing = calculateBillingCharges(action.result.data.data);
      const fees = action.result.data.data.map((item) => {
        return {
          ...item,
          last_updated_tenant_id: action.params.tenantId,
          last_updated_date: new Date(),
          updated_field: 'status',
        };
      });
      return { ...state, billingFees: { data: fees }, billing: { ...state.billing, ...billing } };
    }
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
        freightCharge: billing.freight_charge,
        advanceCharge: billing.advance_charge,
        excpCharge: billing.excp_charge,
        adjustCharge: billing.adjust_charge,
        totalCharge: billing.total_charge,
        modifyTimes: billing.modify_times,
      } };
    }
    case actionTypes.LOAD_BILLINGS:
      return { ...state, loading: true };
    case actionTypes.LOAD_BILLINGS_SUCCEED:
      return { ...state, billings: { ...state.billings, ...action.result.data }, billingFees: initialState.billingFees, loading: false };
    case actionTypes.LOAD_BILLINGS_FAIL:
      return { ...state, loading: false };
    case actionTypes.CREATE_BILLING_SUCCEED:
      return { ...state, billingFees: initialState.billingFees };
    case actionTypes.CHECK_BILLING_SUCCEED:
      return { ...state, billingFees: initialState.billingFees };
    case actionTypes.CHANGE_FEES_FILTER: {
      const fees = { ...state.fees, [action.data.key]: action.data.value };
      return { ...state, fees };
    }
    case actionTypes.CHANGE_BILLINGS_FILTER: {
      const billings = { ...state.billings, searchValue: action.data.value };
      return { ...state, billings };
    }
    case actionTypes.TOGGLE_ADVANCECHARGE_MODAL: {
      return { ...state, advanceChargeModal: { visible: action.data.visible } };
    }
    default:
      return state;
  }
}

export function updateBilling(billing) {
  return { type: actionTypes.UPDATE_BILLING, billing };
}

export function updateBillingFees(tenantId, feeId, field, value) {
  return { type: actionTypes.UPDATE_BILLINGFEES, data: { tenantId, feeId, field, value } };
}

export function alterBillingFees(fee) {
  return { type: actionTypes.ALTER_BILLINGFEES, data: { fee } };
}

export function loadPartners(tenantId, roles, businessTypes) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARTNERS,
        actionTypes.LOAD_PARTNERS_SUCCEED,
        actionTypes.LOAD_PARTNERS_FAIL,
      ],
      endpoint: 'v1/cooperation/type/partners',
      method: 'get',
      params: { tenantId, roles: JSON.stringify(roles), businessTypes: JSON.stringify(businessTypes) },
    },
  };
}

export function loadFees({ tenantId, pageSize, currentPage, searchValue, filters, startDate, endDate }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FEES,
        actionTypes.LOAD_FEES_SUCCEED,
        actionTypes.LOAD_FEES_FAIL,
      ],
      endpoint: 'v1/transport/fees',
      method: 'get',
      params: { tenantId, pageSize, currentPage, searchValue, filters, startDate, endDate },
    },
  };
}

export function loadFeesByChooseModal({ type, beginDate, endDate, chooseModel, partnerId, partnerTenantId, tenantId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FEES_BYCHOOSEMODAL,
        actionTypes.LOAD_FEES_BYCHOOSEMODAL_SUCCEED,
        actionTypes.LOAD_FEES_BYCHOOSEMODAL_FAIL,
      ],
      endpoint: 'v1/transport/feesByChooseModal',
      method: 'get',
      params: { type, beginDate, endDate, chooseModel, partnerId, partnerTenantId, tenantId },
    },
  };
}

export function loadFeesBeforeTime({ type, beginDate, endDate, chooseModel, partnerId, partnerTenantId, tenantId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FEES_BEFORE_TIME,
        actionTypes.LOAD_FEES_BEFORE_TIME_SUCCEED,
        actionTypes.LOAD_FEES_BEFORE_TIME_FAIL,
      ],
      endpoint: 'v1/transport/feesBeforeTime',
      method: 'get',
      params: { type, beginDate, endDate, chooseModel, partnerId, partnerTenantId, tenantId },
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

export function loadBillings({ type, tenantId, pageSize, currentPage, searchValue, filters }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILLINGS,
        actionTypes.LOAD_BILLINGS_SUCCEED,
        actionTypes.LOAD_BILLINGS_FAIL,
      ],
      endpoint: 'v1/transport/billings',
      method: 'get',
      params: { type, tenantId, pageSize, currentPage, searchValue, filters },
    },
  };
}

export function createBilling({ tenantId, loginId, loginName, name, chooseModel, beginDate, endDate, freightCharge,
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
      data: { tenantId, loginId, loginName, name, chooseModel, beginDate, endDate, freightCharge,
        advanceCharge, excpCharge, adjustCharge, totalCharge, srTenantId, srName, spTenantId, spName, toTenantId,
        shipmtCount, fees },
    },
  };
}

export function sendBilling({ tenantId, loginId, loginName, billingId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEND_BILLING,
        actionTypes.SEND_BILLING_SUCCEED,
        actionTypes.SEND_BILLING_FAIL,
      ],
      endpoint: 'v1/transport/sendBilling',
      method: 'post',
      data: { tenantId, loginId, loginName, billingId },
    },
  };
}

export function checkBilling({ tenantId, loginId, loginName, billingId, adjustCharge, totalCharge, modifyTimes, shipmtCount, fees }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CHECK_BILLING,
        actionTypes.CHECK_BILLING_SUCCEED,
        actionTypes.CHECK_BILLING_FAIL,
      ],
      endpoint: 'v1/transport/checkBilling',
      method: 'post',
      data: { tenantId, loginId, loginName, billingId, adjustCharge, totalCharge, modifyTimes, shipmtCount, fees },
    },
  };
}

export function editBilling({ tenantId, loginId, loginName, billingId, adjustCharge, totalCharge, shipmtCount, fees }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_BILLING,
        actionTypes.EDIT_BILLING_SUCCEED,
        actionTypes.EDIT_BILLING_FAIL,
      ],
      endpoint: 'v1/transport/editBilling',
      method: 'post',
      data: { tenantId, loginId, loginName, billingId, adjustCharge, totalCharge, shipmtCount, fees },
    },
  };
}

export function acceptBilling({ tenantId, loginId, loginName, billingId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ACCEPT_BILLING,
        actionTypes.ACCEPT_BILLING_SUCCEED,
        actionTypes.ACCEPT_BILLING_FAIL,
      ],
      endpoint: 'v1/transport/acceptBilling',
      method: 'post',
      data: { tenantId, loginId, loginName, billingId },
    },
  };
}

export function removeBilling({ tenantId, loginId, loginName, billingId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_BILLING,
        actionTypes.REMOVE_BILLING_SUCCEED,
        actionTypes.REMOVE_BILLING_FAIL,
      ],
      endpoint: 'v1/transport/removeBilling',
      method: 'post',
      data: { tenantId, loginId, loginName, billingId },
    },
  };
}

export function changeCancelCharge({ tenantId, loginId, loginName, billingId, cancelCharge }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CANCEL_CHARGE,
        actionTypes.CANCEL_CHARGE_SUCCEED,
        actionTypes.CANCEL_CHARGE_FAIL,
      ],
      endpoint: 'v1/transport/billing/changeCancelCharge',
      method: 'post',
      data: { tenantId, loginId, loginName, billingId, cancelCharge },
    },
  };
}

export function importAdvanceCharge({ tenantId, loginId, loginName, advances }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.IMPORT_ADVANCECHARGE,
        actionTypes.IMPORT_ADVANCECHARGE_SUCCEED,
        actionTypes.IMPORT_ADVANCECHARGE_FAIL,
      ],
      endpoint: 'v1/transport/billing/importAdvanceCharge',
      method: 'post',
      data: { tenantId, loginId, loginName, advances },
    },
  };
}

export function loadSpecialCharges(dispId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_SPECIALCHARGES,
        actionTypes.LOAD_SPECIALCHARGES_SUCCEED,
        actionTypes.LOAD_SPECIALCHARGES_FAIL,
      ],
      endpoint: 'v1/transport/specialCharges',
      method: 'get',
      params: { dispId },
    },
  };
}

export function changeFeesFilter(key, value) {
  return { type: actionTypes.CHANGE_FEES_FILTER, data: { key, value } };
}

export function changeBillingsFilter(key, value) {
  return { type: actionTypes.CHANGE_BILLINGS_FILTER, data: { key, value } };
}

export function toggleAdvanceChargeModal(visible) {
  return { type: actionTypes.TOGGLE_ADVANCECHARGE_MODAL, data: { visible } };
}
