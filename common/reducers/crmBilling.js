import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
import moment from 'moment';

const actionTypes = createActionTypes('@@welogix/crm/billing/', [
  'LOAD_ORDERS', 'LOAD_ORDERS_SUCCEED', 'LOAD_ORDERS_FAIL',
  'LOAD_TRANSPORT_FEES', 'LOAD_TRANSPORT_FEES_SUCCEED', 'LOAD_TRANSPORT_FEES_FAIL',
  'LOAD_CLEARANCE_FEES', 'LOAD_CLEARANCE_FEES_SUCCEED', 'LOAD_CLEARANCE_FEES_FAIL',
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
    loadTimes: 0,
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
      customer_name: [],
    },
  },
  billingFees: {
    data: [],
  },
  partners: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_ORDERS_SUCCEED: {
      return { ...state, fees: { ...action.result.data, loadTimes: state.fees.loadTimes + 1 } };
    }
    case actionTypes.LOAD_TRANSPORT_FEES_SUCCEED: {
      const fees = state.fees.data;
      const data = [];
      for (let i = 0; i < fees.length; i++) {
        let trsFreightCharge = 0;
        let trsExcpCharge = 0;
        let trsAdvanceCharge = 0;
        let trsTotalCharge = 0;
        let totalCharge = 0;
        const fee = action.result.data.find(item => item.trs_shipmt_no === fees[i].trs_shipmt_no);
        if (fee && fee.transportFees.length > 0) {
          fee.transportFees.forEach((item) => {
            if (item.total_charge) {
              trsFreightCharge += item.total_charge;
              trsTotalCharge += item.total_charge;
            }
            if (item.excp_charge) {
              trsExcpCharge += item.excp_charge;
              trsTotalCharge += item.excp_charge;
            }
            if (item.advance_charge) {
              trsAdvanceCharge += item.advance_charge;
              trsTotalCharge += item.advance_charge;
            }
          });
          totalCharge = trsTotalCharge;
          if (fees[i].ccbTotalCharge) {
            totalCharge += fees[i].ccbTotalCharge;
          }
        }
        data.push({
          ...fees[i],
          trsFreightCharge,
          trsExcpCharge,
          trsAdvanceCharge,
          trsTotalCharge,
          totalCharge,
        });
      }
      return { ...state, fees: { ...state.fees, data } };
    }
    case actionTypes.LOAD_CLEARANCE_FEES_SUCCEED: {
      const fees = state.fees.data;
      const data = [];
      for (let i = 0; i < fees.length; i++) {
        let ccbCushCharge = 0;
        let ccbServerCharge = 0;
        let ccbTotalCharge = 0;
        let totalCharge = 0;
        const fee = action.result.data.find(item => item.delg_no === fees[i].ccb_delg_no);
        if (fee && fee.cush_charges.length > 0) {
          fee.cush_charges.forEach((item) => {
            if (item.total_fee) {
              ccbCushCharge += item.total_fee;
            }
          });
        }
        if (fee && fee.server_charges.length > 0) {
          fee.server_charges.forEach((item) => {
            if (item.total_fee) {
              ccbServerCharge += item.total_fee;
            }
          });
        }
        ccbTotalCharge = ccbCushCharge + ccbServerCharge;
        totalCharge = ccbTotalCharge;
        if (fees[i].trsTotalCharge) {
          totalCharge += fees[i].trsTotalCharge;
        }
        data.push({
          ...fees[i],
          ccbCushCharge,
          ccbServerCharge,
          ccbTotalCharge,
          totalCharge,
        });
      }
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
    default:
      return state;
  }
}


export function loadOrders({ tenantId, pageSize, current, searchValue, filters, startDate, endDate }) {
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

export function loadClearanceFees(delgNos) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CLEARANCE_FEES,
        actionTypes.LOAD_CLEARANCE_FEES_SUCCEED,
        actionTypes.LOAD_CLEARANCE_FEES_FAIL,
      ],
      endpoint: 'v1/crm/cms/expenses',
      method: 'get',
      params: { delgNos },
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

export function loadPartners(tenantId, roles, businesses) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARTNERS,
        actionTypes.LOAD_PARTNERS_SUCCEED,
        actionTypes.LOAD_PARTNERS_FAIL,
      ],
      endpoint: 'v1/cooperation/type/partners',
      method: 'get',
      params: { tenantId, roles: JSON.stringify(roles), businesses: JSON.stringify(businesses) },
    },
  };
}

export function changeFeesFilter(key, value) {
  return { type: actionTypes.CHANGE_FEES_FILTER, data: { key, value } };
}

export function toggleAdvanceChargeModal(visible) {
  return { type: actionTypes.TOGGLE_ADVANCECHARGE_MODAL, data: { visible } };
}
