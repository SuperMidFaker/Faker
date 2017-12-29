import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/trade/permit/', [
  'LOAD_PERMITS', 'LOAD_PERMITS_SUCCEED', 'LOAD_PERMITS_FAIL',
  'SHOW_PERMIT_MODAL', 'HIDE_PERMIT_MODAL',
]);

const initialState = {
  permitList: {
    totalCount: 0,
    current: 1,
    pageSize: 20,
    data: [],
  },
  permitListFilter: {
    ieType: 'all',
  },
  permitModal: {
    visible: false,
    data: {},
  },
  permitHead: {
    head: {},
  },
  permitItems: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_PERMITS:
      return { ...state, permitList: { ...state.permitList, loading: true } };
    case actionTypes.LOAD_PERMITS_SUCCEED:
      return {
        ...state,
        permitList: { ...state.permitList, loading: false, ...action.result.data },
        permitListFilter: JSON.parse(action.params.filter),
      };
    case actionTypes.LOAD_PERMITS_FAIL:
      return { ...state, permitList: { ...state.permitList, loading: false } };
    case actionTypes.SHOW_PERMIT_MODAL:
      return { ...state, permitModal: { ...state.permitModal, visible: true, data: action.record } };
    case actionTypes.HIDE_PERMIT_MODAL:
      return { ...state, permitModal: { ...state.permitModal, visible: false, data: {} } };
    default:
      return state;
  }
}

export function loadPermits(params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PERMITS,
        actionTypes.LOAD_PERMITS_SUCCEED,
        actionTypes.LOAD_PERMITS_FAIL,
      ],
      endpoint: 'v1/cms/permit/load',
      method: 'get',
      params,
    },
  };
}


export function showPermitModal(record) {
  return {
    type: actionTypes.SHOW_PERMIT_MODAL,
    record,
  };
}

export function hidePermitModal() {
  return {
    type: actionTypes.HIDE_PERMIT_MODAL,
  };
}
