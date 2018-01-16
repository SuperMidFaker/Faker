// import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scof/settings/', [
  'TOGGLE_ORDER_CONFIG_MODAL',
]);

const initialState = {
  orderConfigModal: {
    visible: false,
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.TOGGLE_ORDER_CONFIG_MODAL:
      return { ...state, orderConfigModal: { ...state.orderConfigModal, visible: action.visible } };
    default:
      return state;
  }
}

export function toggleOrderConfigModal(visible) {
  return {
    type: actionTypes.TOGGLE_ORDER_CONFIG_MODAL,
    visible,
  };
}
