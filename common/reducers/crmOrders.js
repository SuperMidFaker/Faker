import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/crm/orders/', [
  'LOAD_FORM_REQUIRES', 'LOAD_FORM_REQUIRES_SUCCEED', 'LOAD_FORM_REQUIRES_FAIL',
  'LOAD_ORDERS', 'LOAD_ORDERS_SUCCEED', 'LOAD_ORDERS_FAIL',
  'SUBMIT_ORDER', 'SUBMIT_ORDER_SUCCEED', 'SUBMIT_ORDER_FAIL',
  'SET_CLIENT_FORM',
]);

const initialState = {
  loaded: true,
  loading: false,
  customers: [],
  formData: {
    shipmt_order_mode: 2,
    customer_name: '',
    customer_tenant_id: -1,
    customer_partner_id: -1,
    customer_partner_code: '',
    cust_order_no: '',
    cust_invoice_no: '',
    cust_shipmt_trans_mode: '',
    cust_shipmt_mawb: '',
    cust_shipmt_hawb: '',
    cust_shipmt_bill_lading: '',
    cust_shipmt_vessel_voy: '',
    cust_shipmt_pieces: 0,
    cust_shipmt_weight: 0,
    cust_shipmt_volume: 0,
    cust_shipmt_package: '',
    cust_shipmt_goods_type: null,
    ccb_need_exchange: 0,
    remark: '',
    transports: [{
      trs_mode_id: -1,
      trs_mode_code: '',
      trs_mode: '',
      consigner_name: '',
      consigner_province: '',
      consigner_city: '',
      consigner_district: '',
      consigner_street: '',
      consigner_region_code: -1,
      consigner_addr: '',
      consigner_email: '',
      consigner_contact: '',
      consigner_mobile: '',
      consignee_name: '',
      consignee_province: '',
      consignee_city: '',
      consignee_district: '',
      consignee_street: '',
      consignee_region_code: -1,
      consignee_addr: '',
      consignee_email: '',
      consignee_contact: '',
      consignee_mobile: '',
      pack_count: 1,
      gross_wt: 0,
    }],
    delgBills: [{
      decl_way_code: '',
      manual_no: '',
      pack_count: 1,
      gross_wt: 0,
    }],
    files: [],
  },
  formRequires: {
    clients: [],
    packagings: [],
    transitModes: [],
    consignerLocations: [],
    consigneeLocations: [],
  },
  orders: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    filters: [],
    data: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_FORM_REQUIRES_SUCCEED:
      return { ...state, formRequires: action.result.data };
    case actionTypes.SET_CLIENT_FORM:
      return { ...state, formData: { ...state.formData, ...action.data } };
    case actionTypes.SUBMIT_ORDER_SUCCEED:
      return { ...state };
    case actionTypes.LOAD_ORDERS:
      return { ...state, loading: true };
    case actionTypes.LOAD_ORDERS_SUCCEED:
      return { ...state, orders: action.result.data, loading: false };
    default:
      return state;
  }
}

export function loadFormRequires(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FORM_REQUIRES,
        actionTypes.LOAD_FORM_REQUIRES_SUCCEED,
        actionTypes.LOAD_FORM_REQUIRES_FAIL,
      ],
      endpoint: 'v1/crm/order/requires',
      method: 'get',
      params,
    },
  };
}

export function loadOrders({ tenantId, pageSize, current, searchValue, filters }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ORDERS,
        actionTypes.LOAD_ORDERS_SUCCEED,
        actionTypes.LOAD_ORDERS_FAIL,
      ],
      endpoint: 'v1/crm/orders',
      method: 'get',
      params: { tenantId, pageSize, current, searchValue, filters: JSON.stringify(filters) },
    },
  };
}

export function setClientForm(data) {
  return {
    type: actionTypes.SET_CLIENT_FORM,
    data,
  };
}

export function submitOrder(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SUBMIT_ORDER,
        actionTypes.SUBMIT_ORDER_SUCCEED,
        actionTypes.SUBMIT_ORDER_FAIL,
      ],
      endpoint: 'v1/crm/order/submit',
      method: 'post',
      data,
    },
  };
}

