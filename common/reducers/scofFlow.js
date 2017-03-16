import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scof/flow/', [
  'OPEN_CREATE_FLOW_MODAL', 'CLOSE_CREATE_FLOW_MODAL',
  'OPEN_ADD_TRIGGER_MODAL', 'CLOSE_ADD_TRIGGER_MODAL',
  'LOAD_FLOWLIST', 'LOAD_FLOWLIST_SUCCEED', 'LOAD_FLOWLIST_FAIL',
  'LOAD_CMSBIZPARAMS', 'LOAD_CMSBIZPARAMS_SUCCEED', 'LOAD_CMSBIZPARAMS_FAIL',
  'SAVE_FLOW', 'SAVE_FLOW_SUCCEED', 'SAVE_FLOW_FAIL',
  'RELOAD_FLOWLIST', 'RELOAD_FLOWLIST_SUCCEED', 'RELOAD_FLOWLIST_FAIL',
  'LOAD_GRAPH', 'LOAD_GRAPH_SUCCEED', 'LOAD_GRAPH_FAIL',
  'LOAD_GRAPHITEM', 'LOAD_GRAPHITEM_SUCCEED', 'LOAD_GRAPHITEM_FAIL',
  'SAVE_GRAPH', 'SAVE_GRAPH_SUCCEED', 'SAVE_GRAPH_FAIL',
  'OPEN_FLOW',
]);

const initialState = {
  visibleFlowModal: false,
  visibleTriggerModal: false,
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
  cmsParams: {
    bizDelegation: { declPorts: [], customsBrokers: [], ciqBrokers: [] },
    quotes: [],
    bizManifest: { trades: [], agents: [], templates: [] },
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
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
      return { ...state, visibleTriggerModal: true };
    case actionTypes.CLOSE_ADD_TRIGGER_MODAL:
      return { ...state, visibleTriggerModal: false };
    case actionTypes.LOAD_CMSBIZPARAMS_SUCCEED:
      return { ...state, cmsParams: { ...state.cmsParams, ...action.result.data } };
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
    case actionTypes.LOAD_GRAPH_SUCCEED:
      return { ...state, flowGraph: action.result.data };
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

export function openFlow(flow) {
  return {
    type: actionTypes.OPEN_FLOW,
    data: flow,
  };
}

export function openAddTriggerModal() {
  return {
    type: actionTypes.OPEN_ADD_TRIGGER_MODAL,
  };
}

export function closeAddTriggerModal() {
  return {
    type: actionTypes.CLOSE_ADD_TRIGGER_MODAL,
  };
}

export function loadCmsBizParams(tenantId, ietype) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CMSBIZPARAMS,
        actionTypes.LOAD_CMSBIZPARAMS_SUCCEED,
        actionTypes.LOAD_CMSBIZPARAMS_FAIL,
      ],
      endpoint: 'v1/scof/flow/cms/params',
      method: 'get',
      params: { tenantId, ietype },
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
