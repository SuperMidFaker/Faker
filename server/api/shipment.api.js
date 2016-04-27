import cobody from 'co-body';
import shipmentDao from '../models/shipment.db';
import coopDao from '../models/cooperation.db';
import mysql from '../../reusable/db-util/mysql';
import Result from '../../reusable/node-util/response-result';
import { PARTNERSHIP_TYPE_INFO } from 'universal/constant';

const vehicleTypes = [{
  id: '1',
  name: '敞蓬车'
}, {
  id: '2',
  name: '厢式车'
}, {
  id: '3',
  name: '两者均可'
}, {
  id: '4',
  name: '轿运车'
}];

const vehicleLengths = [{
  id: '1',
  name: '2.0'
}, {
  id: '2',
  name: '4.2'
}, {
  id: '3',
  name: '5.2' 
}];

const goodsTypes = [{
  id: '1',
  name: '普通货物'
}, {
  id: '2',
  name: '温控货物'
}, {
  id: '3',
  name: '危险品'
}];
function *shipmtRequiresG() {
  const tenantId = this.request.query.tenantId;
  try {
    const [ consignerLocations, consigneeLocations, transitModes, packagings, clients ] =
      yield [
      shipmentDao.getConsignLocations(tenantId, 0),
      shipmentDao.getConsignLocations(tenantId, 1),
      shipmentDao.getTransitModes(tenantId),
      shipmentDao.getPackagings(tenantId),
      coopDao.getOnlinePartnerByTypeCode(tenantId, PARTNERSHIP_TYPE_INFO.customer)
    ];
    return Result.OK(this, {
      consignerLocations,
      consigneeLocations,
      transitModes,
      vehicleTypes,
      vehicleLengths,
      goodsTypes
      packagings,
      clients
    });
  } catch (e) {
    return Result.InternalServerError(this, e.message);
  }
}

export default [
  [ 'get', '/v1/transport/shipment/requires', shipmtRequiresG ],
]
