import cobody from 'co-body';
import Result from '../../reusable/node-util/response-result';
import * as TransportResourcesDao from '../models/transportResources';

function *addDriver() {
  const body = yield cobody(this);
  const { driverInfo } = body;
  try {
    yield TransportResourcesDao.addDriverWithInfo(driverInfo);
    return Result.OK(this);
  } catch(e) {
    return Result.InternalServerError(this, e.message);
  }
}

function *getDriverList() {
  try {
    const { tenantId } = this.request.query;
    const result = yield TransportResourcesDao.getDriverList(tenantId);
    return Result.OK(this, result);
  } catch(e) {
    return Result.InternalServerError(this, e.message);
  } 
}

function *editDriver() {
  try {
    const body = yield cobody(this);
    const { driverId, driverInfo } = body;
    yield TransportResourcesDao.updateDriverWithInfo({driverId, driverInfo});
    return Result.OK(this, { driverId, driverInfo });
  } catch(e) {
    return Result.InternalServerError(this, e.message);
  }
}

function *addCar() {
  try {
    const body = yield cobody(this);
    const { carInfo } = body;
    console.log(carInfo);
    yield TransportResourcesDao.addCarWithInfo(carInfo);
    return Result.OK(this);
  } catch(e) {
    return Result.InternalServerError(this, e.message);
  }
}

function *getCarList() {
  try {
    const { tenantId } = this.request.query;
    const result = yield TransportResourcesDao.getCarList(tenantId);
    return Result.OK(this, result);
  } catch(e) {
    return Result.InternalServerError(this, e.message);  
  } 
}

function *editCar() {
  try {
    const body = yield cobody(this);
    console.log(body);
    const { carInfo, carId } = body;
    yield TransportResourcesDao.updateCarWithInfo({carInfo, carId});
    return Result.OK(this, { carId , carInfo });
  } catch(e) {
    return Result.InternalServerError(this, e.message);
  }
}

function *getNodeList() {
  try {
    const { tenantId } = this.request.query;
    const result = yield TransportResourcesDao.getNodeList(tenantId);
    return Result.OK(this, result);
  } catch(e) {
    return Result.InternalServerError(this, e.message);
  }
}

function *addNode() {
  try {
    const body = yield cobody(this);
    const { nodeInfo } = body;
    yield TransportResourcesDao.addNode(nodeInfo);
    return Result.OK(this);
  } catch(e) {
    return Result.InternalServerError(this, e.message);
  }
}

function *editNode() {
  try {
    const body = yield cobody(this);
    const { nodeInfo, nodeId } = body;
    yield TransportResourcesDao.updateNodeWithInfo({nodeInfo, nodeId});
    return Result.OK(this, {nodeInfo, nodeId});
  } catch(e) {
    return Result.InternalServerError(this, e.message);
  }
}

export default [
  ['post', '/v1/transport/resources/add_driver', addDriver],
  ['get', '/v1/transport/resources/driver_list', getDriverList],
  ['post', '/v1/transport/resources/edit_driver', editDriver],
  ['post', '/v1/transport/resources/add_car', addCar],
  ['get', '/v1/transport/resources/car_list', getCarList],
  ['post', '/v1/transport/resources/edit_car', editCar],
  ['get', '/v1/transport/resources/node_list', getNodeList],
  ['post', '/v1/transport/resources/add_node', addNode],
  ['post', '/v1/transport/resources/edit_node', editNode]
];
