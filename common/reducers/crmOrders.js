import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/crm/orders/', [
  'LOAD_FORM_REQUIRES', 'LOAD_FORM_REQUIRES_SUCCEED', 'LOAD_FORM_REQUIRES_FAIL',
  'LOAD_ORDERS', 'LOAD_ORDERS_SUCCEED', 'LOAD_ORDERS_FAIL',
  'LOAD_ORDER', 'LOAD_ORDER_SUCCEED', 'LOAD_ORDER_FAIL',
  'SUBMIT_ORDER', 'SUBMIT_ORDER_SUCCEED', 'SUBMIT_ORDER_FAIL',
  'SET_CLIENT_FORM', 'HIDE_DOCK', 'SHOW_DOCK', 'CHANGE_DOCK_TAB',
  'REMOVE_ORDER', 'REMOVE_ORDER_SUCCEED', 'REMOVE_ORDER_FAIL',
  'EDIT_ORDER', 'EDIT_ORDER_SUCCEED', 'EDIT_ORDER_FAIL',
  'ACCEPT_ORDER', 'ACCEPT_ORDER_SUCCEED', 'ACCEPT_ORDER_FAIL',
  'LOAD_DETAIL', 'LOAD_DETAIL_SUCCEED', 'LOAD_DETAIL_FAIL',
  'LOAD_CLEARANCE_DETAIL', 'LOAD_CLEARANCE_DETAIL_SUCCEED', 'LOAD_CLEARANCE_DETAIL_FAILED',
  'LOAD_TRANSPORT_DETAIL', 'LOAD_TRANSPORT_DETAIL_SUCCEED', 'LOAD_TRANSPORT_DETAIL_FAILED',
  'LOAD_CLEARANCE_FEES', 'LOAD_CLEARANCE_FEES_SUCCEED', 'LOAD_CLEARANCE_FEES_FAIL',
  'LOAD_FLOWNODE', 'LOAD_FLOWNODE_SUCCEED', 'LOAD_FLOWNODE_FAILED',
  'LOAD_ORDERPROG', 'LOAD_ORDERPROG_SUCCEED', 'LOAD_ORDERPROG_FAILED',
  'LOAD_ORDER_NODES', 'LOAD_ORDER_NODES_SUCCEED', 'LOAD_ORDER_NODES_FAIL',
  'LOAD_ORDER_NODES_TRIGGERS', 'LOAD_ORDER_NODES_TRIGGERS_SUCCEED', 'LOAD_ORDER_NODES_TRIGGERS_FAIL',
]);

const initialState = {
  loaded: true,
  loading: false,
  dock: {
    visible: false,
    tabKey: null,
    order: {},
    clearances: [],
    transports: [],
    clearanceFees: [
      // server_charges: [],
      // cush_charges: [],
      // tot_sercharges: {},
    ],
  },
  formData: {
    shipmt_order_no: '',
    shipmt_order_mode: '',
    customer_name: '',
    customer_tenant_id: null,
    customer_partner_id: null,
    customer_partner_code: '',
    cust_order_no: '',
    cust_invoice_no: '',
    cust_shipmt_trans_mode: '',
    cust_shipmt_mawb: '',
    cust_shipmt_hawb: '',
    cust_shipmt_bill_lading: '',
    cust_shipmt_bill_lading_no: '',
    cust_shipmt_vessel: '',
    cust_shipmt_voy: '',
    cust_shipmt_pieces: null,
    cust_shipmt_weight: null,
    cust_shipmt_goods_type: null,
    cust_shipmt_is_container: '',
    ccb_need_exchange: 0,
    cust_shipmt_wrap_type: null,
    containers: [],
    subOrders: [],
  },
  formRequires: {
    clients: [],
    packagings: [],
    transitModes: [],
    goodsTypes: [],
    consignerLocations: [],
    consigneeLocations: [],
    containerPackagings: [],
  },
  orders: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
  },
  orderFilters: { progress: 'active', transfer: 'all' },
  kinds: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_FORM_REQUIRES_SUCCEED:
      return { ...state, formRequires: action.result.data };
    case actionTypes.SET_CLIENT_FORM: {
      const { index, orderInfo } = action.data;
      if (index === -1) {
        return { ...state, formData: { ...state.formData, ...orderInfo } };
      } else if (index === -2) {
        return { ...state, formData: initialState.formData };
      } else {
        const subOrders = [...state.formData.subOrders];
        subOrders.splice(index, 1, orderInfo);
        return { ...state, formData: { ...state.formData, subOrders } };
      }
    }
    case actionTypes.LOAD_ORDERS:
      return { ...state, loading: true, orderFilters: JSON.parse(action.params.filters) };
    case actionTypes.LOAD_ORDERS_SUCCEED:
      return { ...state, orders: action.result.data, loading: false };
    case actionTypes.LOAD_ORDER_SUCCEED:
      return { ...state, formData: action.result.data };
    case actionTypes.LOAD_DETAIL_SUCCEED: {
      return { ...state,
        dock: {
          ...state.dock,
          visible: true,
          tabKey: action.tabKey,
          ...action.result.data,
        } };
    }
    case actionTypes.LOAD_CLEARANCE_DETAIL_SUCCEED: {
      return { ...state,
        dock: {
          ...state.dock,
          clearances: action.result.data,
        } };
    }
    case actionTypes.LOAD_CLEARANCE_FEES_SUCCEED:
      return { ...state,
        dock: {
          ...state.dock,
          clearanceFees: action.result.data || initialState.dock.clearanceFees,
        } };
    case actionTypes.LOAD_TRANSPORT_DETAIL_SUCCEED: {
      return { ...state,
        dock: {
          ...state.dock,
          transports: action.result.data,
        } };
    }
    case actionTypes.HIDE_DOCK: {
      return { ...state, dock: { ...state.dock, visible: false } };
    }
    case actionTypes.SHOW_DOCK: {
      return { ...state, dock: { ...state.dock, visible: true } };
    }
    case actionTypes.CHANGE_dock_TAB: {
      return { ...state, dock: { ...state.dock, tabKey: action.data.tabKey } };
    }
    case actionTypes.LOAD_ORDER_NODES_SUCCEED:
      return { ...state, kinds: action.result.data };
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
      endpoint: 'v1/crm/requires',
      method: 'get',
      params,
    },
  };
}

export function loadOrders({ tenantId, pageSize, current, filters }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ORDERS,
        actionTypes.LOAD_ORDERS_SUCCEED,
        actionTypes.LOAD_ORDERS_FAIL,
      ],
      endpoint: 'v1/crm/orders',
      method: 'get',
      params: { tenantId, pageSize, current, filters: JSON.stringify(filters) },
    },
  };
}

export function loadOrder(shipmtOrderNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ORDER,
        actionTypes.LOAD_ORDER_SUCCEED,
        actionTypes.LOAD_ORDER_FAIL,
      ],
      endpoint: 'v1/crm/order',
      method: 'get',
      params: { shipmtOrderNo },
    },
  };
}

export function removeOrder({ tenantId, loginId, username, shipmtOrderNo }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_ORDER,
        actionTypes.REMOVE_ORDER_SUCCEED,
        actionTypes.REMOVE_ORDER_FAIL,
      ],
      endpoint: 'v1/crm/order/remove',
      method: 'post',
      data: { tenantId, loginId, username, shipmtOrderNo },
    },
  };
}

export function setClientForm(index, orderInfo) {
  return {
    type: actionTypes.SET_CLIENT_FORM,
    data: { index, orderInfo },
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

export function editOrder(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_ORDER,
        actionTypes.EDIT_ORDER_SUCCEED,
        actionTypes.EDIT_ORDER_FAIL,
      ],
      endpoint: 'v1/crm/order/edit',
      method: 'post',
      data,
    },
  };
}

export function acceptOrder(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ACCEPT_ORDER,
        actionTypes.ACCEPT_ORDER_SUCCEED,
        actionTypes.ACCEPT_ORDER_FAIL,
      ],
      endpoint: 'v1/crm/order/accept',
      method: 'post',
      data,
    },
  };
}

export function loadOrderDetail(shipmtOrderNo, tenantId, tabKey = '') {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DETAIL,
        actionTypes.LOAD_DETAIL_SUCCEED,
        actionTypes.LOAD_DETAIL_FAIL,
      ],
      endpoint: 'v1/crm/order/detail',
      method: 'get',
      params: { shipmtOrderNo, tenantId },
      tabKey,
    },
  };
}

export function loadClearanceDetail({ delgNos, tenantId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CLEARANCE_DETAIL,
        actionTypes.LOAD_CLEARANCE_DETAIL_SUCCEED,
        actionTypes.LOAD_CLEARANCE_DETAIL_FAILED,
      ],
      endpoint: 'v1/crm/delegation/detail',
      method: 'get',
      params: { delgNos, tenantId },
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

export function loadTransportDetail({ shipmtNos, tenantId }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRANSPORT_DETAIL,
        actionTypes.LOAD_TRANSPORT_DETAIL_SUCCEED,
        actionTypes.LOAD_TRANSPORT_DETAIL_FAILED,
      ],
      endpoint: 'v1/crm/transport/shipment/detail',
      method: 'get',
      params: { shipmtNos, tenantId },
    },
  };
}

export function changeDockTab(tabKey) {
  return {
    type: actionTypes.CHANGE_DOCK_TAB,
    data: { tabKey },
  };
}

export function hideDock() {
  return {
    type: actionTypes.HIDE_DOCK,
  };
}

export function showDock() {
  return {
    type: actionTypes.SHOW_DOCK,
  };
}

export function loadFlowNodeData(nodeuuid, kind) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FLOWNODE,
        actionTypes.LOAD_FLOWNODE_SUCCEED,
        actionTypes.LOAD_FLOWNODE_FAILED,
      ],
      endpoint: 'v1/scof/flow/graph/node',
      method: 'get',
      params: { uuid: nodeuuid, kind },
    },
  };
}

export function loadOrderProgress(orderNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ORDERPROG,
        actionTypes.LOAD_ORDERPROG_SUCCEED,
        actionTypes.LOAD_ORDERPROG_FAILED,
      ],
      endpoint: 'v1/crm/order/flow/progress',
      method: 'get',
      params: { order_no: orderNo },
    },
  };
}

export function loadOrderNodes(orderNo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ORDER_NODES,
        actionTypes.LOAD_ORDER_NODES_SUCCEED,
        actionTypes.LOAD_ORDER_NODES_FAIL,
      ],
      endpoint: 'v1/scof/order/instance/nodes',
      method: 'get',
      params: { orderNo },
    },
  };
}

export function loadOrderNodesTriggers(uuid, bizObjects) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ORDER_NODES_TRIGGERS,
        actionTypes.LOAD_ORDER_NODES_TRIGGERS_SUCCEED,
        actionTypes.LOAD_ORDER_NODES_TRIGGERS_FAIL,
      ],
      endpoint: 'v1/scof/order/nodes/triggers/load',
      method: 'post',
      data: { uuid, bizObjects },
    },
  };
}
