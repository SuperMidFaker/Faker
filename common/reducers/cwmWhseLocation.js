import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/cwm/whselocation/', [
  'LOAD_LIMIT_LOCATIONS', 'LOAD_LIMIT_LOCATIONS_SUCCEED', 'LOAD_LIMIT_LOCATIONS_FAIL',
  'LOAD_ADVICE_LOCATIONS', 'LOAD_ADVICE_LOCATIONS_SUCCEED', 'LOAD_ADVICE_LOCATIONS_FAIL',
]);

export function loadLimitLocations(whseCode, zoneCode, tenantId, text) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_LIMIT_LOCATIONS,
        actionTypes.LOAD_LIMIT_LOCATIONS_SUCCEED,
        actionTypes.LOAD_LIMIT_LOCATIONS_FAIL,
      ],
      endpoint: 'v1/cwm/whse/limit/locations',
      method: 'get',
      params: { whseCode, zoneCode, tenantId, text },
    },
  };
}

export function loadAdviceLocations(productNo, tenantId, whseCode) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_ADVICE_LOCATIONS,
        actionTypes.LOAD_ADVICE_LOCATIONS_SUCCEED,
        actionTypes.LOAD_ADVICE_LOCATIONS_FAIL,
      ],
      endpoint: 'v1/cwm/whse/advice/locations',
      method: 'get',
      params: { productNo, tenantId, whseCode },
    },
  };
}
