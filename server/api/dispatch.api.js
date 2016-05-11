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

import shipmtDispDao from '../models/shipment-disp.db';
import copsDao from '../models/cooperation.db';
import vehiclesDao from '../models/vehicles.db';
import Result from '../../reusable/node-util/response-result';
import {
  PARTNERSHIP_TYPE_INFO
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
  const current = parseInt(this.request.query.currentPage, 10) || 10;
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
  const current = parseInt(this.request.query.currentPage, 10) || 10;
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
  const current = parseInt(this.request.query.currentPage, 10) || 10;
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
          partnerName
        } = yield parse(this.req);

}

export default [
  [ 'get', '/v1/transport/dispatch/shipmts', listShipmts ],
  [ 'get', '/v1/transport/dispatch/lsps', listLsps ],
  [ 'get', '/v1/transport/dispatch/vehicles', listVehicles ],
  [ 'post', '/v1/transport/dispatch', doDispatch ]
];
