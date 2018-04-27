import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/events/', [
  'TOGGLE_EVENTS_MODAL',
  'CREATE_PREF', 'CREATE_PREF_SUCCEED', 'CREATE_PREF_FAIL',
  'GET_PREF', 'GET_PREF_SUCCEED', 'GET_PREF_FAIL',
]);

const initialState = {
  eventsModal: {
    visible: false,
    event: '',
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TOGGLE_EVENTS_MODAL:
      return { ...state, eventsModal: { visible: action.data.visible, event: action.data.event } };
    default:
      return state;
  }
}

export function toggleEventsModal(visible, event) {
  return {
    type: actionTypes.TOGGLE_EVENTS_MODAL,
    data: { visible, event },
  };
}

export function createPref(event, feeCodes) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.CREATE_PREF,
        actionTypes.CREATE_PREF_SUCCEED,
        actionTypes.CREATE_PREF_FAIL,
      ],
      endpoint: 'v1/cms/pref/create',
      method: 'post',
      data: { event, feeCodes },
    },
  };
}

export function getPref(event) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.GET_PREF,
        actionTypes.GET_PREF_SUCCEED,
        actionTypes.GET_PREF_FAIL,
      ],
      endpoint: 'v1/cms/pref/get',
      method: 'get',
      params: { event },
    },
  };
}

