import { CLIENT_API } from 'reusable/redux-middlewares/api';
import { createActionTypes } from 'reusable/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/resources/', [
  'ADD_CAR', 'ADD_CAR_SUCCEED', 'ADD_CAR_FAIL',
  'EDIT_CAR', 'EDIT_CAR_SUCCEED', 'EDIT_CAR_FAIL',
  'LOAD_CARLIST', 'LOAD_CARLIST_SUCCEED', 'LOAD_CARLIST_FAIL',
  'ADD_DRIVER', 'ADD_DRIVER_SUCCEED', 'ADD_DRIVER_FAIL',
  'EDIT_DRIVER', 'EDIT_DRIVER_SUCCEED', 'EDIT_DRIVER_FAIL',
  'LOAD_DRIVERLIST', 'LOAD_DRIVERLIST_SUCCEED', 'LOAD_DRIVERLIST_FAIL',
  'SET_MENU_ITEM_KEY', 'SET_NODE_TYPE',
  'LOAD_NODELIST', 'LOAD_NODELIST_SUCCEED', 'LOAD_NODELIST_FAIL',
  'ADD_NODE', 'ADD_NODE_SUCCEED', 'ADD_NODE_FAIL',
  'EDIT_NODE', 'EDIT_NODE_SUCCEED', 'EDIT_NODE_FAIL',
  'REMOVE_NODE', 'REMOVE_NODE_SUCCEED', 'REMOVE_NODE_FAIL',
  'CHANGE_REGION'
]);

const initialState = {
  cars: [],
  drivers: [],
  nodes: [],
  selectedMenuItemKey: '0',
  loading: false,
  nodeType: 0,
  region: {
    province: '',
    city: '',
    district: ''
  }
};

/**
 * 根据key, value来跟新一个数组中的特定对象, 并返回包含更新过的数组
 * @param {}
 * @return {}
 */
function updateArray({array, key, value, updateInfo}) {
  const updatingItem = array.find(item => item[key] === value);
  const updatingItemIndex = array.findIndex(item => item[key] === value);
  const newItem = Object.assign({}, updatingItem, updateInfo);
  return [
    ...array.slice(0, updatingItemIndex),
    newItem,
    ...array.slice(updatingItemIndex + 1)
  ];
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_DRIVERLIST:
      return { ...state, loading: true };
    case actionTypes.LOAD_DRIVERLIST_SUCCEED:
      return { ...state, drivers: action.result.data, loading: false };
    case actionTypes.EDIT_CAR:
      return { ...state, loading: true };
    case actionTypes.EDIT_CAR_SUCCEED: {
      const { carId, carInfo } = action.result.data;
      const cars = updateArray({array: state.cars, key: 'vehicle_id', value: carId, updateInfo: carInfo});
      return { ...state, loading: false, cars };
    }
    case actionTypes.EDIT_DRIVER:
      return { ...state, loading: true };
    case actionTypes.EDIT_DRIVER_SUCCEED: {
      const { driverId, driverInfo } = action.result.data;
      const drivers = updateArray({array: state.drivers, key: 'driver_id', value: driverId, updateInfo: driverInfo});
      return { ...state, loading: false, drivers };
    }
    case actionTypes.LOAD_CARLIST:
      return { ...state, loading: true };
    case actionTypes.LOAD_CARLIST_SUCCEED:
      return { ...state, cars: action.result.data, loading: false };
    case actionTypes.LOAD_NODELIST:
      return { ...state, loading: true };
    case actionTypes.LOAD_NODELIST_SUCCEED:
      return { ...state, loading: false, nodes: action.result.data };
    case actionTypes.REMOVE_NODE:
      return { ...state, loading: true };
    case actionTypes.REMOVE_NODE_SUCCEED: {
      const { nodeId: removedNodeId } = action.result.data;
      const nodes = state.nodes.filter(node => node.node_id !== removedNodeId);
      return { ...state, loading: false, nodes };
    }
    case actionTypes.SET_NODE_TYPE:
      return { ...state, nodeType: action.nodeType };
    case actionTypes.SET_MENU_ITEM_KEY:
      return { ...state, selectedMenuItemKey: action.key };
    case actionTypes.CHANGE_REGION:
      return { ...state, region: action.region };
    default:
      return state;
  }
}

/**
 * 车辆相关的action creator
 */
export function addCar(carInfo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_CAR,
        actionTypes.ADD_CAR_SUCCEED,
        actionTypes.ADD_CAR_FAIL
      ],
      endpoint: 'v1/transport/resources/add_car',
      method: 'post',
      data: { carInfo }
    }
  };
}

export function editCar({carId, carInfo}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_CAR,
        actionTypes.EDIT_CAR_SUCCEED,
        actionTypes.EDIT_CAR_FAIL
      ],
      endpoint: 'v1/transport/resources/edit_car',
      method: 'post',
      data: { carInfo, carId }
    }
  };
}

export function loadCarList(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CARLIST,
        actionTypes.LOAD_CARLIST_SUCCEED,
        actionTypes.LOAD_CARLIST_FAIL
      ],
      endpoint: 'v1/transport/resources/car_list',
      method: 'get',
      params: { tenantId }
    }
  };
}

/**
 * 司机有关的action creator
 */
export function addDriver(driverInfo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_DRIVER,
        actionTypes.ADD_DRIVER_SUCCEED,
        actionTypes.ADD_DRIVER_FAIL
      ],
      endpoint: 'v1/transport/resources/add_driver',
      method: 'post',
      data: { driverInfo }
    }
  };
}

export function editDriver({driverId, driverInfo}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_DRIVER,
        actionTypes.EDIT_DRIVER_SUCCEED,
        actionTypes.EDIT_DRIVER_FAIL
      ],
      endpoint: 'v1/transport/resources/edit_driver',
      method: 'post',
      data: { driverInfo, driverId }
    }
  };
}

export function loadDriverList(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DRIVERLIST,
        actionTypes.LOAD_DRIVERLIST_SUCCEED,
        actionTypes.LOAD_DRIVERLIST_FAIL
      ],
      endpoint: 'v1/transport/resources/driver_list',
      method: 'get',
      params: { tenantId }
    }
  };
}

/**
 * 节点相关的action creator
 */
export function loadNodeList(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_NODELIST,
        actionTypes.LOAD_NODELIST_SUCCEED,
        actionTypes.LOAD_NODELIST_FAIL
      ],
      endpoint: 'v1/transport/resources/node_list',
      method: 'get',
      params: { tenantId }
    }
  };
}

export function addNode(nodeInfo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_NODE,
        actionTypes.ADD_NODE_SUCCEED,
        actionTypes.ADD_NODE_FAIL
      ],
      endpoint: 'v1/transport/resources/add_node',
      method: 'post',
      data: { nodeInfo }
    }
  };
}

export function editNode({nodeId, nodeInfo}) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_NODE,
        actionTypes.EDIT_NODE_SUCCEED,
        actionTypes.EDIT_NODE_FAIL
      ],
      endpoint: 'v1/transport/resources/edit_node',
      method: 'post',
      data: { nodeId, nodeInfo }
    }
  };
}

export function removeNode(nodeId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_NODE,
        actionTypes.REMOVE_NODE_SUCCEED,
        actionTypes.REMOVE_NODE_FAIL
      ],
      endpoint: 'v1/transport/resources/remove_node',
      method: 'post',
      data: { nodeId }
    }
  };
}

export function setNodeType(nodeType) {
  return {type: actionTypes.SET_NODE_TYPE, nodeType};
}

export function setMenuItemKey(key) {
  return {type: actionTypes.SET_MENU_ITEM_KEY, key};
}

export function changeRegion(region) {
  return {type: actionTypes.CHANGE_REGION, region};
}
