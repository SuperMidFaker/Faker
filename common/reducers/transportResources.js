import { CLIENT_API } from 'common/reduxMiddlewares/requester';
import { createActionTypes } from 'client/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/resources/', [
  'ADD_CAR', 'ADD_CAR_SUCCEED', 'ADD_CAR_FAIL',
  'EDIT_CAR', 'EDIT_CAR_SUCCEED', 'EDIT_CAR_FAIL',
  'LOAD_CARLIST', 'LOAD_CARLIST_SUCCEED', 'LOAD_CARLIST_FAIL',
  'ADD_DRIVER', 'ADD_DRIVER_SUCCEED', 'ADD_DRIVER_FAIL',
  'EDIT_DRIVER', 'EDIT_DRIVER_SUCCEED', 'EDIT_DRIVER_FAIL',
  'EDIT_DRIVER_LOGIN', 'EDIT_DRIVER_LOGIN_SUCCEED', 'EDIT_DRIVER_LOGIN_FAIL',
  'LOAD_DRIVERLIST', 'LOAD_DRIVERLIST_SUCCEED', 'LOAD_DRIVERLIST_FAIL',
  'SET_MENU_ITEM_KEY', 'SET_NODE_TYPE',
  'LOAD_NODELIST', 'LOAD_NODELIST_SUCCEED', 'LOAD_NODELIST_FAIL',
  'LOAD_NODE_USERLIST', 'LOAD_NODE_USERLIST_SUCCEED', 'LOAD_NODE_USERLIST_FAIL',
  'ADD_NODE', 'ADD_NODE_SUCCEED', 'ADD_NODE_FAIL',
  'EDIT_NODE', 'EDIT_NODE_SUCCEED', 'EDIT_NODE_FAIL',
  'REMOVE_NODE', 'REMOVE_NODE_SUCCEED', 'REMOVE_NODE_FAIL',
  'CHANGE_REGION',
  'VALIDATE_VEHICLE', 'VALIDATE_VEHICLE_SUCCEED', 'VALIDATE_VEHICLE_FAIL',
  'ADD_NODE_USER', 'ADD_NODE_USER_SUCCEED', 'ADD_NODE_USER_FAIL',
  'EDIT_NODE_USER', 'EDIT_NODE_USER_SUCCEED', 'EDIT_NODE_USER_FAIL',
  'REMOVE_NODE_USER', 'REMOVE_NODE_USER_SUCCEED', 'REMOVE_NODE_USER_FAIL',
  'UPDATE_USER_STATUS', 'UPDATE_USER_STATUS_SUCCEED', 'UPDATE_USER_STATUS_FAIL',
]);

const initialState = {
  cars: [],
  drivers: [],
  vehicleValidate: true,
  nodes: [],
  selectedMenuItemKey: '0',
  loading: false,
  nodeType: 0,
  region: {
    province: '',
    city: '',
    district: '',
    street: '',
    region_code: '',
  },
  nodeUsers: [],
};

/**
 * 根据key, value来跟新一个数组中的特定对象, 并返回包含更新过的数组
 * @param {}
 * @return {}
 */
function updateArray({ array, key, value, updateInfo }) {
  const updatingItem = array.find(item => item[key] === value);
  const updatingItemIndex = array.findIndex(item => item[key] === value);
  const newItem = Object.assign({}, updatingItem, updateInfo);
  return [
    ...array.slice(0, updatingItemIndex),
    newItem,
    ...array.slice(updatingItemIndex + 1),
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
      const cars = updateArray({ array: state.cars, key: 'vehicle_id', value: carId, updateInfo: carInfo });
      return { ...state, loading: false, cars };
    }
    case actionTypes.ADD_CAR:
      return { ...state, vehicleValidate: true };
    case actionTypes.EDIT_DRIVER:
      return { ...state, loading: true };
    case actionTypes.EDIT_DRIVER_SUCCEED: {
      const { driverId, driverInfo } = action.result.data;
      const drivers = updateArray({ array: state.drivers, key: 'driver_id', value: driverId, updateInfo: driverInfo });
      return { ...state, loading: false, drivers };
    }
    case actionTypes.EDIT_DRIVER_LOGIN_SUCCEED: {
      const { driverId, driverInfo } = action.result.data;
      const drivers = updateArray({ array: state.drivers, key: 'driver_id', value: driverId, updateInfo: driverInfo });
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
    case actionTypes.VALIDATE_VEHICLE_SUCCEED:
      return { ...state, vehicleValidate: action.result.data.vehicleValidate };
    case actionTypes.LOAD_NODE_USERLIST_SUCCEED:
      return { ...state, nodeUsers: action.result.data };
    case actionTypes.ADD_NODE_USER_SUCCEED:
      state.nodeUsers.unshift(action.result.data);
      return { ...state };
    case actionTypes.EDIT_NODE_USER_SUCCEED: {
      const i = state.nodeUsers.findIndex(item => item.id === action.data.id);
      state.nodeUsers.splice(i, 1, { ...state.nodeUsers[i], ...action.data.nodeUserInfo });
      return { ...state };
    }
    case actionTypes.REMOVE_NODE_USER_SUCCEED: {
      const nodeUsers = [...state.nodeUsers];
      const index = nodeUsers.findIndex(item => item.id === action.data.id);
      nodeUsers.splice(index, 1);
      return { ...state, nodeUsers };
    }
    case actionTypes.UPDATE_USER_STATUS_SUCCEED: {
      const i = state.nodeUsers.findIndex(item => item.login_id === action.data.loginId);
      state.nodeUsers.splice(i, 1, { ...state.nodeUsers[i], disabled: action.data.disabled });
      return { ...state };
    }
    default:
      return state;
  }
}

/**
 * 车辆相关的action creator
 */
export function addVehicle(carInfo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_CAR,
        actionTypes.ADD_CAR_SUCCEED,
        actionTypes.ADD_CAR_FAIL,
      ],
      endpoint: 'v1/transport/resources/add_vehicle',
      method: 'post',
      data: { carInfo },
    },
  };
}

export function editVehicle({ carId, carInfo }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_CAR,
        actionTypes.EDIT_CAR_SUCCEED,
        actionTypes.EDIT_CAR_FAIL,
      ],
      endpoint: 'v1/transport/resources/edit_vehicle',
      method: 'post',
      data: { carInfo, carId },
    },
  };
}

export function loadVehicleList(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CARLIST,
        actionTypes.LOAD_CARLIST_SUCCEED,
        actionTypes.LOAD_CARLIST_FAIL,
      ],
      endpoint: 'v1/transport/resources/vehicle_list',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function validateVehicle(tenantId, vehicleNumber) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.VALIDATE_VEHICLE,
        actionTypes.VALIDATE_VEHICLE_SUCCEED,
        actionTypes.VALIDATE_VEHICLE_FAIL,
      ],
      endpoint: 'v1/transport/resources/validate_vehicle',
      method: 'get',
      params: { tenantId, vehicleNumber },
    },
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
        actionTypes.ADD_DRIVER_FAIL,
      ],
      endpoint: 'v1/transport/resources/add_driver',
      method: 'post',
      data: { driverInfo },
    },
  };
}

export function editDriver({ driverId, driverInfo }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_DRIVER,
        actionTypes.EDIT_DRIVER_SUCCEED,
        actionTypes.EDIT_DRIVER_FAIL,
      ],
      endpoint: 'v1/transport/resources/edit_driver',
      method: 'post',
      data: { driverInfo, driverId },
    },
  };
}

export function editDriverLogin({ driverId, driverInfo }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_DRIVER_LOGIN,
        actionTypes.EDIT_DRIVER_LOGIN_SUCCEED,
        actionTypes.EDIT_DRIVER_LOGIN_FAIL,
      ],
      endpoint: 'v1/transport/resources/edit_driver_login',
      method: 'post',
      data: { driverInfo, driverId },
    },
  };
}

export function loadDriverList(tenantId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DRIVERLIST,
        actionTypes.LOAD_DRIVERLIST_SUCCEED,
        actionTypes.LOAD_DRIVERLIST_FAIL,
      ],
      endpoint: 'v1/transport/resources/driver_list',
      method: 'get',
      params: { tenantId },
    },
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
        actionTypes.LOAD_NODELIST_FAIL,
      ],
      endpoint: 'v1/transport/resources/node_list',
      method: 'get',
      params: { tenantId },
    },
  };
}

export function addNode(nodeInfo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_NODE,
        actionTypes.ADD_NODE_SUCCEED,
        actionTypes.ADD_NODE_FAIL,
      ],
      endpoint: 'v1/transport/resources/add_node',
      method: 'post',
      data: { nodeInfo },
    },
  };
}

export function editNode({ nodeId, nodeInfo }) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_NODE,
        actionTypes.EDIT_NODE_SUCCEED,
        actionTypes.EDIT_NODE_FAIL,
      ],
      endpoint: 'v1/transport/resources/edit_node',
      method: 'post',
      data: { nodeId, nodeInfo },
    },
  };
}

export function removeNode(nodeId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_NODE,
        actionTypes.REMOVE_NODE_SUCCEED,
        actionTypes.REMOVE_NODE_FAIL,
      ],
      endpoint: 'v1/transport/resources/remove_node',
      method: 'post',
      data: { nodeId },
    },
  };
}

export function setNodeType(nodeType) {
  return { type: actionTypes.SET_NODE_TYPE, nodeType };
}

export function setMenuItemKey(key) {
  return { type: actionTypes.SET_MENU_ITEM_KEY, key };
}

export function changeRegion(region) {
  return { type: actionTypes.CHANGE_REGION, region };
}

export function loadNodeUserList(nodeId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_NODE_USERLIST,
        actionTypes.LOAD_NODE_USERLIST_SUCCEED,
        actionTypes.LOAD_NODE_USERLIST_FAIL,
      ],
      endpoint: 'v1/transport/resources/node_user_list',
      method: 'get',
      params: { nodeId },
    },
  };
}

export function addNodeUser(nodeId, nodeUserInfo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.ADD_NODE_USER,
        actionTypes.ADD_NODE_USER_SUCCEED,
        actionTypes.ADD_NODE_USER_FAIL,
      ],
      endpoint: 'v1/transport/resources/add_node_user',
      method: 'post',
      data: { nodeId, nodeUserInfo },
    },
  };
}

export function editNodeUser(id, nodeUserInfo) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.EDIT_NODE_USER,
        actionTypes.EDIT_NODE_USER_SUCCEED,
        actionTypes.EDIT_NODE_USER_FAIL,
      ],
      endpoint: 'v1/transport/resources/edit_node_user',
      method: 'post',
      data: { id, nodeUserInfo },
    },
  };
}

export function removeNodeUser(id, loginId) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.REMOVE_NODE_USER,
        actionTypes.REMOVE_NODE_USER_SUCCEED,
        actionTypes.REMOVE_NODE_USER_FAIL,
      ],
      endpoint: 'v1/transport/resources/remove_node_user',
      method: 'post',
      data: { id, loginId },
    },
  };
}


export function updateUserStatus(loginId, disabled) {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.UPDATE_USER_STATUS,
        actionTypes.UPDATE_USER_STATUS_SUCCEED,
        actionTypes.UPDATE_USER_STATUS_FAIL,
      ],
      endpoint: 'v1/user/status',
      method: 'put',
      data: { loginId, disabled },
    },
  };
}
