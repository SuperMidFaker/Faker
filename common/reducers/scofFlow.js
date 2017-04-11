import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scof/flow/', [
  'TOGGLE_FLOW_LIST',
  'OPEN_CREATE_FLOW_MODAL', 'CLOSE_CREATE_FLOW_MODAL',
  'OPEN_ADD_TRIGGER_MODAL', 'CLOSE_ADD_TRIGGER_MODAL',
  'LOAD_FLOWLIST', 'LOAD_FLOWLIST_SUCCEED', 'LOAD_FLOWLIST_FAIL',
  'LOAD_CMSBIZPARAMS', 'LOAD_CMSBIZPARAMS_SUCCEED', 'LOAD_CMSBIZPARAMS_FAIL',
  'LOAD_TMSBIZPARAMS', 'LOAD_TMSBIZPARAMS_SUCCEED', 'LOAD_TMSBIZPARAMS_FAIL',
  'LOAD_CUSTOMERQUOTES', 'LOAD_CUSTOMERQUOTES_SUCCEED', 'LOAD_CUSTOMERQUOTES_FAIL',
  'SAVE_FLOW', 'SAVE_FLOW_SUCCEED', 'SAVE_FLOW_FAIL',
  'EDIT_FLOW', 'EDIT_FLOW_SUCCEED', 'EDIT_FLOW_FAIL',
  'RELOAD_FLOWLIST', 'RELOAD_FLOWLIST_SUCCEED', 'RELOAD_FLOWLIST_FAIL',
  'LOAD_GRAPH', 'LOAD_GRAPH_SUCCEED', 'LOAD_GRAPH_FAIL',
  'LOAD_GRAPHITEM', 'LOAD_GRAPHITEM_SUCCEED', 'LOAD_GRAPHITEM_FAIL',
  'SAVE_GRAPH', 'SAVE_GRAPH_SUCCEED', 'SAVE_GRAPH_FAIL',
  'LOAD_PTFLOWS', 'LOAD_PTFLOWLIST_SUCCEED', 'LOAD_PTFLOWLIST_FAIL',
  'OPEN_FLOW', 'SET_NODE_ACTIONS', 'EMPTY_FLOWS',
]);

const initialState = {
  listCollapsed: false,
  graphLoading: false,
  visibleFlowModal: false,
  visibleTriggerModal: false,
  triggerModal: {
    key: '',
    name: '',
    actions: [],
  },
  partnerFlows: [],
  flowList: {
    totalCount: 0,
    pageSize: 20,
    current: 1,
    data: [],
  },
  flowListLoading: false,
  reloadFlowList: false,
  submitting: false,
  listFilter: { name: '' },
  currentFlow: null,
  flowGraph: { nodes: [], edges: [] },
  nodeActions: [],
  cmsParams: {
    bizDelegation: { declPorts: [], customsBrokers: [], ciqBrokers: [] },
    quotes: [],
    bizManifest: { trades: [], agents: [], templates: [] },
  },
  cmsQuotes: [],
  tmsParams: { consigners: [], consignees: [], transitModes: [], packagings: [] },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TOGGLE_FLOW_LIST:
      return { ...state, listCollapsed: !state.listCollapsed };
    case actionTypes.OPEN_CREATE_FLOW_MODAL:
      return { ...state, visibleFlowModal: true };
    case actionTypes.CLOSE_CREATE_FLOW_MODAL:
      return { ...state, visibleFlowModal: false };
    case actionTypes.SAVE_FLOW:
      return { ...state, submitting: true };
    case actionTypes.SAVE_FLOW_FAIL:
      return { ...state, submitting: false };
    case actionTypes.SAVE_FLOW_SUCCEED:
      return { ...state, reloadFlowList: true, submitting: false, currentFlow: action.result.data };
    case actionTypes.OPEN_ADD_TRIGGER_MODAL:
      return { ...state, visibleTriggerModal: true, triggerModal: action.data };
    case actionTypes.CLOSE_ADD_TRIGGER_MODAL:
      return { ...state, visibleTriggerModal: false };
    case actionTypes.LOAD_CMSBIZPARAMS_SUCCEED:
      return { ...state, cmsParams: { ...state.cmsParams, ...action.result.data } };
    case actionTypes.LOAD_CUSTOMERQUOTES_SUCCEED:
      return { ...state, cmsQuotes: action.result.data };
    case actionTypes.LOAD_TMSBIZPARAMS_SUCCEED:
      return { ...state, tmsParams: action.result.data };
    case actionTypes.LOAD_FLOWLIST:
      return { ...state, flowListLoading: true, listFilter: JSON.parse(action.params.filter) };
    case actionTypes.LOAD_FLOWLIST_FAIL:
      return { ...state, flowListLoading: false };
    case actionTypes.LOAD_FLOWLIST_SUCCEED: {
      const flowList = action.result.data;
      const currentFlow = flowList.data[0];
      return { ...state, flowListLoading: false, flowList, currentFlow };
    }
    case actionTypes.RELOAD_FLOWLIST:
      return { ...state, flowListLoading: true, listFilter: JSON.parse(action.params.filter) };
    case actionTypes.RELOAD_FLOWLIST_FAIL:
      return { ...state, flowListLoading: false };
    case actionTypes.RELOAD_FLOWLIST_SUCCEED:
      return { ...state, flowListLoading: false, reloadFlowList: false, flowList: action.result.data };
    case actionTypes.OPEN_FLOW:
      return { ...state, currentFlow: action.data };
    case actionTypes.LOAD_GRAPH:
      return { ...state, graphLoading: true };
    case actionTypes.LOAD_GRAPH_SUCCEED:
      return { ...state, flowGraph: action.result.data, graphLoading: false };
    case actionTypes.LOAD_GRAPH_FAIL:
      return { ...state, graphLoading: false };
    case actionTypes.SET_NODE_ACTIONS:
      return { ...state, nodeActions: action.data };
    case actionTypes.LOAD_PTFLOWLIST_SUCCEED:
      return { ...state, partnerFlows: action.result.data };
    case actionTypes.EMPTY_FLOWS:
      return { ...state, partnerFlows: [], cmsQuotes: [] };
    default:
      return state;
  }
}

export function loadFlowList(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_FLOWLIST,
        actionTypes.LOAD_FLOWLIST_SUCCEED,
        actionTypes.LOAD_FLOWLIST_FAIL,
      ],
      endpoint: 'v1/scof/list/flows',
      method: 'get',
      params,
    },
  };
}

export function loadPartnerFlowList(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PTFLOWS,
        actionTypes.LOAD_PTFLOWLIST_SUCCEED,
        actionTypes.LOAD_PTFLOWLIST_FAIL,
      ],
      endpoint: 'v1/scof/partner/flows',
      method: 'get',
      params,
    },
  };
}

export function reloadFlowList(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.RELOAD_FLOWLIST,
        actionTypes.RELOAD_FLOWLIST_SUCCEED,
        actionTypes.RELOAD_FLOWLIST_FAIL,
      ],
      endpoint: 'v1/scof/list/flows',
      method: 'get',
      params,
    },
  };
}

export function toggleFlowList() {
  return {
    type: actionTypes.TOGGLE_FLOW_LIST,
  };
}

export function openCreateFlowModal() {
  return {
    type: actionTypes.OPEN_CREATE_FLOW_MODAL,
  };
}

export function closeCreateFlowModal() {
  return {
    type: actionTypes.CLOSE_CREATE_FLOW_MODAL,
  };
}

export function saveFlow(flow) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_FLOW,
        actionTypes.SAVE_FLOW_SUCCEED,
        actionTypes.SAVE_FLOW_FAIL,
      ],
      endpoint: 'v1/scof/create/flow',
      method: 'post',
      data: flow,
    },
  };
}

export function editFlow(flowid, newflow) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_FLOW,
        actionTypes.EDIT_FLOW_SUCCEED,
        actionTypes.EDIT_FLOW_FAIL,
      ],
      endpoint: 'v1/scof/edit/flow',
      method: 'post',
      data: { flowid, flow: newflow },
    },
  };
}

export function openFlow(flow) {
  return {
    type: actionTypes.OPEN_FLOW,
    data: flow,
  };
}

export function openAddTriggerModal(trigger) {
  return {
    type: actionTypes.OPEN_ADD_TRIGGER_MODAL,
    data: trigger,
  };
}

export function closeAddTriggerModal() {
  return {
    type: actionTypes.CLOSE_ADD_TRIGGER_MODAL,
  };
}

export function loadCmsBizParams(tenantId, partnerId, ietype) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CMSBIZPARAMS,
        actionTypes.LOAD_CMSBIZPARAMS_SUCCEED,
        actionTypes.LOAD_CMSBIZPARAMS_FAIL,
      ],
      endpoint: 'v1/scof/flow/cms/params',
      method: 'get',
      params: { tenantId, partnerId, ietype },
    },
  };
}

export function loadCustomerQuotes(tenantId, customerPartnerId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CUSTOMERQUOTES,
        actionTypes.LOAD_CUSTOMERQUOTES_SUCCEED,
        actionTypes.LOAD_CUSTOMERQUOTES_FAIL,
      ],
      endpoint: 'v1/cms/send/partner/quotes',
      method: 'get',
      origin: 'mongo',
      params: { recv_tenant_id: tenantId, send_partner_id: customerPartnerId },
    },
  };
}

export function loadTmsBizParams(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TMSBIZPARAMS,
        actionTypes.LOAD_TMSBIZPARAMS_SUCCEED,
        actionTypes.LOAD_TMSBIZPARAMS_FAIL,
      ],
      endpoint: 'v1/scof/flow/tms/params',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function loadFlowGraph(flowid) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_GRAPH,
        actionTypes.LOAD_GRAPH_SUCCEED,
        actionTypes.LOAD_GRAPH_FAIL,
      ],
      endpoint: 'v1/scof/flow/graph',
      method: 'get',
      params: { flow: flowid },
    },
  };
}

export function loadFlowGraphItem(model) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_GRAPHITEM,
        actionTypes.LOAD_GRAPHITEM_SUCCEED,
        actionTypes.LOAD_GRAPHITEM_FAIL,
      ],
      endpoint: 'v1/scof/flow/graph/nodeedge',
      method: 'get',
      params: model,
    },
  };
}

export function setNodeActions(actions) {
  return {
    type: actionTypes.SET_NODE_ACTIONS,
    data: actions,
  };
}

export function saveFlowGraph(flowid, nodes, edges) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_GRAPH,
        actionTypes.SAVE_GRAPH_SUCCEED,
        actionTypes.SAVE_GRAPH_FAIL,
      ],
      endpoint: 'v1/scof/flow/update/graph',
      method: 'post',
      data: { flowid, nodes, edges },
    },
  };
}

export function emptyFlows() {
  return { type: actionTypes.EMPTY_FLOWS };
}
