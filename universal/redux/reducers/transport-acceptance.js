import { CLIENT_API } from 'reusable/redux-middlewares/api';
import { createActionTypes } from 'reusable/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/acceptance', [
  'SET_FORM_FIELD',
]);

const initialState = {
  shipmtTable: {
  }
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}
