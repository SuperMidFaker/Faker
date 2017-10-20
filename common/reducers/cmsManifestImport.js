import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/manifest/import', [
  'LOAD_DECLENTR', 'LOAD_DECLENTR_SUCCEED', 'LOAD_DECLENTR_FAIL',
]);

const initialState = {
  submitting: false,
  declBodyModal: { visible: false },
  declEntries: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}

export function loadDeclEntries(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DECLENTR,
        actionTypes.LOAD_DECLENTR_SUCCEED,
        actionTypes.LOAD_DECLENTR_FAIL,
      ],
      endpoint: 'v1/cms/manifest/decl/entries',
      method: 'get',
      params,
    },
  };
}
