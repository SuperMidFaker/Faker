import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/stock/', [
  'OPEN_MOVEMENT_MODAL', 'CLOSE_MOVEMENT_MODAL',
]);
const initialState = {
  movementModal: {
    visible: false,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.OPEN_MOVEMENT_MODAL:
      return { ...state, movementModal: { ...state.movementModal, visible: true, ...action.data } };
    case actionTypes.CLOSE_MOVEMENT_MODAL:
      return { ...state, movementModal: { ...state.movementModal, visible: false } };
    default:
      return state;
  }
}

export function openMovementModal() {
  return {
    type: actionTypes.OPEN_MOVEMENT_MODAL,
  };
}

export function closeMovementModal() {
  return {
    type: actionTypes.CLOSE_MOVEMENT_MODAL,
  };
}
