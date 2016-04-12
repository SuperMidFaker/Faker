import { CLIENT_API } from 'reusable/redux-middlewares/api';
import { createActionTypes } from 'reusable/common/redux-actions';
import { isFormDataLoadedC, 
  appendFormAcitonTypes, formReducer, loadFormC, assignFormC, clearFormC, setFormValueC
} from 'reusable/domains/redux/form-common';

const actionTypes = createActionTypes('@@welogix/shipment/', [
  'LOAD_SHIPMENT', 'LOAD_SHIPMENT_FAIL', 'LOAD_SHIPMENT_SUCCEED',
]);
appendFormAcitonTypes('@@welogix/shipment/', actionTypes);

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
        deliveryDate: new Date(2016, 4, 7)
      }
    ]
  },
  submitting: false,
  formData: {
    key: null
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
      return formReducer(actionTypes, state, action, { key: null }, 'shipmentlist')
             || state;
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

export function isFormDataLoaded(shipmentState, shipmentId) {
  return isFormDataLoadedC(shipmentId, shipmentState, 'shipmentlist');
}

export function loadForm(cookie, params) {
  return loadFormC(cookie, 'v1/transport/shipments', params, actionTypes);
}

export function assignForm(shipmentState, shipmentId) {
  return assignFormC(shipmentId, shipmentState, 'shipmentlist', actionTypes);
}

export function setFormValue(field, value) {
  return setFormValueC(actionTypes, field, value);
}

export function clearForm() {
  return clearFormC(actionTypes);
}
