import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
import moment from 'moment';

const actionTypes = createActionTypes('@@welogix/transport/kpi/', [
  'LOAD_KPI', 'LOAD_KPI_SUCCEED', 'LOAD_KPI_FAIL',
]);

const initialState = {
  loading: false,
  loaded: true,
  query: {
    partnerId: -1,
  },
  kpi: {
    transitModes: [],
    range: [],
    shipmentCounts: [],
    punctualShipmentCounts: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_KPI: {
      return { ...state, query: { ...state.query, ...action.params } };
    }
    case actionTypes.LOAD_KPI_SUCCEED:
      return { ...state, kpi: { ...state.kpi, ...action.result.data } };
    default:
      return state;
  }
}

export function loadKpi(tenantId, beginDate, endDate, partnerId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_KPI,
        actionTypes.LOAD_KPI_SUCCEED,
        actionTypes.LOAD_KPI_FAIL,
      ],
      endpoint: 'v1/transport/kpi',
      method: 'get',
      params: { tenantId, beginDate: moment(beginDate).format('YYYY-MM-DD'), endDate: moment(endDate).format('YYYY-MM-DD'), partnerId },
    },
  };
}
