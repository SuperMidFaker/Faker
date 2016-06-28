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
import Result from '../util/responseResult';
import {
  PARTNERSHIP_TYPE_INFO,
  SHIPMENT_SOURCE,
  SHIPMENT_TRACK_STATUS,
  SHIPMENT_VEHICLE_CONNECT,
  VEHICLE_TYPES,
  VEHICLE_LENGTH_TYPES,
  WELOGIX_LOGO_URL,
} from 'common/constants';
import { SHIPMENT_DISPATCH_STATUS } from '../util/constants';
import parse from 'co-body';
import { sendMessage }from '../socket.io';
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
  Result.ok(this, {
    totalCount: totals[0].count,
    pageSize,
    current,
    data: shipmts,
  });
}

function *listShipmtsGrouped() {
  const filters = JSON.parse(this.request.query.filters);
  const tenantId = parseInt(this.request.query.tenantId, 10) || 0;

  const shipmts = yield shipmtDispDao.getShipmtsGrouped(tenantId, filters);
  Result.ok(this, shipmts);
}

function *listShipmtsGroupedSub() {
  const filters = JSON.parse(this.request.query.filters);
  const tenantId = parseInt(this.request.query.tenantId, 10) || 0;
  filters.status = 'waiting';

  filters['S.segmented'] = 0;

  const shipmts = yield shipmtDispDao.getDispatchShipmts(tenantId, filters, 0, 100);
  Result.ok(this, shipmts);
}

function *listExpandShipmts() {
  const query = this.request.query;
  const tenantId = parseInt(query.tenantId, 10) || 0;
  const shipmtNo = query.shipmtNo;
  const srTenantId = parseInt(query.srTenantId, 10) || 0;
  const spTenantId = parseInt(query.spTenantId, 10) || 0;
  // no more than 3 so use 0, 100
  const params = {
    'S.parent_no': shipmtNo,
    'SD.sp_tenant_id': spTenantId,
    'SD.sr_tenant_id': srTenantId
  };
  const res = yield shipmtDispDao.getDispatchShipmts(tenantId, params, 0, 100);
  Result.ok(this, res);
}

function *listLsps() {
  const pageSize = parseInt(this.request.query.pageSize, 10) || 10;
  const current = parseInt(this.request.query.currentPage, 10) || 1;
  const tenantId = parseInt(this.request.query.tenantId, 10) || 0;
  const min = (current - 1) * pageSize;
  const filter = {
    partner_name:this.request.query.carrier,
  };
  const [partners, totals] = yield [
    copsDao.getAllPartnerByTypeCode(tenantId, PARTNERSHIP_TYPE_INFO.transportation,
                                    filter, min, pageSize),
    copsDao.getAllPartnerByTypeCodeCount(tenantId, PARTNERSHIP_TYPE_INFO.transportation,
                                         filter),
  ];

  Result.ok(this, {
    totalCount: totals[0].count,
    pageSize,
    current,
    data: partners,
  });
}

function *listVehicles() {
  const pageSize = parseInt(this.request.query.pageSize, 10) || 10;
  const current = parseInt(this.request.query.currentPage, 10) || 1;
  const tenantId = parseInt(this.request.query.tenantId, 10) || 0;
  const plate = this.request.query.plate;
  const min = (current - 1) * pageSize;
  const [ vehicles, totals ] = yield [
    vehiclesDao.getVehicles(tenantId, plate, min, pageSize),
    vehiclesDao.getVehiclesCount(tenantId, plate),
  ];
  Result.ok(this, {
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
          shipmtNos,
          partnerId,
          partnerTenantId,
          partnerName,
          freightCharge,
          podType,
          type,
          taskId,
          taskVehicle,
          taskDriverId,
          taskDriverName,
          connectType
        } = yield parse(this.req);

  const [ tenants, tusers ] = yield [tenantDao.getTenantInfo(tenantId),
    tenantUserDao.getAccountInfo(loginId)];

  if (tenants.length === 0 || tusers.length === 0) {
    return Result.paramError(this, 'tenantId or loginId is error');
  }

  const arr = [];
  shipmtNos.forEach(s => {
    const shipmtNo = s.shipmtNo;
    const parentId = s.dispId;
    // 新建tms_shipment_dispatch记录
    const disp = {
      shipmt_no: shipmtNo,
      parent_id: parentId,
      sr_login_id: tusers[0].loginId,
      sr_login_name: tusers[0].username,
      sr_tenant_id: tenantId,
      sr_name: tenants[0].name,
      source: SHIPMENT_SOURCE.subcontracted,
      disp_time: new Date(),
      disp_status: SHIPMENT_DISPATCH_STATUS.unconfirmed,
      status: SHIPMENT_TRACK_STATUS.unaccepted,
      pod_type: podType
    };

    if (type === 'tenant') {
      disp.sp_partner_id = partnerId;
      disp.sp_tenant_id = partnerTenantId;
      disp.sp_name = partnerName;
      disp.freight_charge = freightCharge;
      if (disp.sp_tenant_id === -1 || !disp.sp_tenant_id) {
        disp.acpt_time = new Date();
        disp.status = SHIPMENT_TRACK_STATUS.undispatched;
      }
    } else {
      disp.sp_partner_id = 0;
      disp.sp_tenant_id = 0;
      disp.task_id = taskId;
      disp.task_vehicle = taskVehicle;
      disp.vehicle_connect_type = connectType;
      disp.task_driver_id = taskDriverId;
      disp.task_driver_name = taskDriverName;
      if (connectType === SHIPMENT_VEHICLE_CONNECT.disconnected) {
        disp.status = SHIPMENT_TRACK_STATUS.undelivered;
      }
    }
    // 更新之前dispatch记录的状态和时间
    const upstatus = {
      child_send_status: 1,
      wheres: {
        sp_tenant_id: tenantId,
        shipmt_no: shipmtNo,
        id: parentId
      }
    };

    arr.push(shipmtDispDao.addDisp(disp), shipmtDispDao.updateDisp(upstatus));
  });

  yield arr;
  Result.ok(this);
}
/**
 * 分配承运商后确认分配
 */
function *doSend() {
  const { tenantId, loginId, list } = yield parse(this.req);
  const alist = JSON.parse(list);
  const arr = [];
  alist.forEach(t => {
    const { dispId, shipmtNo, parentId, sp_tenant_id, sr_name, avatar } = t;
    // 更新之前dispatch记录的状态和时间
    const upParentStatus = {
      status: SHIPMENT_TRACK_STATUS.undelivered,
      disp_time: new Date(),
      child_send_status: 2,
      wheres: {
        sp_tenant_id: tenantId,
        shipmt_no: shipmtNo,
        id: parentId
      }
    };

    const upstatus = {
      disp_status: SHIPMENT_DISPATCH_STATUS.confirmed,
      disp_time: new Date(),
      wheres: {
        sr_tenant_id: tenantId,
        shipmt_no: shipmtNo,
        id: dispId
      }
    };

    const s = sendMessage({
      tenant_id: tenantId,
      login_id: loginId,
      name:'新运单通知',
    },{
      namespace: '/',
      tenant_id: sp_tenant_id,
    },{
      content: sr_name + '下单了，快去看看吧！订单号：' + shipmtNo,
      logo: avatar || WELOGIX_LOGO_URL,
      url: '/transport/acceptance'
    });

    arr.push(shipmtDispDao.updateDisp(upParentStatus), shipmtDispDao.updateDisp(upstatus), s);
  });

  yield arr;
  Result.ok(this);
}
/**
 * 分配承运商后取消分配
 */
function *doReturn() {
  const { tenantId, dispId, parentId, shipmtNo } = yield parse(this.req);
  // 删除新建的dispatch记录，更新之前dispatch记录的状态
  const upstatus = {
    status: SHIPMENT_TRACK_STATUS.undispatched,
    child_send_status: 0,
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
  Result.ok(this);
}

function *listSegReq() {
  const tenantId = parseInt(this.request.query.tenantId, 10) || 0;
  const [transitModes, nodeLocations] = yield [shipmtDao.getTransitModes(tenantId),
    shipmtDao.getConsignLocations(tenantId, -1)];

  Result.ok(this, {
    transitModes,
    nodeLocations,
    vehicleLengths: VEHICLE_LENGTH_TYPES,
    vehicleTypes: VEHICLE_TYPES
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
    return Result.paramError(this, 'segGroupFirst params is not valid');
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

  Result.ok(this);
}
/**
 * 取消分段
 * 需要检查是否已经有子运单分配承运商
 */
function *segmentCancelRequest() {
  const { tenantId, shipmtNo } = yield parse(this.req);
  const res = yield shipmtDispDao.getSegmentShipmtStatus(tenantId, shipmtNo);
  const b = res.every(v => {
    return v.status <= 2;
  });
  if (!b) {
    return Result.paramError(this, 'shipmtNo has dispatched');
  }

  // TODO delete shipment and shipment dispatch
  const arr = [];
  res.forEach(v => {
    arr.push(shipmtDao.deleteShipmt({wheres: {shipmt_no: v.shipmt_no}}));
    arr.push(shipmtDispDao.deleteDisp({wheres: {id: v.id}}));
  });
  arr.push(shipmtDao.updateShipmt({segmented: 0, wheres: {shipmt_no: shipmtNo}}));
  yield arr;
  Result.ok(this);
}

function *segmentCancelCheckRequest() {
  const { tenantId, shipmtNo } = yield parse(this.req);
  const res = yield shipmtDispDao.getSegmentShipmtStatus(tenantId, shipmtNo);

  const b = res.every(v => {
    return v.status <= 2;
  });
  Result.ok(this, b);
}

export default [
  [ 'get', '/v1/transport/dispatch/shipmts', listShipmts ],
  [ 'get', '/v1/transport/dispatch/expandlist', listExpandShipmts ],
  [ 'get', '/v1/transport/dispatch/shipmts/grouped', listShipmtsGrouped ],
  [ 'get', '/v1/transport/dispatch/shipmts/groupedsub', listShipmtsGroupedSub ],
  [ 'get', '/v1/transport/dispatch/lsps', listLsps ],
  [ 'get', '/v1/transport/dispatch/vehicles', listVehicles ],
  [ 'get', '/v1/transport/dispatch/segrequires', listSegReq ],
  [ 'post', '/v1/transport/dispatch/segment/cancel', segmentCancelRequest ],
  [ 'post', '/v1/transport/dispatch/segment/cancelcheck', segmentCancelCheckRequest ],
  [ 'post', '/v1/transport/dispatch', doDispatch ],
  [ 'post', '/v1/transport/dispatch/send', doSend ],
  [ 'post', '/v1/transport/dispatch/return', doReturn ],
  [ 'post', '/v1/transport/dispatch/segment', segmentRequest ],
];
