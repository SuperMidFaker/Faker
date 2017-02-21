import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';
import moment from 'moment';

const actionTypes = createActionTypes('@@welogix/transport/kpi/', [
  'LOAD_KPI', 'LOAD_KPI_SUCCEED', 'LOAD_KPI_FAIL',
  'CHANGE_MODES',
]);

const initialState = {
  loading: false,
  loaded: true,
  query: {
    partnerId: -1,
    separationDate: 1,
  },
  kpi: {
    transitModes: [],
    range: [],
    shipmentCounts: [],
    punctualShipmentCounts: [],
    shipmentFees: [],
    exceptionalShipmentCounts: [],
  },
  modes: {
    punctual: [],
    overTime: [],
    volume: [],
    fees: [],
    exception: [],
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_KPI: {
      return { ...state, loaded: false, loading: true };
    }
    case actionTypes.LOAD_KPI_SUCCEED:
      return {
        ...state,
        kpi: { ...state.kpi, ...action.result.data },
        query: { ...state.query, ...action.params },
        loading: false,
        loaded: true,
        modes: {
          punctual: action.result.data.transitModes,
          overTime: action.result.data.transitModes,
          volume: action.result.data.transitModes,
          fees: action.result.data.transitModes,
          exception: action.result.data.transitModes,
        },
      };
    case actionTypes.CHANGE_MODES: {
      return { ...state, modes: { ...state.modes, ...action.data } };
    }
    default:
      return state;
  }
}

export function loadKpi(tenantId, beginDate, endDate, partnerId, separationDate) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_KPI,
        actionTypes.LOAD_KPI_SUCCEED,
        actionTypes.LOAD_KPI_FAIL,
      ],
      endpoint: 'v1/transport/kpi',
      method: 'get',
      params: { tenantId, beginDate: moment(beginDate).format('YYYY-MM-DD HH:mm:ss'), endDate: moment(endDate).format('YYYY-MM-DD HH:mm:ss'), partnerId, separationDate },
    },
  };
}

export function changeModes(modes) {
  return {
    type: actionTypes.CHANGE_MODES,
    data: modes,
  };
}

export function getSelectedModesObject(transitModes, modes) {
  const m = {};
  transitModes.forEach((item) => {
    if (modes.find(item1 => item.mode_name === item1.mode_name)) {
      m[item.mode_name] = true;
    } else {
      m[item.mode_name] = false;
    }
  });
  return m;
}
