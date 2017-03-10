import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scof/flow/', [
  'OPEN_CREATE_FLOW_MODAL', 'CLOSE_CREATE_FLOW_MODAL',
  'OPEN_ADD_TRIGGER_MODAL', 'CLOSE_ADD_TRIGGER_MODAL',
  'LOAD_CMSBIZPARAMS', 'LOAD_CMSBIZPARAMS_SUCCEED', 'LOAD_CMSBIZPARAMS_FAIL',
  'UPDATE_FLOWELEMENT_MAP', 'UPDATE_FLOWELEMENT',
]);

const initialState = {
  createFlowModal: {
    visible: false,
  },
  addTriggerModal: {
    visible: false,
  },
  currentFlow: { customer_parnter_id: null },
  flowElementMap: {},
  activeElement: { addedActions: [], delActions: [], updatedActions: [] },
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
    case actionTypes.UPDATE_FLOWELEMENT_MAP: {
      const elemMap = { ...state.flowElementMap };
      elemMap[action.data.uuid] = action.data.element;
      return { ...state, flowElementMap: elemMap };
    }
    case actionTypes.UPDATE_FLOWELEMENT:
      return { ...state, activeElement: { ...initialState.activeElement, ...action.data } };
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

export function updateFlowElementMap(uuid, element) {
  return {
    type: actionTypes.UPDATE_FLOWELEMENT_MAP,
    data: { uuid, element },
  };
}
export function updateActiveElement(activeElem) {
  return {
    type: actionTypes.UPDATE_FLOWELEMENT,
    data: activeElem,
  };
}
