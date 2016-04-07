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
  statusTypes: [],
  shipmentlist: {
    totalCount: 0,
    pageSize: 10,
    current: 1,
    data: [
      {
        key: 1,
        shipNo: 'T123456789012',
        carrier: '恩诺物流',
        mode: '公路-零担',
        source: '上海',
        destination: '南京',
        pickupDate: new Date(2016, 3, 7),
        deliveryDate: new Date(2016, 4, 7),
      }
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
    default:
      return state;
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
