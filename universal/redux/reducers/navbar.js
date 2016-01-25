import { createActionTypes } from '../../../reusable/common/redux-actions';
const actionTypes = createActionTypes('@@welogix/navbar/', [
  'NAVB_SET_TITLE']);

const initialState = {
  navTitle: {
    hierarchy: 1,
    title: '',
    withModuleLayout: false,
    backUrl: ''
  }
};

export default function reducer(state=initialState, action) {
  switch (action.type) {
  case actionTypes.NAVB_SET_TITLE:
    return {...state, navTitle: action.navInfo};
  default:
    return state;
  }
}
