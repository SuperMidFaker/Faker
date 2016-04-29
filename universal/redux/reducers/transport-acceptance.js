import { CLIENT_API } from 'reusable/redux-middlewares/api';
import { createActionTypes } from 'reusable/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/acceptance', [
  'SAVE_SHIPMT', 'SAVE_SHIPMT_FAIL', 'SAVE_SHIPMT_SUCCEED',
  'SAVE_DRAFT', 'SAVE_DRAFT_FAIL', 'SAVE_DRAFT_SUCCEED',
  'LOAD_APTSHIPMENT', 'LOAD_APTSHIPMENT_FAIL', 'LOAD_APTSHIPMENT_SUCCEED',
]);

const initialState = {
  table: {
    loaded: false,
    loading: false,
    filters: [
      { name: 'type', value : 'unaccepted' },
      /* { name: 'shipmt_no', value: ''} */
    ],
    submitting: false,
    shipmentlist: {
      totalCount: 0,
      pageSize: 10,
      current: 1,
      data: [],
    }
  }
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_APTSHIPMENT:
      return { ...state, table: { ...state.table, loading: true }};
    case actionTypes.LOAD_APTSHIPMENT_FAIL:
      return { ...state, table: { ...state.table, loading: false }};
    case actionTypes.LOAD_APTSHIPMENT_SUCCEED:
      return { ...state, table: { ...state.table, loading: false,
        loaded: true, shipmentlist: action.result.data,
        filters: JSON.parse(action.params.filters)
    }};
    default:
      return state;
  }
}

export function loadTable(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_APTSHIPMENT,
        actionTypes.LOAD_APTSHIPMENT_SUCCEED,
        actionTypes.LOAD_APTSHIPMENT_FAIL,
      ],
      endpoint: 'v1/transport/shipments',
      method: 'get',
      params,
      cookie
    }
  };
}

export function saveAndAccept(shipment, sp) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_SHIPMT,
        actionTypes.SAVE_SHIPMT_FAIL,
        actionTypes.SAVE_SHIPMT_SUCCEED,
      ],
      method: 'post',
      endpoint: 'v1/transport/shipment/saveaccept',
      data: { shipment, sp },
    }
  };
}

export function saveDraft(shipment, sp) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_DRAFT,
        actionTypes.SAVE_DRAFT_FAIL,
        actionTypes.SAVE_DRAFT_SUCCEED,
      ],
      method: 'post',
      endpoint: 'v1/transport/shipment/draft',
      data: { shipment, sp },
    }
  };
}
