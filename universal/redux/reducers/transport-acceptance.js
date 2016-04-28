import { CLIENT_API } from 'reusable/redux-middlewares/api';
import { createActionTypes } from 'reusable/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/acceptance', [
  'SAVE_SHIPMT', 'SAVE_SHIPMT_FAIL', 'SAVE_SHIPMT_SUCCEED',
  'SAVE_DRAFT', 'SAVE_DRAFT', 'SAVE_DRAFT_SUCCEED',
]);

const initialState = {
  shipmtTable: {
  }
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    default:
      return state;
  }
}

export function saveAndAccept(shipment) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_SHIPMT,
        actionTypes.SAVE_SHIPMT_FAIL,
        actionTypes.SAVE_SHIPMT_SUCCEED,
      ],
      method: 'post',
      endpoint: 'v1/transport/shipment',
      data: shipment
    }
  };
}

export function saveDraft(shipment) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.SAVE_DRAFT,
        actionTypes.SAVE_DRAFT_FAIL,
        actionTypes.SAVE_DRAFT_SUCCEED,
      ],
      method: 'post',
      endpoint: 'v1/transport/shipment/draft',
      data: shipment
    }
  };
}
