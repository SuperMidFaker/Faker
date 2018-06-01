import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cms/params/', [
  'LOAD_PARAMS', 'LOAD_PARAMS_SUCCEED', 'LOAD_PARAMS_FAIL',
]);

const initialState = {
  currencies: [],
  countries: [],
  trxnModes: [],
  transModes: [],
  units: [],
  declPorts: [],
  customsBrokers: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_PARAMS_SUCCEED:
      return {
        ...state,
        currencies: action.result.data.currency ? action.result.data.currency : state.currencies,
        countries: action.result.data.country ? action.result.data.country : state.countries,
        trxnModes: action.result.data.trxns ? action.result.data.trxns : state.trxnModes,
        transModes: action.result.data.trans ? action.result.data.trans : state.transModes,
        units: action.result.data.unit ? action.result.data.unit : state.units,
        declPorts: action.result.data.declPort ? action.result.data.declPort : state.declPorts,
        customsBrokers: action.result.data.customsBrokers ?
          action.result.data.customsBrokers : state.customsBrokers,
      };
    default:
      return state;
  }
}

export function loadParams(types) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARAMS,
        actionTypes.LOAD_PARAMS_SUCCEED,
        actionTypes.LOAD_PARAMS_FAIL,
      ],
      endpoint: 'v1/saas/params/load',
      method: 'get',
      params: { types: JSON.stringify(types) },
    },
  };
}

