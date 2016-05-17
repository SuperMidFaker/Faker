import cobody from 'co-body';
import shipmentDao from '../models/shipment.db';
import shipmentAuxDao from '../models/shipment-auxil.db';
import shipmentDispDao from '../models/shipment-disp.db';
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
    /* handle error */
  }
}

export default [
  [ 'get', '/v1/transport/tracking/shipmts', trackingShipmtListG ],
];
