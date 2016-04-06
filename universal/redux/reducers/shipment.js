import { CLIENT_API } from 'reusable/redux-middlewares/api';
import { createActionTypes } from 'reusable/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/shipment/', [
  'LOAD_SHIPMENT', 'LOAD_SHIPMENT_FAIL', 'LOAD_SHIPMENT_SUCCEED',
]);

const initialState = {
  loaded: false,
  loading: false,
  filters: [
    /* { name: , value: } */
  ],
  shipmentlist: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: [
    ]
  }
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_SHIPMENT:
      return { ...state, loading: true };
    case actionTypes.LOAD_SHIPMENT_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_SHIPMENT_SUCCEED:
      return { ...state, loading: false, loaded: true, shipmentlist: action.result.data };
  }
}

export function loadTable(cookie, params) {
  return {
    [CLIENT_API]: {
      types: [actionTypes.LOAD_SHIPMENT, actionTypes.LOAD_SHIPMENT_SUCCEED,
        actionTypes.LOAD_SHIPMENT_FAIL],
      endpoint: 'v1/transport/shipments',
      method: 'get',
      params,
      cookie
    }
  };
}
