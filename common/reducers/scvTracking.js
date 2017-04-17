import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/scv/tracking/', [
  'LOAD_TRACKING_FIELDS', 'LOAD_TRACKING_FIELDS_SUCCEED', 'LOAD_TRACKING_FIELDS_FAIL',

  'LOAD_TRACKINGS', 'LOAD_TRACKINGS_SUCCEED', 'LOAD_TRACKINGS_FAIL',
  'ADD_TRACKING', 'ADD_TRACKING_SUCCEED', 'ADD_TRACKING_FAIL',
  'UPDATE_TRACKING', 'UPDATE_TRACKING_SUCCEED', 'UPDATE_TRACKING_FAIL',
  'REMOVE_TRACKING', 'REMOVE_TRACKING_SUCCEED', 'REMOVE_TRACKING_FAIL',

  'LOAD_TRACKING_ITEMS', 'LOAD_TRACKING_ITEMS_SUCCEED', 'LOAD_TRACKING_ITEMS_FAIL',
  // 'ADD_TRACKING_ITEM', 'ADD_TRACKING_ITEM_SUCCEED', 'ADD_TRACKING_ITEM_FAIL',
  'UPDATE_TRACKING_ITEM', 'UPDATE_TRACKING_ITEM_SUCCEED', 'UPDATE_TRACKING_ITEM_FAIL',
  'REMOVE_TRACKING_ITEM', 'REMOVE_TRACKING_ITEM_SUCCEED', 'REMOVE_TRACKING_ITEM_FAIL',

  'UPDATE_TRACKING_ITEM_POSITION', 'UPDATE_TRACKING_ITEM_POSITION_SUCCEED', 'UPDATE_TRACKING_ITEM_POSITION_FAIL',
  'TOGGLE_TRACKING_MODAL',
]);

const initialState = {
  loaded: true,
  loading: false,
  trackingFields: [],
  trackings: [],
  trackingItems: [],
  trackingModal: {
    visible: false,
    operation: 'add',
    tracking: {},
  },
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_TRACKING_FIELDS_SUCCEED:
      return { ...state, trackingFields: action.result.data };
    case actionTypes.LOAD_TRACKINGS:
      return { ...state, loading: true, loaded: false };
    case actionTypes.LOAD_TRACKINGS_SUCCEED:
      return { ...state, trackings: action.result.data, loaded: true, loading: false };
    case actionTypes.LOAD_TRACKINGS_FAIL:
      return { ...state, loading: false };
    case actionTypes.LOAD_TRACKING_ITEMS_SUCCEED:
      return { ...state, trackingItems: action.result.data };
    case actionTypes.TOGGLE_TRACKING_MODAL:
      return { ...state, trackingModal: { ...state.trackingModal, ...action.data } };
    default:
      return state;
  }
}

export function loadTrackingFields() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRACKING_FIELDS,
        actionTypes.LOAD_TRACKING_FIELDS_SUCCEED,
        actionTypes.LOAD_TRACKING_FIELDS_FAIL,
      ],
      endpoint: 'v1/scv/tracking/field/load',
      method: 'get',
    },
  };
}

export function loadTrackings(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRACKINGS,
        actionTypes.LOAD_TRACKINGS_SUCCEED,
        actionTypes.LOAD_TRACKINGS_FAIL,
      ],
      endpoint: 'v1/scv/tracking/load',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function addTracking(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_TRACKING,
        actionTypes.ADD_TRACKING_SUCCEED,
        actionTypes.ADD_TRACKING_FAIL,
      ],
      endpoint: 'v1/scv/tracking/add',
      method: 'post',
      data,
    },
  };
}

export function updateTracking(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_TRACKING,
        actionTypes.UPDATE_TRACKING_SUCCEED,
        actionTypes.UPDATE_TRACKING_FAIL,
      ],
      endpoint: 'v1/scv/tracking/update',
      method: 'post',
      data,
    },
  };
}

export function removeTracking(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_TRACKING,
        actionTypes.REMOVE_TRACKING_SUCCEED,
        actionTypes.REMOVE_TRACKING_FAIL,
      ],
      endpoint: 'v1/scv/tracking/remove',
      method: 'post',
      data: { id },
    },
  };
}


export function loadTrackingItems(trackingId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRACKING_ITEMS,
        actionTypes.LOAD_TRACKING_ITEMS_SUCCEED,
        actionTypes.LOAD_TRACKING_ITEMS_FAIL,
      ],
      endpoint: 'v1/scv/tracking/item/load',
      method: 'get',
      params: { trackingId },
    },
  };
}

// export function addTrackingItem(data) {
//   return {
//     [CLIENT_API]: {
//       types: [
//         actionTypes.ADD_TRACKING_ITEM,
//         actionTypes.ADD_TRACKING_ITEM_SUCCEED,
//         actionTypes.ADD_TRACKING_ITEM_FAIL,
//       ],
//       endpoint: 'v1/scv/tracking/item/add',
//       method: 'post',
//       data,
//     },
//   };
// }

export function updateTrackingItem(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_TRACKING_ITEM,
        actionTypes.UPDATE_TRACKING_ITEM_SUCCEED,
        actionTypes.UPDATE_TRACKING_ITEM_FAIL,
      ],
      endpoint: 'v1/scv/tracking/item/update',
      method: 'post',
      data,
    },
  };
}

export function updateTrackingItemPosition(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_TRACKING_ITEM_POSITION,
        actionTypes.UPDATE_TRACKING_ITEM_POSITION_SUCCEED,
        actionTypes.UPDATE_TRACKING_ITEM_POSITION_FAIL,
      ],
      endpoint: 'v1/scv/tracking/item/position/update',
      method: 'post',
      data: { trackingItems: data },
    },
  };
}

export function removeTrackingItem(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_TRACKING_ITEM,
        actionTypes.REMOVE_TRACKING_ITEM_SUCCEED,
        actionTypes.REMOVE_TRACKING_ITEM_FAIL,
      ],
      endpoint: 'v1/scv/tracking/item/remove',
      method: 'post',
      data: { id },
    },
  };
}

export function toggleTrackingModal(visible, operation, tracking = {}) {
  return {
    type: actionTypes.TOGGLE_TRACKING_MODAL,
    data: { visible, operation, tracking },
  };
}
