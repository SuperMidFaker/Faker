import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/invitation/', [
  'RECEIVEDS_LOAD', 'RECEIVEDS_LOAD_SUCCEED', 'RECEIVEDS_LOAD_FAIL'
]);

const initialState = {
  receiveds: {
    loaded: false,
    loading: false,
    pageSize: 10,
    current: 1,
    totalCount: 0,
    data: [
      /* { key:, name:, other db column } */
    ]
  },
  sents: {
  }
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.RECEIVEDS_LOAD:
      return { ...state, ...{ ...state.receiveds, loading: true } };
    case actionTypes.RECEIVEDS_LOAD_SUCCEED:
      return {
        ...state,
        ...{
          ...state.receiveds, loading: false, loaded: true,
          ...action.result.data
        }
      };
    case actionTypes.RECEIVEDS_LOAD_FAIL:
      return { ...state, ...{ ...state.received, loading: false } };
    default:
      return state;
  }
}

export function loadReceiveds(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.RECEIVEDS_LOAD, actionTypes.RECEIVEDS_LOAD_SUCCEED,
        actionTypes.RECEIVEDS_LOAD_FAIL],
      endpoint: 'v1/cooperation/invitations/in',
      method: 'get',
      params,
      cookie
    }
  };
}
