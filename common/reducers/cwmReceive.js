import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/receive/', [
  'LOAD_RECEIVE_MODAL', 'HIDE_RECEIVE_MODAL',
]);

const initialState = {
  receiveModal: {
    visible: false,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_RECEIVE_MODAL:
      return { ...state, receiveModal: { ...state.receiveModal, visible: true } };
    case actionTypes.HIDE_RECEIVE_MODAL:
      return { ...state, receiveModal: { ...state.receiveModal, visible: false } };
    default:
      return state;
  }
}

export function loadReceiveModal() {
  return {
    type: actionTypes.LOAD_RECEIVE_MODAL,
  };
}

export function hideReceiveModal() {
  return {
    type: actionTypes.HIDE_RECEIVE_MODAL,
  };
}
