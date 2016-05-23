import cobody from 'co-body';
import shipmentDao from '../models/shipment.db';
import shipmentAuxDao from '../models/shipment-auxil.db';
import shipmentDispDao from '../models/shipment-disp.db';
import { SHIPMENT_TRACK_STATUS } from 'universal/constants';
import mysql from '../../reusable/db-util/mysql';
import Result from '../../reusable/node-util/response-result';

function *trackingShipmtListG() {
  const tenantId = parseInt(this.request.query.tenantId, 10);
  const filters = JSON.parse(this.request.query.filters);
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const current = parseInt(this.request.query.currentPage, 10);
  try {
    const totalCounts = yield shipmentDispDao.getTrackingCount(tenantId, filters);
    const shipments = yield shipmentDispDao.getTrackingShipments(
      tenantId, filters, pageSize, current
    );
    return Result.OK(this, {
      totalCount: totalCounts[0].count,
      pageSize,
      current,
      data: shipments
    });
  } catch (e) {
    return Result.InternalServerError(this, e.message);
  }
}

function *trackingVehicleUpdateP() {
  try {
   const body = yield cobody(this); 
   const { dispId, plate, driver, remark } = body;
   yield shipmentDispDao.updateDispInfo(dispId, {
     task_vehicle: plate,
     task_driver_name: driver,
     task_remark: remark,
     status: SHIPMENT_TRACK_STATUS.undelivered,
   });
   return Result.OK(this);
  } catch (e) {
    return Result.InternalServerError(this, e.message);
  }
}

function *trackingPickDeliverDateP() {
  try {
   const body = yield cobody(this); 
   const { dispId, type, actDate } = body;
   let fields;
   if (type === 'pickup') {
     fields = {
       pickup_act_date: new Date(actDate),
       status: SHIPMENT_TRACK_STATUS.intransit,
     };
   } else {
     fields = {
       deliver_act_date: new Date(actDate),
       status: SHIPMENT_TRACK_STATUS.delivered,
     };
   }
   yield shipmentDispDao.updateDispInfo(dispId, fields);
   return Result.OK(this);
  } catch (e) {
    return Result.InternalServerError(this, e.message);
  }
}

export default [
  [ 'get', '/v1/transport/tracking/shipmts', trackingShipmtListG ],
  [ 'post', '/v1/transport/tracking/vehicle', trackingVehicleUpdateP ],
  [ 'post', '/v1/transport/tracking/pickordeliverdate', trackingPickDeliverDateP ],
];
