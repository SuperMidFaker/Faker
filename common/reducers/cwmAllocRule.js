import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/whse/allocrule', [
  'SHOW_ALLOCRULE_MODAL',
]);

const initialState = {
  allocRuleModalVisible: false,
  allocRuleModal: {
    ownerAllocRule: {},
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.SHOW_ALLOCRULE_MODAL:
      return {
        ...state,
        allocRuleModalVisible: action.data.visible,
        allocRuleModal: { ...state.allocRuleModal, ownerAllocRule: action.data.rule },
      };
    default:
      return state;
  }
}

export function showAllocRuleModal({ visible, rule }) {
  return {
    type: actionTypes.SHOW_ALLOCRULE_MODAL,
    data: { visible, rule },
  };
}
