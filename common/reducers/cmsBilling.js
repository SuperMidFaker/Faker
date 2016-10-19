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
]);

const initialState = {
  partners: [],
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
    advanceCharge: 0,
    serviceCharge: 0,
    adjustCharge: 0,
    totalCharge: 0,
    modifyTimes: 0,
  },
  dispIds: [],
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
      const fees = action.result.data.map((item) => {
        return {
          ...item,
          last_updated_tenant_id: action.data.tenantId,
          last_updated_date: new Date(),
        };
      });
      return { ...state, billingFees: { data: fees }, billing: { ...state.billing, ...billing } };
    }
    case actionTypes.UPDATE_BILLINGFEES: {
      const billingFees = state.billingFees.data.map((item) => {
        if (item.disp_id === action.data.Id) {
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
      const billing = calculateBillingCharges(billingFees);
      return { ...state, billingFees: { ...state.billingFees, data: billingFees }, billing: { ...state.billing, ...billing } };
    }
    case actionTypes.LOAD_BILLINGS_SUCCEED:
      return { ...state, billings: action.result.data, billingFees: initialState.billingFees };
    default:
      return state;
  }
}

export function loadPartners(tenantId, typeCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.PARTNERS_LOAD,
        actionTypes.PARTNERS_LOAD_SUCCEED,
        actionTypes.PARTNERS_LOAD_FAIL,
      ],
      endpoint: 'v1/cooperation/type/partners',
      method: 'get',
      params: { tenantId, typeCode },
    },
  };
}

export function updateBilling(billing) {
  return { type: actionTypes.UPDATE_BILLING, billing };
}

export function loadDispsByChooseModal({ type, beginDate, endDate, chooseModel, partnerId, partnerTenantId, tenantId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DISPS_BYCHOOSEMODAL,
        actionTypes.LOAD_DISPS_BYCHOOSEMODAL_SUCCEED,
        actionTypes.LOAD_DISPS_BYCHOOSEMODAL_FAIL,
      ],
      endpoint: 'v1/cms/billing/dispsByChooseModal',
      method: 'get',
      params: { type, beginDate, endDate, chooseModel, partnerId, partnerTenantId, tenantId },
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

export function createBilling({ tenantId, loginId, loginName, name, chooseModel, beginDate, endDate, advanceCharge,
    servCharge, adjustCharge, totalCharge, toTenantId, fees }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_BILLING,
        actionTypes.CREATE_BILLING_SUCCEED,
        actionTypes.CREATE_BILLING_FAIL,
      ],
      endpoint: 'v1/cms/billing/createBilling',
      method: 'post',
      data: { tenantId, loginId, loginName, name, chooseModel, beginDate, endDate, advanceCharge,
        servCharge, adjustCharge, totalCharge, toTenantId, fees },
      origin: 'mongo',
    },
  };
}

export function updateBillingFees(tenantId, Id, field, value) {
  return { type: actionTypes.UPDATE_BILLINGFEES, data: { tenantId, Id, field, value } };
}

export function loadBillings({ type, tenantId, pageSize, currentPage }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILLINGS,
        actionTypes.LOAD_BILLINGS_SUCCEED,
        actionTypes.LOAD_BILLINGS_FAIL,
      ],
      endpoint: 'v1/cms/load/billings',
      method: 'get',
      params: { type, tenantId, pageSize, currentPage },
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
