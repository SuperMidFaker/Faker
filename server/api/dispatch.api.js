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

function *listExpandShipmts() {

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
/**
 * 分配接口
 */
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
  // 新建tms_shipment_dispatch记录
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
  // 更新之前dispatch记录的状态和时间
  const upstatus = {
    status: SHIPMENT_TRACK_STATUS.undelivered,
    disp_time: new Date(),
    wheres: {
      sp_tenant_id: tenantId,
      shipmt_no: shipmtNo,
      id: parentId
    }
  };

  yield [shipmtDispDao.addDisp(disp), shipmtDispDao.updateDisp(upstatus)];
  Result.OK(this);
}
/**
 * 分配承运商后确认分配
 */
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
/**
 * 分配承运商后取消分配
 */
function *doReturn() {
  const { tenantId, dispId, parentId, shipmtNo } = yield parse(this.req);
  // 删除新建的dispatch记录，更新之前dispatch记录的状态
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

function buildConsigneeSegment(sno, shipmtNo, dispId, group, idx) {
  const shipmt = {
    shipmt_no: `${sno}-0${idx}`,
    consignee_name: group.nodeLocation.name,
    consignee_province: group.nodeLocation.province,
    consignee_city: group.nodeLocation.city,
    consignee_district: group.nodeLocation.district,
    consignee_addr: group.nodeLocation.addr,
    consignee_email: group.nodeLocation.email,
    consignee_contact: group.nodeLocation.contact,
    consignee_mobile: group.nodeLocation.mobile,
    deliver_est_date: group.deliverEstDate,
    transport_mode_code: group.deliverMode.mode_code,
    transport_mode: group.deliverMode.mode_name,
    parent_no: shipmtNo,
    segmented: 0,
    wheres: {
      shipmt_no: shipmtNo
    }
  };
  const disp = {
    shipmt_no: `${sno}-0${idx}`,
    wheres: {
      id: dispId
    }
  };

  return {shipmt, disp};
}

function buildConsignerSegment(sno, shipmtNo, dispId, group, idx) {
  const shipmt = {
    shipmt_no: `${sno}-0${idx}`,
    consigner_name: group.nodeLocation.name,
    consigner_province: group.nodeLocation.province,
    consigner_city: group.nodeLocation.city,
    consigner_district: group.nodeLocation.district,
    consigner_addr: group.nodeLocation.addr,
    consigner_email: group.nodeLocation.email,
    consigner_contact: group.nodeLocation.contact,
    consigner_mobile: group.nodeLocation.mobile,
    pickup_est_date: group.pickupEstDate,
    transport_mode_code: group.pickupMode.mode_code,
    transport_mode: group.pickupMode.mode_name,
    parent_no: shipmtNo,
    segmented: 0,
    wheres: {
      shipmt_no: shipmtNo
    }
  };
  const disp = {
    shipmt_no: `${sno}-0${idx}`,
    wheres: {
      id: dispId
    }
  };

  return {shipmt, disp};
}

function validGroup(group) {
  if (!group.nodeLocation || !group.nodeLocation.node_id) {
    return false;
  }
  if (!group.pickupMode || !group.pickupMode.id) {
    return false;
  }
  if (!group.deliverEstDate) {
    return false;
  }
  if (!group.pickupEstDate) {
    return false;
  }
  return true;
}
/**
 * 分段(一分为二或者一分为三)
 */
function *segmentRequest() {
  const { shipmtNos, segGroupFirst, segGroupSecond } = yield parse(this.req);
  if (!validGroup(segGroupFirst)) {
    return Result.ParamError(this, 'segGroupFirst params is not valid');
  }

  const arr = [];
  const seg = validGroup(segGroupSecond);
  //
  shipmtNos.forEach(o => {
    let sno = o.shipmtNo;
    if (sno.length > 29) {
      sno = sno.substr(0, 29);
    }
    let idx = 1;
    let tmp = buildConsigneeSegment(sno, o.shipmtNo, o.dispId, segGroupFirst, idx);
    arr.push(shipmtDao.copyShipmt(tmp.shipmt), shipmtDispDao.copyDisp(tmp.disp));
    idx++;
    if (seg) {
      let stmp = buildConsigneeSegment(sno, o.shipmtNo, o.dispId, segGroupSecond, idx);
      tmp = buildConsignerSegment(sno, o.shipmtNo, o.dispId, segGroupFirst, idx);
      Object.assign(tmp.shipmt, stmp.shipmt);
      arr.push(shipmtDao.copyShipmt(tmp.shipmt), shipmtDispDao.copyDisp(tmp.disp));
      idx++;
      stmp = buildConsignerSegment(sno, o.shipmtNo, o.dispId, segGroupSecond, idx);
      arr.push(shipmtDao.copyShipmt(stmp.shipmt), shipmtDispDao.copyDisp(stmp.disp));
    } else {
      tmp = buildConsignerSegment(sno, o.shipmtNo, o.dispId, segGroupFirst, idx);
      arr.push(shipmtDao.copyShipmt(tmp.shipmt), shipmtDispDao.copyDisp(tmp.disp));
    }

    arr.push(shipmtDao.updateShipmt({segmented: 1, wheres: {shipmt_no: o.shipmtNo}}));
  });

  yield arr;

  Result.OK(this);
}
/**
 * 取消分段
 * 需要检查是否已经有子运单分配承运商
 */
function *segmentCancelRequest() {
  const tenantId = parseInt(this.request.query.tenantId, 10) || 0;
  const shipmtNo = this.request.query.shipmtNo;
  const [ res ] = yield shipmtDispDao.countShipmtSubdisp(tenantId, shipmtNo);
  if (res && res.count > 0) {
    return Result.ParamError(this, 'shipmtNo has dispatched');
  }

  // TODO delete shipment and shipment dispatch

  Result.OK(this);
}
/**
 * 检查是否已经有子运单分配承运商，如果有则不能进行取消分段
 */
function *segmentCancelCheck() {
  const tenantId = parseInt(this.request.query.tenantId, 10) || 0;
  const shipmtNo = this.request.query.shipmtNo;
  let [ res ] = yield shipmtDispDao.countShipmtSubdisp(tenantId, shipmtNo);
  if (!res) {
    res = {count: 0};
  }
  Result.OK(this, res);
}

export default [
  [ 'get', '/v1/transport/dispatch/shipmts', listShipmts ],
  [ 'get', '/v1/transport/dispatch/expandlist', listExpandShipmts ],
  [ 'get', '/v1/transport/dispatch/lsps', listLsps ],
  [ 'get', '/v1/transport/dispatch/vehicles', listVehicles ],
  [ 'get', '/v1/transport/dispatch/segrequires', listSegReq ],
  [ 'post', '/v1/transport/dispatch/segment/cancel', segmentCancelRequest ],
  [ 'get', '/v1/transport/dispatch/segment/cancelcheck', segmentCancelCheck ],
  [ 'post', '/v1/transport/dispatch', doDispatch ],
  [ 'post', '/v1/transport/dispatch/send', doSend ],
  [ 'post', '/v1/transport/dispatch/return', doReturn ],
  [ 'post', '/v1/transport/dispatch/segment', segmentRequest ],
];
