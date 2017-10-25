import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/resources/', [
  'ALTER_BROKER',
  'LOAD_BROKERS', 'LOAD_BROKERS_SUCCEED', 'LOAD_BROKERS_FAIL',
  'ADD_BROKER', 'ADD_BROKER_SUCCEED', 'ADD_BROKER_FAIL',
  'EDIT_BROKER', 'EDIT_BROKER_SUCCEED', 'EDIT_BROKER_FAIL',
  'CHANGE_BROKER_STATUS', 'CHANGE_BROKER_STATUS_SUCCEED', 'CHANGE_BROKER_STATUS_FAIL',
  'DELETE_BROKER', 'DELETE_BROKER_SUCCEED', 'DELETE_BROKER_FAIL',
]);

const initialState = {
  brokerModal: {
    visible: false,
    operation: 'add',
  },
  brokers: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_BROKERS_SUCCEED:
      return { ...state, brokers: action.result.data };
    case actionTypes.ALTER_BROKER:
      return { ...state, brokerModal: action.data };
    default:
      return state;
  }
}

export function toggleBrokerModal(visible, operation = '') {
  return {
    type: actionTypes.ALTER_BROKER,
    data: { visible, operation },
  };
}

export function loadCmsBrokers() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_BROKERS,
        actionTypes.LOAD_BROKERS_SUCCEED,
        actionTypes.LOAD_BROKERS_FAIL,
      ],
      endpoint: 'v1/cms/brokers/load',
      method: 'get',
    },
  };
}

export function addBroker(name, customsCode, code, ieType, loginId, loginName, id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_BROKER,
        actionTypes.ADD_BROKER_SUCCEED,
        actionTypes.ADD_BROKER_FAIL,
      ],
      endpoint: 'v1/cms/broker/add',
      method: 'post',
      data: { name, customsCode, code, ieType, loginId, loginName, id },
    },
  };
}

export function editBroker(id, name, customsCode, code, ieType) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_BROKER,
        actionTypes.EDIT_BROKER_SUCCEED,
        actionTypes.EDIT_BROKER_FAIL,
      ],
      endpoint: 'v1/cms/broker/edit',
      method: 'post',
      data: { id, name, customsCode, code, ieType },
    },
  };
}

export function changeBrokerStatus(id, status) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CHANGE_BROKER_STATUS,
        actionTypes.CHANGE_BROKER_STATUS_SUCCEED,
        actionTypes.CHANGE_BROKER_STATUS_FAIL,
      ],
      endpoint: 'v1/cms/broker/status/change',
      method: 'post',
      data: { id, status },
    },
  };
}

export function deleteBroker(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.DELETE_BROKER,
        actionTypes.DELETE_BROKER_SUCCEED,
        actionTypes.DELETE_BROKER_FAIL,
      ],
      endpoint: 'v1/cms/broker/delete',
      method: 'post',
      data: { id },
    },
  };
}
