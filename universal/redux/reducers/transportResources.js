import { CLIENT_API } from 'reusable/redux-middlewares/api';
import { createActionTypes } from 'reusable/common/redux-actions';

const actionTypes = createActionTypes('@@welogix/transport/resources/', [
  'ADD_CAR', 'ADD_CAR_SUCCEED', 'ADD_CAR_FAIL',
  'EDIT_CAR', 'EDIT_CAR_SUCCEED', 'EDIT_CAR_FAIL',
  'LOAD_CARLIST', 'LOAD_CARLIST_SUCCEED', 'LOAD_CARLIST_FAIL',
  'ADD_DRIVER', 'ADD_DRIVER_SUCCEED', 'ADD_DRIVER_FAIL',
  'EDIT_DRIVER', 'EDIT_DRIVER_SUCCEED', 'EDIT_DRIVER_FAIL',
  'LOAD_DRIVERLIST', 'LOAD_DRIVERLIST_SUCCEED', 'LOAD_DRIVERLIST_FAIL'
]);

const initialState = {
  cars: [],
  drivers: []
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case actionTypes.LOAD_DRIVERLIST_SUCCEED:
      return { ...state, drivers: action.result.data };
    case actionTypes.LOAD_CARLIST_SUCCEED:
      return { ...state, cars: action.result.data };
    default:
      return state;
  }
}

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
        actionTypes.LOAD_CARLIST,
        actionTypes.LOAD_CARLIST_SUCCEED,
        actionTypes.LOAD_CARLIST_FAIL
      ],
      endpoint: 'v1/transport/resources/edit_car',
      method: 'post',
      data: { carInfo, carId }
    }
  };
}

export function loadCarList() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_CARLIST,
        actionTypes.LOAD_CARLIST_SUCCEED,
        actionTypes.LOAD_CARLIST_FAIL
      ],
      endpoint: 'v1/transport/resources/car_list',
      method: 'get'
    }
  };
}

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

export function loadDriverList() {
  return {
    [CLIENT_API]: {
      types: [
        actionTypes.LOAD_DRIVERLIST,
        actionTypes.LOAD_DRIVERLIST_SUCCEED,
        actionTypes.LOAD_DRIVERLIST_FAIL
      ],
      endpoint: 'v1/transport/resources/driver_list',
      method: 'get'
    }
  };
}
