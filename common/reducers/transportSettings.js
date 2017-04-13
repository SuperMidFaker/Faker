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

  'LOAD_PARAM_GOODS_TYPES', 'LOAD_PARAM_GOODS_TYPES_SUCCEED', 'LOAD_PARAM_GOODS_TYPES_FAIL',
  'ADD_PARAM_GOODS_TYPE', 'ADD_PARAM_GOODS_TYPE_SUCCEED', 'ADD_PARAM_GOODS_TYPE_FAIL',
  'UPDATE_PARAM_GOODS_TYPE', 'UPDATE_PARAM_GOODS_TYPE_SUCCEED', 'UPDATE_PARAM_GOODS_TYPE_FAIL',
  'REMOVE_PARAM_GOODS_TYPE', 'REMOVE_PARAM_GOODS_TYPE_SUCCEED', 'REMOVE_PARAM_GOODS_TYPE_FAIL',

  'LOAD_PARAM_CONTAINERS', 'LOAD_PARAM_CONTAINERS_SUCCEED', 'LOAD_PARAM_CONTAINERS_FAIL',
  'ADD_PARAM_CONTAINER', 'ADD_PARAM_CONTAINER_SUCCEED', 'ADD_PARAM_CONTAINER_FAIL',
  'UPDATE_PARAM_CONTAINER', 'UPDATE_PARAM_CONTAINER_SUCCEED', 'UPDATE_PARAM_CONTAINER_FAIL',
  'REMOVE_PARAM_CONTAINER', 'REMOVE_PARAM_CONTAINER_SUCCEED', 'REMOVE_PARAM_CONTAINER_FAIL',
]);

const initialState = {
  transportModes: [],
  paramVehicles: [],
  paramPackages: [],
  paramGoodsTypes: [],
  paramContainers: [],
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

    case actionTypes.LOAD_PARAM_GOODS_TYPES_SUCCEED:
      return { ...state, paramGoodsTypes: action.result.data };
    case actionTypes.ADD_PARAM_GOODS_TYPE_SUCCEED: {
      const paramGoodsTypes = [...state.paramGoodsTypes];
      paramGoodsTypes.push(action.result.data);
      return { ...state, paramGoodsTypes };
    }
    case actionTypes.UPDATE_PARAM_GOODS_TYPE_SUCCEED: {
      const paramGoodsTypes = state.paramGoodsTypes.map((item) => {
        if (item.id === action.data.id) {
          return { ...item, ...action.data };
        } else {
          return item;
        }
      });
      return { ...state, paramGoodsTypes };
    }
    case actionTypes.REMOVE_PARAM_GOODS_TYPE_SUCCEED: {
      const paramGoodsTypes = [...state.paramGoodsTypes];
      const index = paramGoodsTypes.findIndex(item => item.id === action.data.id);
      paramGoodsTypes.splice(index, 1);
      return { ...state, paramGoodsTypes };
    }

    case actionTypes.LOAD_PARAM_CONTAINERS_SUCCEED:
      return { ...state, paramContainers: action.result.data };
    case actionTypes.ADD_PARAM_CONTAINER_SUCCEED: {
      const paramContainers = [...state.paramContainers];
      paramContainers.push(action.result.data);
      return { ...state, paramContainers };
    }
    case actionTypes.UPDATE_PARAM_CONTAINER_SUCCEED: {
      const paramContainers = state.paramContainers.map((item) => {
        if (item.id === action.data.id) {
          return { ...item, ...action.data };
        } else {
          return item;
        }
      });
      return { ...state, paramContainers };
    }
    case actionTypes.REMOVE_PARAM_CONTAINER_SUCCEED: {
      const paramContainers = [...state.paramContainers];
      const index = paramContainers.findIndex(item => item.id === action.data.id);
      paramContainers.splice(index, 1);
      return { ...state, paramContainers };
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

export function loadParamGoodsTypes(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARAM_GOODS_TYPES,
        actionTypes.LOAD_PARAM_GOODS_TYPES_SUCCEED,
        actionTypes.LOAD_PARAM_GOODS_TYPES_FAIL,
      ],
      endpoint: 'v1/transport/settings/paramGoodsTypes',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function addParamGoodsType(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_PARAM_GOODS_TYPE,
        actionTypes.ADD_PARAM_GOODS_TYPE_SUCCEED,
        actionTypes.ADD_PARAM_GOODS_TYPE_FAIL,
      ],
      endpoint: 'v1/transport/settings/paramGoodsType/add',
      method: 'post',
      data,
    },
  };
}

export function updateParamGoodsType(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_PARAM_GOODS_TYPE,
        actionTypes.UPDATE_PARAM_GOODS_TYPE_SUCCEED,
        actionTypes.UPDATE_PARAM_GOODS_TYPE_FAIL,
      ],
      endpoint: 'v1/transport/settings/paramGoodsType/udpate',
      method: 'post',
      data,
    },
  };
}

export function removeParamGoodsType(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_PARAM_GOODS_TYPE,
        actionTypes.REMOVE_PARAM_GOODS_TYPE_SUCCEED,
        actionTypes.REMOVE_PARAM_GOODS_TYPE_FAIL,
      ],
      endpoint: 'v1/transport/settings/paramGoodsType/remove',
      method: 'post',
      data: { id },
    },
  };
}

export function loadParamContainers(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_PARAM_CONTAINERS,
        actionTypes.LOAD_PARAM_CONTAINERS_SUCCEED,
        actionTypes.LOAD_PARAM_CONTAINERS_FAIL,
      ],
      endpoint: 'v1/transport/settings/paramContainers',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function addParamContainer(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_PARAM_CONTAINER,
        actionTypes.ADD_PARAM_CONTAINER_SUCCEED,
        actionTypes.ADD_PARAM_CONTAINER_FAIL,
      ],
      endpoint: 'v1/transport/settings/paramContainer/add',
      method: 'post',
      data,
    },
  };
}

export function updateParamContainer(data) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_PARAM_CONTAINER,
        actionTypes.UPDATE_PARAM_CONTAINER_SUCCEED,
        actionTypes.UPDATE_PARAM_CONTAINER_FAIL,
      ],
      endpoint: 'v1/transport/settings/paramContainer/udpate',
      method: 'post',
      data,
    },
  };
}

export function removeParamContainer(id) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_PARAM_CONTAINER,
        actionTypes.REMOVE_PARAM_CONTAINER_SUCCEED,
        actionTypes.REMOVE_PARAM_CONTAINER_FAIL,
      ],
      endpoint: 'v1/transport/settings/paramContainer/remove',
      method: 'post',
      data: { id },
    },
  };
}
