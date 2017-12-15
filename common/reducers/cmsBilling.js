import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/delegation/', [
  'PARTNERS_LOAD', 'PARTNERS_LOAD_SUCCEED', 'PARTNERS_LOAD_FAIL',
  'UPDATE_BILLING', 'UPDATE_BILLINGFEES',
  'LOAD_DISPS_BYCHOOSEMODAL', 'LOAD_DISPS_BYCHOOSEMODAL_SUCCEED', 'LOAD_DISPS_BYCHOOSEMODAL_FAIL',
  'LOAD_EXPS_BYDISP', 'LOAD_EXPS_BYDISP_SUCCEED', 'LOAD_EXPS_BYDISP_FAIL',
  'CREATE_BILLING', 'CREATE_BILLING_SUCCEED', 'CREATE_BILLING_FAIL',
  'LOAD_BILLINGS', 'LOAD_BILLINGS_SUCCEED', 'LOAD_BILLINGS_FAIL',
  'SEND_BILLING', 'SEND_BILLING_SUCCEED', 'SEND_BILLING_FAIL',
  'LOAD_FEES_BYBILLINGID', 'LOAD_FEES_BYBILLINGID_SUCCEED', 'LOAD_FEES_BYBILLINGID_FAIL',
  'EDIT_BILLING', 'EDIT_BILLING_SUCCEED', 'EDIT_BILLING_FAIL',
  'ACCEPT_BILLING', 'ACCEPT_BILLING_SUCCEED', 'ACCEPT_BILLING_FAIL',
  'CHECK_BILLING', 'CHECK_BILLING_SUCCEED', 'CHECK_BILLING_FAIL',
  'CANCEL_CHARGE', 'CANCEL_CHARGE_SUCCEED', 'CANCEL_CHARGE_FAIL',
  'INVOICE', 'INVOICE_SUCCEED', 'INVOICE_FAIL',
  'ALTER_BILLINGFEES', 'LOAD_EXPS_BEFORE_TIME',
  'LOAD_EXPS_BEFORE_TIME_SUCCEED', 'LOAD_EXPS_BEFORE_TIME_FAIL',
  'LOAD_DISPS_BEFORETIME', 'LOAD_DISPS_BEFORETIME_SUCCEED', 'LOAD_DISPS_BEFORETIME_FAIL',
]);

const initialState = {
  partners: [],
  billings: {
    pageSize: 20,
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
    advanceCharge: 0,
    serviceCharge: 0,
    adjustCharge: 0,
    totalCharge: 0,
    modifyTimes: 0,
  },
  billingSaving: false,
  dispIds: [],
  BfdispIds: [],
  billingFees: {
    data: [],
  },
};

function calculateBillingCharges(fees) {
  const billing = {
    advanceCharge: 0,
    servCharge: 0,
    adjustCharge: 0,
    totalCharge: 0,
  };
  fees.forEach((item) => {
    if (item.advance_charge !== null) {
      billing.advanceCharge += item.advance_charge;
      billing.totalCharge += item.advance_charge;
    }
    if (item.serv_charge !== null) {
      billing.servCharge += item.serv_charge;
      billing.totalCharge += item.serv_charge;
    }
    if (item.adjust_charge) {
      billing.adjustCharge += item.adjust_charge;
      billing.totalCharge += item.adjust_charge;
    }
  });
  return {
    advanceCharge: Number(billing.advanceCharge.toFixed(2)),
    servCharge: Number(billing.servCharge.toFixed(2)),
    adjustCharge: Number(billing.adjustCharge.toFixed(2)),
    totalCharge: Number(billing.totalCharge.toFixed(2)),
  };
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.PARTNERS_LOAD_SUCCEED:
      return { ...state, partners: action.result.data };
    case actionTypes.UPDATE_BILLING:
      return { ...state, billing: { ...state.billing, ...action.billing } };
    case actionTypes.LOAD_DISPS_BYCHOOSEMODAL_SUCCEED:
      return { ...state, dispIds: action.result.data };
    case actionTypes.LOAD_EXPS_BYDISP_SUCCEED: {
      const billing = calculateBillingCharges(action.result.data);
      const fees = action.result.data.map(item => ({
        ...item,
        last_updated_tenant_id: action.data.tenantId,
        last_updated_date: new Date(),
      }));
      return { ...state, billingFees: { data: fees }, billing: { ...state.billing, ...billing } };
    }
    case actionTypes.UPDATE_BILLINGFEES: {
      const billingFees = state.billingFees.data.map((item) => {
        if (item.disp_id[0] === action.data.Id) {
          const fee = {
            ...item,
            [action.data.field]: action.data.value,
            last_updated_tenant_id: action.data.tenantId,
            last_updated_date: new Date(),
            updated_field: action.data.field,
          };
          return fee;
        }
        return item;
      });
      const billing = calculateBillingCharges(billingFees.filter(item => item.billing_status === 1));
      return { ...state, billingFees: { ...state.billingFees, data: billingFees }, billing: { ...state.billing, ...billing } };
    }
    case actionTypes.LOAD_BILLINGS_SUCCEED:
      return { ...state, billings: action.result.data, billingFees: initialState.billingFees };
    case actionTypes.LOAD_FEES_BYBILLINGID_SUCCEED: {
      const billing = action.result.data.billing;
      return {
        ...state,
        billingFees: action.result.data,
        billing: {
          id: billing._id,
          beginDate: billing.begin_date,
          endDate: billing.end_date,
          name: billing.name,
          chooseModel: billing.choose_model,
          recvName: billing.recv_name,
          recvTenantId: billing.recv_tenant_id,
          sendName: billing.send_name,
          sendTenantId: billing.send_tenant_id,
          advanceCharge: billing.advance_charge,
          servCharge: billing.serv_charge,
          adjustCharge: billing.adjust_charge,
          totalCharge: billing.total_charge,
          modifyTimes: billing.modify_times,
          modifyTime: billing.modify_time,
          modifyTenantId: billing.modify_tenant_id,
        },
      };
    }
    case actionTypes.CREATE_BILLING:
    case actionTypes.ACCEPT_BILLING:
    case actionTypes.EDIT_BILLING:
    case actionTypes.CHECK_BILLING:
      return { ...state, billingSaving: true };
    case actionTypes.CREATE_BILLING_SUCCEED:
    case actionTypes.CREATE_BILLING_FAIL:
    case actionTypes.ACCEPT_BILLING_SUCCEED:
    case actionTypes.ACCEPT_BILLING_FAIL:
    case actionTypes.EDIT_BILLING_SUCCEED:
    case actionTypes.EDIT_BILLING_FAIL:
    case actionTypes.CHECK_BILLING_FAIL:
      return { ...state, billingSaving: false };
    case actionTypes.CHECK_BILLING_SUCCEED:
      return { ...state, billingSaving: false, billingFees: initialState.billingFees };
    case actionTypes.LOAD_DISPS_BEFORETIME_SUCCEED:
      return { ...state, BfdispIds: action.result.data };
    case actionTypes.ALTER_BILLINGFEES: {
      const billingFees = [...state.billingFees.data, action.data.fee];
      const billing = calculateBillingCharges(billingFees.filter(item => item.billing_status === 1));
      return { ...state, billingFees: { ...state.billingFees, data: billingFees }, billing: { ...state.billing, ...billing } };
    }
    default:
      return state;
  }
}

export function loadPartners(tenantId, roles, businessTypes) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.PARTNERS_LOAD,
        actionTypes.PARTNERS_LOAD_SUCCEED,
        actionTypes.PARTNERS_LOAD_FAIL,
      ],
      endpoint: 'v1/cooperation/type/partners',
      method: 'get',
      params: { tenantId, roles: JSON.stringify(roles), businessTypes: JSON.stringify(businessTypes) },
    },
  };
}

export function updateBilling(billing) {
  return { type: actionTypes.UPDATE_BILLING, billing };
}

export function loadDispsByChooseModal({
  type, beginDate, endDate, chooseModel, partnerId, partnerTenantId, tenantId,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DISPS_BYCHOOSEMODAL,
        actionTypes.LOAD_DISPS_BYCHOOSEMODAL_SUCCEED,
        actionTypes.LOAD_DISPS_BYCHOOSEMODAL_FAIL,
      ],
      endpoint: 'v1/cms/billing/dispsByChooseModal',
      method: 'get',
      params: {
        type, beginDate, endDate, chooseModel, partnerId, partnerTenantId, tenantId,
      },
    },
  };
}

export function loadExpsByDisp(dispIds, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_EXPS_BYDISP,
        actionTypes.LOAD_EXPS_BYDISP_SUCCEED,
        actionTypes.LOAD_EXPS_BYDISP_FAIL,
      ],
      endpoint: 'v1/cms/billing/loadExpsByDisp',
      method: 'post',
      data: { dispIds, tenantId },
      origin: 'mongo',
    },
  };
}

export function createBilling({
  tenantId, loginId, loginName, name, chooseModel, beginDate, endDate, advanceCharge,
  servCharge, adjustCharge, totalCharge, toTenantId, fees,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_BILLING,
        actionTypes.CREATE_BILLING_SUCCEED,
        actionTypes.CREATE_BILLING_FAIL,
      ],
      endpoint: 'v1/cms/billing/createBilling',
      method: 'post',
      data: {
        tenantId,
        loginId,
        loginName,
        name,
        chooseModel,
        beginDate,
        endDate,
        advanceCharge,
        servCharge,
        adjustCharge,
        totalCharge,
        toTenantId,
        fees,
      },
      origin: 'mongo',
    },
  };
}

export function updateBillingFees(tenantId, Id, field, value) {
  return {
    type: actionTypes.UPDATE_BILLINGFEES,
    data: {
      tenantId, Id, field, value,
    },
  };
}

export function loadBillings({
  type, tenantId, pageSize, currentPage,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILLINGS,
        actionTypes.LOAD_BILLINGS_SUCCEED,
        actionTypes.LOAD_BILLINGS_FAIL,
      ],
      endpoint: 'v1/cms/load/billings',
      method: 'get',
      params: {
        type, tenantId, pageSize, currentPage,
      },
      origin: 'mongo',
    },
  };
}

export function sendBilling({ tenantId, billingId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEND_BILLING,
        actionTypes.SEND_BILLING_SUCCEED,
        actionTypes.SEND_BILLING_FAIL,
      ],
      endpoint: 'v1/cms/send/billing',
      method: 'post',
      data: { tenantId, billingId },
      origin: 'mongo',
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
      endpoint: 'v1/cms/loadexps/byBillingId',
      method: 'get',
      params: { billingId, pageSize, currentPage },
      origin: 'mongo',
    },
  };
}

export function checkBilling({
  tenantId, loginId, loginName, billingId, adjustCharge, totalCharge, modifyTimes, fees,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CHECK_BILLING,
        actionTypes.CHECK_BILLING_SUCCEED,
        actionTypes.CHECK_BILLING_FAIL,
      ],
      endpoint: 'v1/cms/billing/check',
      method: 'post',
      data: {
        tenantId, loginId, loginName, billingId, adjustCharge, totalCharge, modifyTimes, fees,
      },
      origin: 'mongo',
    },
  };
}

export function acceptBilling({
  tenantId, loginId, loginName, billingId,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ACCEPT_BILLING,
        actionTypes.ACCEPT_BILLING_SUCCEED,
        actionTypes.ACCEPT_BILLING_FAIL,
      ],
      endpoint: 'v1/cms/billing/accept',
      method: 'post',
      data: {
        tenantId, loginId, loginName, billingId,
      },
      origin: 'mongo',
    },
  };
}

export function editBilling({
  tenantId, loginId, loginName, billingId, adjustCharge, totalCharge, fees,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_BILLING,
        actionTypes.EDIT_BILLING_SUCCEED,
        actionTypes.EDIT_BILLING_FAIL,
      ],
      endpoint: 'v1/cms/billing/edit',
      method: 'post',
      data: {
        tenantId, loginId, loginName, billingId, adjustCharge, totalCharge, fees,
      },
      origin: 'mongo',
    },
  };
}

export function changeCancelCharge({ tenantId, billingId, cancelCharge }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CANCEL_CHARGE,
        actionTypes.CANCEL_CHARGE_SUCCEED,
        actionTypes.CANCEL_CHARGE_FAIL,
      ],
      endpoint: 'v1/cms/billing/changeCancelCharge',
      method: 'post',
      data: { tenantId, billingId, cancelCharge },
      origin: 'mongo',
    },
  };
}

export function billingInvoiced({ tenantId, billingId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.INVOICE,
        actionTypes.INVOICE_SUCCEED,
        actionTypes.INVOICE_FAIL,
      ],
      endpoint: 'v1/cms/billing/invoiced',
      method: 'post',
      data: { tenantId, billingId },
      origin: 'mongo',
    },
  };
}

export function loadDispsBeforeTime({
  type, beginDate, chooseModel, partnerId, partnerTenantId, tenantId,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DISPS_BEFORETIME,
        actionTypes.LOAD_DISPS_BEFORETIME_SUCCEED,
        actionTypes.LOAD_DISPS_BEFORETIME_FAIL,
      ],
      endpoint: 'v1/cms/billing/dispsBeforeTime',
      method: 'get',
      params: {
        type, beginDate, chooseModel, partnerId, partnerTenantId, tenantId,
      },
    },
  };
}

export function loadExpsBeforeTime(dispIds, tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_EXPS_BEFORE_TIME,
        actionTypes.LOAD_EXPS_BEFORE_TIME_SUCCEED,
        actionTypes.LOAD_EXPS_BEFORE_TIME_FAIL,
      ],
      endpoint: 'v1/cms/loadexps/beforeTime',
      method: 'post',
      data: { dispIds, tenantId },
      origin: 'mongo',
    },
  };
}

export function alterBillingFees(fee) {
  return { type: actionTypes.ALTER_BILLINGFEES, data: { fee } };
}
