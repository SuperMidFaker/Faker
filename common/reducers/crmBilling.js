/* eslint camelcase: 0 */
import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
import moment from 'moment';

const actionTypes = createActionTypes('@@welogix/crm/billing/', [
  'LOAD_ORDERS', 'LOAD_ORDERS_SUCCEED', 'LOAD_ORDERS_FAIL',
  'LOAD_TRANSPORT_FEES', 'LOAD_TRANSPORT_FEES_SUCCEED', 'LOAD_TRANSPORT_FEES_FAIL',
  'LOAD_CLEARANCE_FEES', 'LOAD_CLEARANCE_FEES_SUCCEED', 'LOAD_CLEARANCE_FEES_FAIL',

  'UPDATE_BILLINGFEES',
  'ALTER_BILLINGFEES',
  'CHANGE_FEES_FILTER',
  'CHANGE_BILLINGS_FILTER',
  'TOGGLE_ADVANCECHARGE_MODAL',
  'SHOW_BEFOREFEES_MODAL',
  'LOAD_PARTNERS', 'LOAD_PARTNERS_SUCCEED', 'LOAD_PARTNERS_FAIL',

  'LOAD_FEES_BYCHOOSEMODAL', 'LOAD_FEES_BYCHOOSEMODAL_SUCCEED', 'LOAD_FEES_BYCHOOSEMODAL_FAIL',
  'LOAD_TRANSPORT_FEES_BYCHOOSEMODAL', 'LOAD_TRANSPORT_FEES_BYCHOOSEMODAL_SUCCEED', 'LOAD_TRANSPORT_FEES_BYCHOOSEMODAL_FAIL',
  'LOAD_CLEARANCE_FEES_BYCHOOSEMODAL', 'LOAD_CLEARANCE_FEES_BYCHOOSEMODAL_SUCCEED', 'LOAD_CLEARANCE_FEES_BYCHOOSEMODAL_FAIL',
  'LOAD_FEES_BEFORE_TIME', 'LOAD_FEES_BEFORE_TIME_SUCCEED', 'LOAD_FEES_BEFORE_TIME_FAIL',
  'LOAD_TRANSPORT_FEES_BEFORETIME', 'LOAD_TRANSPORT_FEES_BEFORETIME_SUCCEED', 'LOAD_TRANSPORT_FEES_BEFORETIME_FAIL',
  'LOAD_CLEARANCE_FEES_BEFORETIME', 'LOAD_CLEARANCE_FEES_BEFORETIME_SUCCEED', 'LOAD_CLEARANCE_FEES_BEFORETIME_FAIL',
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
]);

const initialState = {
  loaded: true,
  loading: false,
  fees: {
    loadTimes: 0,
    startDate: new Date(),
    endDate: new Date(),
    searchValue: '',
    pageSize: 20,
    current: 1,
    totalCount: 0,
    data: [],
    filters: {
      customer_name: [],
    },
  },
  billings: {
    searchValue: '',
    pageSize: 20,
    current: 1,
    totalCount: 0,
    data: [],
    filters: {
      customer_name: [],
    },
  },
  billing: {
    id: -1,
    beginDate: new Date(),
    endDate: new Date(),
    name: '',

    customerName: '',
    customerCode: '',
    customerTenantId: -1,
    customerPartnerId: -1,
    ccbCharge: 0,
    trsCharge: 0,
    adjustCharge: 0,
    totalCharge: 0,
    modifyTimes: 0,
  },
  billingFees: {
    data: [],
  },
  beforeFeesModal: {
    visible: false,
    data: [],
  },
  partners: [],
  advanceChargeModal: {
    visible: false,
  },
};

function calculateTransportFees(orders, fees) {
  const data = [];
  for (let i = 0; i < orders.length; i++) {
    let trs_freight_charge = 0;
    let trs_excp_charge = 0;
    let trs_advance_charge = 0;
    let trsTotalCharge = 0;
    let total_charge = 0;
    const fee = fees.find(item => item.shipmt_order_no === orders[i].shipmt_order_no);
    if (fee && fee.transportFees.length > 0) {
      fee.transportFees.forEach((item) => {
        if (item.total_charge) {
          trs_freight_charge += item.total_charge;
          trsTotalCharge += item.total_charge;
        }
        if (item.excp_charge) {
          trs_excp_charge += item.excp_charge;
          trsTotalCharge += item.excp_charge;
        }
        if (item.advance_charge) {
          trs_advance_charge += item.advance_charge;
          trsTotalCharge += item.advance_charge;
        }
      });
      total_charge = trsTotalCharge;
      if (orders[i].ccbTotalCharge) {
        total_charge += orders[i].ccbTotalCharge;
      }
    }
    data.push({
      ...orders[i],
      trs_freight_charge,
      trs_excp_charge,
      trs_advance_charge,
      trsTotalCharge,
      total_charge,
    });
  }
  return data;
}

function calculateClearanceFees(orders, fees) {
  const data = [];
  for (let i = 0; i < orders.length; i++) {
    let ccb_cush_charge = 0;
    let ccb_server_charge = 0;
    let ccbTotalCharge = 0;
    let total_charge = 0;
    const fee = fees.find(item => item.shipmt_order_no === orders[i].shipmt_order_no);
    if (fee && fee.clearanceFees.length > 0) {
      fee.clearanceFees.forEach((clearanceFee) => {
        if (clearanceFee.cush_charges.length > 0) {
          clearanceFee.cush_charges.forEach((item) => {
            if (item.total_fee) {
              ccb_cush_charge += item.total_fee;
            }
          });
        }
        if (clearanceFee.server_charges.length > 0) {
          clearanceFee.server_charges.forEach((item) => {
            if (item.total_fee) {
              ccb_server_charge += item.total_fee;
            }
          });
        }
      });
    }

    ccbTotalCharge = ccb_cush_charge + ccb_server_charge;
    total_charge = ccbTotalCharge;
    if (orders[i].trsTotalCharge) {
      total_charge += orders[i].trsTotalCharge;
    }
    data.push({
      ...orders[i],
      ccb_cush_charge,
      ccb_server_charge,
      ccbTotalCharge,
      total_charge,
    });
  }
  return data;
}

function calculateBillingCharges(fees) {
  const billing = {
    ccbCharge: 0,
    trsCharge: 0,
    adjustCharge: 0,
    totalCharge: 0,
  };
  fees.forEach((item) => {
    if (item.ccb_cush_charge) {
      billing.ccbCharge += item.ccb_cush_charge;
    }
    if (item.ccb_server_charge) {
      billing.ccbCharge += item.ccb_server_charge;
    }
    if (item.trs_freight_charge) {
      billing.trsCharge += item.trs_freight_charge;
    }
    if (item.trs_excp_charge) {
      billing.trsCharge += item.trs_excp_charge;
    }
    if (item.trs_advance_charge) {
      billing.trsCharge += item.trs_advance_charge;
    }

    if (item.adjust_charge) {
      billing.adjustCharge += item.adjust_charge;
    }
  });

  billing.totalCharge = billing.ccbCharge + billing.trsCharge + billing.adjustCharge;

  return {
    ccbCharge: Number(billing.ccbCharge.toFixed(2)),
    trsCharge: Number(billing.trsCharge.toFixed(2)),
    adjustCharge: Number(billing.adjustCharge.toFixed(2)),
    totalCharge: Number(billing.totalCharge.toFixed(2)),
  };
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_ORDERS_SUCCEED: {
      return { ...state, fees: { ...state.fees, ...action.result.data, loadTimes: state.fees.loadTimes + 1 } };
    }
    case actionTypes.LOAD_TRANSPORT_FEES_SUCCEED: {
      const data = calculateTransportFees(state.fees.data, action.result.data);
      return { ...state, fees: { ...state.fees, data } };
    }
    case actionTypes.LOAD_CLEARANCE_FEES_SUCCEED: {
      const data = calculateClearanceFees(state.fees.data, action.result.data);
      return { ...state, fees: { ...state.fees, data } };
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
    case actionTypes.LOAD_FEES_BYCHOOSEMODAL_SUCCEED: {
      const fees = action.result.data.data.map(item => ({
        ...item,
        adjust_charge: 0,
        status: 1,
        last_updated_tenant_id: action.params.tenantId,
        last_updated_date: new Date(),
        updated_field: 'status',
      }));
      return { ...state, billingFees: { data: fees } };
    }
    case actionTypes.LOAD_TRANSPORT_FEES_BYCHOOSEMODAL_SUCCEED: {
      const data = calculateTransportFees(state.billingFees.data, action.result.data);
      const billing = calculateBillingCharges(data.filter(item => item.status === 1));
      return { ...state, billingFees: { data }, billing: { ...state.billing, ...billing } };
    }
    case actionTypes.LOAD_CLEARANCE_FEES_BYCHOOSEMODAL_SUCCEED: {
      const data = calculateClearanceFees(state.billingFees.data, action.result.data);
      const billing = calculateBillingCharges(data.filter(item => item.status === 1));
      return { ...state, billingFees: { data }, billing: { ...state.billing, ...billing } };
    }
    case actionTypes.UPDATE_BILLINGFEES: {
      const billingFees = state.billingFees.data.map((item) => {
        if (item.shipmt_order_no === action.data.orderNo) {
          const fee = {
            ...item,
            [action.data.field]: action.data.value,
            last_updated_tenant_id: action.data.tenantId,
            last_updated_tenant_name: action.data.tenantName,
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
    case actionTypes.SHOW_BEFOREFEES_MODAL: {
      return { ...state, beforeFeesModal: { ...state.beforeFeesModal, visible: action.data.visible } };
    }
    case actionTypes.LOAD_FEES_BEFORE_TIME_SUCCEED: {
      const fees = action.result.data.data.map(item => ({
        ...item,
        adjust_charge: 0,
        status: 1,
        last_updated_tenant_id: action.params.tenantId,
        last_updated_date: new Date(),
        updated_field: 'status',
      }));
      return { ...state, beforeFeesModal: { ...state.beforeFeesModal, data: fees } };
    }
    case actionTypes.LOAD_TRANSPORT_FEES_BEFORETIME_SUCCEED: {
      const data = calculateTransportFees(state.beforeFeesModal.data, action.result.data);
      return { ...state, beforeFeesModal: { ...state.beforeFeesModal, data } };
    }
    case actionTypes.LOAD_CLEARANCE_FEES_BEFORETIME_SUCCEED: {
      const data = calculateClearanceFees(state.beforeFeesModal.data, action.result.data);
      return { ...state, beforeFeesModal: { ...state.beforeFeesModal, data } };
    }
    case actionTypes.LOAD_BILLINGS:
      return { ...state, loading: true };
    case actionTypes.LOAD_BILLINGS_SUCCEED:
      return {
        ...state, billings: { ...state.billings, ...action.result.data }, billingFees: initialState.billingFees, loading: false,
      };
    case actionTypes.LOAD_BILLINGS_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_FEES_BYBILLINGID: {
      return { ...state, loading: true };
    }
    case actionTypes.LOAD_FEES_BYBILLINGID_SUCCEED: {
      const billing = action.result.data.billing;
      return {
        ...state,
        billingFees: action.result.data,
        billing: {
          id: billing.id,
          beginDate: billing.begin_date,
          endDate: billing.end_date,
          name: billing.name,

          customerName: billing.customer_name,
          customerCode: billing.customer_code,
          customerTenantId: billing.customer_tenant_id,
          customerPartnerId: billing.customer_partner_id,

          ccbCharge: billing.ccb_charge,
          trsCharge: billing.trs_charge,
          adjustCharge: billing.adjust_charge,
          totalCharge: billing.total_charge,
          modifyTimes: billing.modify_times,
        },
        loading: false,
      };
    }
    default:
      return state;
  }
}

export function loadOrders({
  tenantId, pageSize, current, searchValue, filters, startDate, endDate,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ORDERS,
        actionTypes.LOAD_ORDERS_SUCCEED,
        actionTypes.LOAD_ORDERS_FAIL,
      ],
      endpoint: 'v1/crm/billing/orders',
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

export function loadClearanceFees(shipmtOrders) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CLEARANCE_FEES,
        actionTypes.LOAD_CLEARANCE_FEES_SUCCEED,
        actionTypes.LOAD_CLEARANCE_FEES_FAIL,
      ],
      endpoint: 'v1/crm/cms/billing/expenses',
      method: 'get',
      params: { shipmtOrders: JSON.stringify(shipmtOrders) },
      origin: 'mongo',
    },
  };
}

export function loadTransportFees(shipmtOrders) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRANSPORT_FEES,
        actionTypes.LOAD_TRANSPORT_FEES_SUCCEED,
        actionTypes.LOAD_TRANSPORT_FEES_FAIL,
      ],
      endpoint: 'v1/crm/transport/billing/fees',
      method: 'get',
      params: { shipmtOrders: JSON.stringify(shipmtOrders) },
    },
  };
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


export function loadFeesByChooseModal({
  beginDate, endDate, partnerId, tenantId,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FEES_BYCHOOSEMODAL,
        actionTypes.LOAD_FEES_BYCHOOSEMODAL_SUCCEED,
        actionTypes.LOAD_FEES_BYCHOOSEMODAL_FAIL,
      ],
      endpoint: 'v1/crm/billing/feesByChooseModal',
      method: 'get',
      params: {
        beginDate, endDate, partnerId, tenantId,
      },
    },
  };
}

export function loadClearanceFeesByChooseModal(shipmtOrders) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CLEARANCE_FEES_BYCHOOSEMODAL,
        actionTypes.LOAD_CLEARANCE_FEES_BYCHOOSEMODAL_SUCCEED,
        actionTypes.LOAD_CLEARANCE_FEES_BYCHOOSEMODAL_FAIL,
      ],
      endpoint: 'v1/crm/cms/billing/expenses',
      method: 'get',
      params: { shipmtOrders: JSON.stringify(shipmtOrders) },
      origin: 'mongo',
    },
  };
}

export function loadTransportFeesByChooseModal(shipmtOrders) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRANSPORT_FEES_BYCHOOSEMODAL,
        actionTypes.LOAD_TRANSPORT_FEES_BYCHOOSEMODAL_SUCCEED,
        actionTypes.LOAD_TRANSPORT_FEES_BYCHOOSEMODAL_FAIL,
      ],
      endpoint: 'v1/crm/transport/billing/fees',
      method: 'get',
      params: { shipmtOrders: JSON.stringify(shipmtOrders) },
    },
  };
}

export function loadFeesBeforeTime({ beginDate, partnerId, tenantId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FEES_BEFORE_TIME,
        actionTypes.LOAD_FEES_BEFORE_TIME_SUCCEED,
        actionTypes.LOAD_FEES_BEFORE_TIME_FAIL,
      ],
      endpoint: 'v1/crm/billing/feesBeforeTime',
      method: 'get',
      params: { beginDate, partnerId, tenantId },
    },
  };
}

export function loadClearanceFeesBeforeTime(shipmtOrders) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CLEARANCE_FEES_BEFORETIME,
        actionTypes.LOAD_CLEARANCE_FEES_BEFORETIME_SUCCEED,
        actionTypes.LOAD_CLEARANCE_FEES_BEFORETIME_FAIL,
      ],
      endpoint: 'v1/crm/cms/billing/expenses',
      method: 'get',
      params: { shipmtOrders: JSON.stringify(shipmtOrders) },
      origin: 'mongo',
    },
  };
}

export function loadTransportFeesBeforeTime(shipmtOrders) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRANSPORT_FEES_BEFORETIME,
        actionTypes.LOAD_TRANSPORT_FEES_BEFORETIME_SUCCEED,
        actionTypes.LOAD_TRANSPORT_FEES_BEFORETIME_FAIL,
      ],
      endpoint: 'v1/crm/transport/billing/fees',
      method: 'get',
      params: { shipmtOrders: JSON.stringify(shipmtOrders) },
    },
  };
}

export function loadFeesByBillingId({ billingId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FEES_BYBILLINGID,
        actionTypes.LOAD_FEES_BYBILLINGID_SUCCEED,
        actionTypes.LOAD_FEES_BYBILLINGID_FAIL,
      ],
      endpoint: 'v1/crm/feesByBillingId',
      method: 'get',
      params: { billingId },
    },
  };
}

export function loadBillings({
  tenantId, pageSize, current, searchValue, filters,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BILLINGS,
        actionTypes.LOAD_BILLINGS_SUCCEED,
        actionTypes.LOAD_BILLINGS_FAIL,
      ],
      endpoint: 'v1/crm/billings',
      method: 'get',
      params: {
        tenantId, pageSize, current, searchValue, filters: JSON.stringify(filters),
      },
    },
  };
}

export function createBilling({
  tenantId, loginId, loginName, name, beginDate, endDate,
  ccbCharge, trsCharge, adjustCharge, totalCharge,
  customerTenantId, customerPartnerId, customerName, customerCode,
  shipmtCount, fees,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_BILLING,
        actionTypes.CREATE_BILLING_SUCCEED,
        actionTypes.CREATE_BILLING_FAIL,
      ],
      endpoint: 'v1/crm/billing/create',
      method: 'post',
      data: {
        tenantId,
        loginId,
        loginName,
        name,
        beginDate,
        endDate,
        ccbCharge,
        trsCharge,
        adjustCharge,
        totalCharge,
        customerTenantId,
        customerPartnerId,
        customerName,
        customerCode,
        shipmtCount,
        fees,
      },
    },
  };
}

export function sendBilling({
  tenantId, loginId, loginName, billingId,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SEND_BILLING,
        actionTypes.SEND_BILLING_SUCCEED,
        actionTypes.SEND_BILLING_FAIL,
      ],
      endpoint: 'v1/crm/billing/send',
      method: 'post',
      data: {
        tenantId, loginId, loginName, billingId,
      },
    },
  };
}

export function checkBilling({
  tenantId, loginId, loginName, billingId, ccbCharge, trsCharge, adjustCharge, totalCharge, modifyTimes, shipmtCount, fees,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CHECK_BILLING,
        actionTypes.CHECK_BILLING_SUCCEED,
        actionTypes.CHECK_BILLING_FAIL,
      ],
      endpoint: 'v1/crm/billing/check',
      method: 'post',
      data: {
        tenantId, loginId, loginName, billingId, ccbCharge, trsCharge, adjustCharge, totalCharge, modifyTimes, shipmtCount, fees,
      },
    },
  };
}

export function editBilling({
  tenantId, loginId, loginName, billingId, ccbCharge, trsCharge, adjustCharge, totalCharge, shipmtCount, fees,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_BILLING,
        actionTypes.EDIT_BILLING_SUCCEED,
        actionTypes.EDIT_BILLING_FAIL,
      ],
      endpoint: 'v1/crm/billing/edit',
      method: 'post',
      data: {
        tenantId, loginId, loginName, billingId, ccbCharge, trsCharge, adjustCharge, totalCharge, shipmtCount, fees,
      },
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
      endpoint: 'v1/crm/billing/accept',
      method: 'post',
      data: {
        tenantId, loginId, loginName, billingId,
      },
    },
  };
}

export function removeBilling({
  tenantId, loginId, loginName, billingId,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_BILLING,
        actionTypes.REMOVE_BILLING_SUCCEED,
        actionTypes.REMOVE_BILLING_FAIL,
      ],
      endpoint: 'v1/crm/billing/remove',
      method: 'post',
      data: {
        tenantId, loginId, loginName, billingId,
      },
    },
  };
}

export function changeCancelCharge({
  tenantId, loginId, loginName, billingId, cancelCharge,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CANCEL_CHARGE,
        actionTypes.CANCEL_CHARGE_SUCCEED,
        actionTypes.CANCEL_CHARGE_FAIL,
      ],
      endpoint: 'v1/crm/billing/changeCancelCharge',
      method: 'post',
      data: {
        tenantId, loginId, loginName, billingId, cancelCharge,
      },
    },
  };
}

export function importAdvanceCharge({
  tenantId, loginId, loginName, advances,
}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.IMPORT_ADVANCECHARGE,
        actionTypes.IMPORT_ADVANCECHARGE_SUCCEED,
        actionTypes.IMPORT_ADVANCECHARGE_FAIL,
      ],
      endpoint: 'v1/transport/billing/importAdvanceCharge',
      method: 'post',
      data: {
        tenantId, loginId, loginName, advances,
      },
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

export function updateBillingFees(tenantId, tenantName, orderNo, field, value) {
  return {
    type: actionTypes.UPDATE_BILLINGFEES,
    data: {
      tenantId, tenantName, orderNo, field, value,
    },
  };
}

export function alterBillingFees(fee) {
  return { type: actionTypes.ALTER_BILLINGFEES, data: { fee } };
}

export function showBeforeFeesModal(visible) {
  return { type: actionTypes.SHOW_BEFOREFEES_MODAL, data: { visible } };
}
