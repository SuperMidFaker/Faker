import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/settings/', [
  'LOAD_TRANSPORT_MODES', 'LOAD_TRANSPORT_MODES_SUCCEED', 'LOAD_TRANSPORT_MODES_FAIL',
  'ADD_TRANSPORT_MODE', 'ADD_TRANSPORT_MODE_SUCCEED', 'ADD_TRANSPORT_MODE_FAIL',
  'UPDATE_TRANSPORT_MODE', 'UPDATE_TRANSPORT_MODE_SUCCEED', 'UPDATE_TRANSPORT_MODE_FAIL',
  'REMOVE_TRANSPORT_MODE', 'REMOVE_TRANSPORT_MODE_SUCCEED', 'REMOVE_TRANSPORT_MODE_FAIL',
  'LOAD_PARAM_VEHICLES', 'LOAD_PARAM_VEHICLES_SUCCEED', 'LOAD_PARAM_VEHICLES_FAIL',
  'ADD_PARAM_VEHICLE', 'ADD_PARAM_VEHICLE_SUCCEED', 'ADD_PARAM_VEHICLE_FAIL',
  'UPDATE_PARAM_VEHICLE', 'UPDATE_PARAM_VEHICLE_SUCCEED', 'UPDATE_PARAM_VEHICLE_FAIL',
  'REMOVE_PARAM_VEHICLE', 'REMOVE_PARAM_VEHICLE_SUCCEED', 'REMOVE_PARAM_VEHICLE_FAIL',
  'LOAD_PARAM_PACKAGES', 'LOAD_PARAM_PACKAGES_SUCCEED', 'LOAD_PARAM_PACKAGES_FAIL',
  'ADD_PARAM_PACKAGE', 'ADD_PARAM_PACKAGE_SUCCEED', 'ADD_PARAM_PACKAGE_FAIL',
  'UPDATE_PARAM_PACKAGE', 'UPDATE_PARAM_PACKAGE_SUCCEED', 'UPDATE_PARAM_PACKAGE_FAIL',
  'REMOVE_PARAM_PACKAGE', 'REMOVE_PARAM_PACKAGE_SUCCEED', 'REMOVE_PARAM_PACKAGE_FAIL',
]);

const initialState = {
  transportModes: [],
  paramVehicles: [],
  paramPackages: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_TRANSPORT_MODES_SUCCEED:
      return { ...state, transportModes: action.result.data };
    case actionTypes.ADD_TRANSPORT_MODE_SUCCEED: {
      const transportModes = [...state.transportModes];
      transportModes.push(action.result.data);
      return { ...state, transportModes };
    }
    case actionTypes.UPDATE_TRANSPORT_MODE_SUCCEED: {
      const transportModes = state.transportModes.map((item) => {
        if (item.id === action.data.id) {
          return { ...item, ...action.data };
        } else {
          return item;
        }
      });
      return { ...state, transportModes };
    }
    case actionTypes.REMOVE_TRANSPORT_MODE_SUCCEED: {
      const transportModes = [...state.transportModes];
      const index = transportModes.findIndex(item => item.id === action.data.id);
      transportModes.splice(index, 1);
      return { ...state, transportModes };
    }
    case actionTypes.LOAD_PARAM_VEHICLES_SUCCEED:
      return { ...state, paramVehicles: action.result.data };
    case actionTypes.ADD_PARAM_VEHICLE_SUCCEED: {
      const paramVehicles = [...state.paramVehicles];
      paramVehicles.push(action.result.data);
      return { ...state, paramVehicles };
    }
    case actionTypes.UPDATE_PARAM_VEHICLE_SUCCEED: {
      const paramVehicles = state.paramVehicles.map((item) => {
        if (item.id === action.data.id) {
          return { ...item, ...action.data };
        } else {
          return item;
        }
      });
      return { ...state, paramVehicles };
    }
    case actionTypes.REMOVE_PARAM_VEHICLE_SUCCEED: {
      const paramVehicles = [...state.paramVehicles];
      const index = paramVehicles.findIndex(item => item.id === action.data.id);
      paramVehicles.splice(index, 1);
      return { ...state, paramVehicles };
    }
    case actionTypes.LOAD_PARAM_PACKAGES_SUCCEED:
      return { ...state, paramPackages: action.result.data };
    case actionTypes.ADD_PARAM_PACKAGE_SUCCEED: {
      const paramPackages = [...state.paramPackages];
      paramPackages.push(action.result.data);
      return { ...state, paramPackages };
    }
    case actionTypes.UPDATE_PARAM_PACKAGE_SUCCEED: {
      const paramPackages = state.paramPackages.map((item) => {
        if (item.id === action.data.id) {
          return { ...item, ...action.data };
        } else {
          return item;
        }
      });
      return { ...state, paramPackages };
    }
    case actionTypes.REMOVE_PARAM_PACKAGE_SUCCEED: {
      const paramPackages = [...state.paramPackages];
      const index = paramPackages.findIndex(item => item.id === action.data.id);
      paramPackages.splice(index, 1);
      return { ...state, paramPackages };
    }
    default:
      return state;
  }
}

export function loadTransportModes(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_TRANSPORT_MODES,
        actionTypes.LOAD_TRANSPORT_MODES_SUCCEED,
        actionTypes.LOAD_TRANSPORT_MODES_FAIL,
      ],
      endpoint: 'v1/transport/settings/transportModes',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function addTransportMode(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_TRANSPORT_MODE,
        actionTypes.ADD_TRANSPORT_MODE_SUCCEED,
        actionTypes.ADD_TRANSPORT_MODE_FAIL,
      ],
      endpoint: 'v1/transport/settings/transportMode/add',
      method: 'post',
      data,
    },
  };
}

export function updateTransportMode(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_TRANSPORT_MODE,
        actionTypes.UPDATE_TRANSPORT_MODE_SUCCEED,
        actionTypes.UPDATE_TRANSPORT_MODE_FAIL,
      ],
      endpoint: 'v1/transport/settings/transportMode/update',
      method: 'post',
      data,
    },
  };
}

export function removeTransportMode(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_TRANSPORT_MODE,
        actionTypes.REMOVE_TRANSPORT_MODE_SUCCEED,
        actionTypes.REMOVE_TRANSPORT_MODE_FAIL,
      ],
      endpoint: 'v1/transport/settings/transportMode/remove',
      method: 'post',
      data: { id },
    },
  };
}

export function loadParamVehicles(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARAM_VEHICLES,
        actionTypes.LOAD_PARAM_VEHICLES_SUCCEED,
        actionTypes.LOAD_PARAM_VEHICLES_FAIL,
      ],
      endpoint: 'v1/transport/settings/paramVehicles',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function addParamVehicle(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_PARAM_VEHICLE,
        actionTypes.ADD_PARAM_VEHICLE_SUCCEED,
        actionTypes.ADD_PARAM_VEHICLE_FAIL,
      ],
      endpoint: 'v1/transport/settings/paramVehicle/add',
      method: 'post',
      data,
    },
  };
}

export function updateParamVehicle(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_PARAM_VEHICLE,
        actionTypes.UPDATE_PARAM_VEHICLE_SUCCEED,
        actionTypes.UPDATE_PARAM_VEHICLE_FAIL,
      ],
      endpoint: 'v1/transport/settings/paramVehicle/update',
      method: 'post',
      data,
    },
  };
}

export function removeParamVehicle(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_PARAM_VEHICLE,
        actionTypes.REMOVE_PARAM_VEHICLE_SUCCEED,
        actionTypes.REMOVE_PARAM_VEHICLE_FAIL,
      ],
      endpoint: 'v1/transport/settings/paramVehicle/remove',
      method: 'post',
      data: { id },
    },
  };
}

export function loadParamPackages(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARAM_PACKAGES,
        actionTypes.LOAD_PARAM_PACKAGES_SUCCEED,
        actionTypes.LOAD_PARAM_PACKAGES_FAIL,
      ],
      endpoint: 'v1/transport/settings/paramPackages',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function addParamPackage(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_PARAM_PACKAGE,
        actionTypes.ADD_PARAM_PACKAGE_SUCCEED,
        actionTypes.ADD_PARAM_PACKAGE_FAIL,
      ],
      endpoint: 'v1/transport/settings/paramPackage/add',
      method: 'post',
      data,
    },
  };
}

export function updateParamPackage(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_PARAM_PACKAGE,
        actionTypes.UPDATE_PARAM_PACKAGE_SUCCEED,
        actionTypes.UPDATE_PARAM_PACKAGE_FAIL,
      ],
      endpoint: 'v1/transport/settings/paramPackage/udpate',
      method: 'post',
      data,
    },
  };
}

export function removeParamPackage(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_PARAM_PACKAGE,
        actionTypes.REMOVE_PARAM_PACKAGE_SUCCEED,
        actionTypes.REMOVE_PARAM_PACKAGE_FAIL,
      ],
      endpoint: 'v1/transport/settings/paramPackage/remove',
      method: 'post',
      data: { id },
    },
  };
}
