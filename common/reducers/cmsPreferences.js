import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/preferences/', [
  'SWITCH_NAV_OPTION',
]);

const initialState = {
  navOption: 'CC',
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.SWITCH_NAV_OPTION:
      return { ...state, navOption: action.data };
    default:
      return state;
  }
}

export function switchNavOption(navOption) {
  return {
    type: actionTypes.SWITCH_NAV_OPTION,
    data: navOption,
  };
}
