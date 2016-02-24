import { CLIENT_API } from '../../../reusable/redux-middlewares/api';
import { createActionTypes } from '../../../reusable/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/invitation/', [
  'RECEIVEDS_LOAD', 'RECEIVEDS_LOAD_SUCCEED', 'RECEIVEDS_LOAD_FAIL',
  'SENTS_LOAD', 'SENTS_LOAD_SUCCEED', 'SENTS_LOAD_FAIL',
  'INVITATION_CHANGE', 'INVITATION_CHANGE_SUCCEED', 'INVITATION_CHANGE_FAIL'
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
    loaded: false,
    loading: false,
    pageSize: 10,
    current: 1,
    totalCount: 0,
    data: [
      /* { key:, name:, other db column } */
    ]
  }
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.RECEIVEDS_LOAD:
      return { ...state, receiveds: { ...state.receiveds, loading: true } };
    case actionTypes.RECEIVEDS_LOAD_SUCCEED:
      return {
        ...state,
        receiveds: {
          ...state.receiveds, loading: false, loaded: true,
          ...action.result.data
        }
      };
    case actionTypes.RECEIVEDS_LOAD_FAIL:
      return { ...state, receiveds: { ...state.receiveds, loading: false } };
    case actionTypes.SENTS_LOAD:
      return { ...state, sents: { ...state.sents, loading: true } };
    case actionTypes.SENTS_LOAD_SUCCEED:
      return {
        ...state,
        sents: {
          ...state.sents, loading: false, loaded: true,
          ...action.result.data
        }
      };
    case actionTypes.SENTS_LOAD_FAIL:
      return { ...state, sents: { ...state.sents, loading: false } };
    case actionTypes.INVITATION_CHANGE_SUCCEED: {
      const receiveds = { ...state.receiveds };
      receiveds.data[action.index].status = action.result.data;
      return { ...state, receiveds };
    }
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

export function change(key, type, index) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.INVITATION_CHANGE, actionTypes.INVITATION_CHANGE_SUCCEED,
        actionTypes.INVITATION_CHANGE_FAIL],
      endpoint: 'v1/cooperation/invitation',
      method: 'post',
      index,
      data: {
        key,
        type
      }
    }
  };
}

export function loadSents(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.SENTS_LOAD, actionTypes.SENTS_LOAD_SUCCEED,
        actionTypes.SENTS_LOAD_FAIL],
      endpoint: 'v1/cooperation/invitations/out',
      method: 'get',
      params,
      cookie
    }
  };
}

export function cancel(key, index) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.INVITATION_CHANGE, actionTypes.INVITATION_CHANGE_SUCCEED,
        actionTypes.INVITATION_CHANGE_FAIL],
      endpoint: 'v1/cooperation/invitation/cancel',
      method: 'post',
      index,
      data: {
        key
      }
    }
  };
}
