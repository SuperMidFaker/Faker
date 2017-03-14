import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scof/flow/', [
  'OPEN_CREATE_FLOW_MODAL', 'CLOSE_CREATE_FLOW_MODAL',
  'OPEN_ADD_TRIGGER_MODAL', 'CLOSE_ADD_TRIGGER_MODAL',
  'LOAD_CMSBIZPARAMS', 'LOAD_CMSBIZPARAMS_SUCCEED', 'LOAD_CMSBIZPARAMS_FAIL',
  'UPDATE_FLOWELEMENT_MAP', 'UPDATE_FLOWELEMENT',
  'SAVE_GRAPH', 'SAVE_GRAPH_SUCCEED', 'SAVE_GRAPH_FAIL',
  'ADD_ACTIVE_NODE', 'ADD_ACTIVE_EDGE',
]);

const initialState = {
  createFlowModal: {
    visible: false,
  },
  addTriggerModal: {
    visible: false,
  },
  currentFlow: { customer_partner_id: null },
  activeNode: { addedActions: [], delActions: [], updActions: [] },
  activeEdge: { addedConds: [], delConds: [], updConds: [] },
  cmsParams: {
    bizDelegation: { declPorts: [], customsBrokers: [], ciqBrokers: [] },
    quotes: [],
    bizManifest: { trades: [], agents: [], templates: [] },
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.OPEN_CREATE_FLOW_MODAL:
      return { ...state, createFlowModal: { visible: true } };
    case actionTypes.CLOSE_CREATE_FLOW_MODAL:
      return { ...state, createFlowModal: { visible: false } };
    case actionTypes.CREATE_FLOW_SUCCEED:
      return { ...state, reload: true };
    case actionTypes.OPEN_ADD_TRIGGER_MODAL:
      return { ...state, addTriggerModal: { visible: true } };
    case actionTypes.CLOSE_ADD_TRIGGER_MODAL:
      return { ...state, addTriggerModal: { visible: false } };
    case actionTypes.ADD_TRIGGER_SUCCEED:
      return { ...state, reload: true };
    case actionTypes.LOAD_CMSBIZPARAMS_SUCCEED:
      return { ...state, cmsParams: { ...state.cmsParams, ...action.result.data } };
    case actionTypes.UPDATE_NODES_MAP: {
      const nodesMap = { ...state.nodesMap };
      nodesMap[action.data.uuid] = action.data;
      return { ...state, nodesMap, activeNode: action.data };
    }
    case actionTypes.UPDATE_EDGES_MAP: {
      const edgesMap = { ...state.edgesMap };
      edgesMap[action.data.uuid] = action.data;
      return { ...state, edgesMap, activeEdge: action.data };
    }
    case actionTypes.ADD_ACTIVE_NODE: {
      const nodesMap = { ...state.nodesMap };
      nodesMap[action.data.uuid] = action.data;
      return { ...state, nodesMap, activeEdge: initialState.activeEdge, activeNode: { ...initialState.activeNode, ...action.data } };
    }
    case actionTypes.ADD_ACTIVE_EDGE: {
      const edgesMap = { ...state.edgesMap };
      edgesMap[action.data.uuid] = action.data;
      return { ...state, edgesMap, activeNode: initialState.activeNode, activeEdge: { ...initialState.activeEdge, ...action.data } };
    }
    case actionTypes.UPDATE_ACTIVE_ELEMENT:
      return { ...state, activeNode: action.data.node, activeEdge: action.data.edge };
    default:
      return state;
  }
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

export function updateEdgesMap(edge) {
  return {
    type: actionTypes.UPDATE_EDGES_MAP,
    data: edge,
  };
}

export function addActiveNode(node) {
  return {
    type: actionTypes.ADD_ACTIVE_NODE,
    data: node,
  };
}

export function addActiveEdge(edge) {
  return {
    type: actionTypes.ADD_ACTIVE_EDGE,
    data: edge,
  };
}

export function updateActiveElement(node, edge) {
  return {
    type: actionTypes.UPDATE_ACTIVE_ELEMENT,
    data: { node, edge },
  };
}
