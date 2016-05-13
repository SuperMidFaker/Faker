/**
 * Copyright (c) 2012-2016 Qeemo Ltd. All Rights Reserved.
 */
/**
 * User: Kurten
 * Date: 2016-05-05
 * Time: 11:17
 * Version: 1.0
 * Description:
 */
import shipmtDao from '../models/shipment.db';
import shipmtDispDao from '../models/shipment-disp.db';
import copsDao from '../models/cooperation.db';
import vehiclesDao from '../models/vehicles.db';
import tenantDao from '../models/tenant.db';
import tenantUserDao from '../models/tenant-user.db';
import Result from '../../reusable/node-util/response-result';
import {
  PARTNERSHIP_TYPE_INFO,
  SHIPMENT_SOURCE,
  SHIPMENT_DISPATCH_STATUS,
  SHIPMENT_TRACK_STATUS
} from 'universal/constants';
import parse from 'co-body';
/**
 * filters => {
 *   status: waiting(待分配)/dispatching(待发送)/dispatched(已发送)
 * }
 *
 * waiting -> {disp_status = 1, status = 2, sp_tenant_id = me}
 * dispatching -> {disp_status = 0, status = 1, sr_tenant_id = me} new record
 * dispatched -> {disp_statue = 1, status = 1, sr_tenant_id = me}
 * @yield {[type]} [description]
 */
function *listShipmts() {
  const pageSize = parseInt(this.request.query.pageSize, 10) || 10;
  const current = parseInt(this.request.query.current, 10) || 1;
  const filters = JSON.parse(this.request.query.filters);
  const tenantId = parseInt(this.request.query.tenantId, 10) || 0;
  const min = (current - 1) * pageSize;

  const [shipmts, totals] = yield [shipmtDispDao.getDispatchShipmts(tenantId, filters, min, pageSize),
                                    shipmtDispDao.getDispatchShipmtsCount(tenantId, filters)];
  Result.OK(this, {
    totalCount: totals[0].count,
    pageSize,
    current,
    data: shipmts,
  });
}

function *listLsps() {
  const pageSize = parseInt(this.request.query.pageSize, 10) || 10;
  const current = parseInt(this.request.query.current, 10) || 1;
  const tenantId = parseInt(this.request.query.tenantId, 10) || 0;
  const min = (current - 1) * pageSize;

  const [partners, totals] = yield [copsDao.getAllPartnerByTypeCode(tenantId, PARTNERSHIP_TYPE_INFO.transportation, min, pageSize),
                                    copsDao.getAllPartnerByTypeCodeCount(tenantId, PARTNERSHIP_TYPE_INFO.transportation)];

  Result.OK(this, {
    totalCount: totals[0].count,
    pageSize,
    current,
    data: partners,
  });
}

function *listVehicles() {
  const pageSize = parseInt(this.request.query.pageSize, 10) || 10;
  const current = parseInt(this.request.query.current, 10) || 1;
  const tenantId = parseInt(this.request.query.tenantId, 10) || 0;
  const min = (current - 1) * pageSize;
  const [vehicles, totals] = yield [vehiclesDao.getVehicles(tenantId, min, pageSize),
                                    vehiclesDao.getVehiclesCount(tenantId)];
  Result.OK(this, {
    totalCount: totals[0].count,
    pageSize,
    current,
    data: vehicles,
  });
}

function *doDispatch() {
  const { tenantId,
          loginId,
          parentId,
          shipmtNo,
          partnerTenantId,
          partnerName,
          freightCharge,
          podType,
          type
        } = yield parse(this.req);

  const [ tenants, tusers ] = yield [tenantDao.getTenantInfo(tenantId),
    tenantUserDao.getAccountInfo(loginId)];

  if (tenants.length === 0 || tusers.length === 0) {
    return Result.ParamError(this, 'tenantId or loginId is error');
  }

  const disp = {
    shipmt_no: shipmtNo,
    parent_id: parentId,
    sr_login_id: tusers[0].loginId,
    sr_login_name: tusers[0].username,
    sr_tenant_id: tenantId,
    sr_name: tenants[0].name,
    source: SHIPMENT_SOURCE.subcontracted,
    sp_tenant_id: partnerTenantId,
    sp_name: partnerName,
    disp_time: new Date(),
    freight_charge: freightCharge,
    disp_status: SHIPMENT_DISPATCH_STATUS.unconfirmed,
    status: SHIPMENT_TRACK_STATUS.unaccepted,
    pod_type: podType
  };

  const upstatus = {
    status: SHIPMENT_TRACK_STATUS.undelivered,
    wheres: {
      sp_tenant_id: tenantId,
      shipmt_no: shipmtNo,
      id: parentId
    }
  };

  yield [shipmtDispDao.addDisp(disp), shipmtDispDao.updateDisp(upstatus)];
  Result.OK(this);
}

function *doSend() {
  const { tenantId, dispId, shipmtNo } = yield parse(this.req);
  const upstatus = {
    disp_status: SHIPMENT_DISPATCH_STATUS.confirmed,
    disp_time: new Date(),
    wheres: {
      sr_tenant_id: tenantId,
      shipmt_no: shipmtNo,
      id: dispId
    }
  };

  yield shipmtDispDao.updateDisp(upstatus);
  Result.OK(this);
}

function *doReturn() {
  const { tenantId, dispId, parentId, shipmtNo } = yield parse(this.req);
  const upstatus = {
    status: SHIPMENT_TRACK_STATUS.undispatched,
    wheres: {
      sp_tenant_id: tenantId,
      shipmt_no: shipmtNo,
      id: parentId
    }
  };

  const del = {
    wheres: {
      id: dispId,
      sr_tenant_id: tenantId,
      shipmt_no: shipmtNo
    }
  };

  yield [shipmtDispDao.updateDisp(upstatus),
    shipmtDispDao.deleteDisp(del)];
  Result.OK(this);
}

function *listSegReq() {
  const tenantId = parseInt(this.request.query.tenantId, 10) || 0;
  const [transitModes, nodeLocations] = yield [shipmtDao.getTransitModes(tenantId),
    shipmtDao.getConsignLocations(tenantId, -1)];

  Result.OK(this, {
    transitModes,
    nodeLocations
  });
}

function *segmentRequest() {
  const { shipmtNos, segGroupFirst, segGroupSecond } = yield parse(this.req);
  const arr = [];

  const sno = shipmtNos[0].shipmtNo.substr(0, 29) + '-01';
  const shipmt = {
    shipmt_no: sno,
    wheres: {
      shipmt_no: shipmtNos[0].shipmtNo
    }
  };

  const disp = {
    shipmt_no: sno,
    wheres: {
      id: shipmtNos[0].dispId
    }
  };

  yield [shipmtDao.copyShipmt(shipmt), shipmtDispDao.copyDisp(disp)];

  Result.OK(this);
}

export default [
  [ 'get', '/v1/transport/dispatch/shipmts', listShipmts ],
  [ 'get', '/v1/transport/dispatch/lsps', listLsps ],
  [ 'get', '/v1/transport/dispatch/vehicles', listVehicles ],
  [ 'get', '/v1/transport/dispatch/segrequires', listSegReq ],
  [ 'post', '/v1/transport/dispatch', doDispatch ],
  [ 'post', '/v1/transport/dispatch/send', doSend ],
  [ 'post', '/v1/transport/dispatch/return', doReturn ],
  [ 'post', '/v1/transport/dispatch/segment', segmentRequest ],
];
