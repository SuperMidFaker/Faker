import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scof/flow/', [
  'OPEN_ADD_TRIGGER_MODAL', 'CLOSE_ADD_TRIGGER_MODAL',
]);

const initialState = {
  addTriggerModal: {
    visible: false,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.OPEN_ADD_TRIGGER_MODAL:
      return { ...state, addTriggerModal: { visible: true } };
    case actionTypes.CLOSE_ADD_TRIGGER_MODAL:
      return { ...state, addTriggerModal: { visible: false } };
    case actionTypes.ADD_TRIGGER_SUCCEED:
      return { ...state, reload: true };
    default:
      return state;
  }
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
