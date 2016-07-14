import cobody from 'co-body';
import shipmentAuxDao from '../models/shipment-auxil.db';
import shipmentDispDao from '../models/shipment-disp.db';
import { SHIPMENT_TRACK_STATUS, SHIPMENT_POD_STATUS, } from 'common/constants';
import { SHIPMENT_POD_TYPE, SHIPMENT_DISPATCH_POD_TYPE, SHIPMENT_EVENT_TYPE } from '../util/constants';
import mysql from '../util/mysql';
import Result from '../util/responseResult';
import { sendNewShipMessage }from '../socket.io';
import { ShipmentEvent } from '../models/shipmentEvent.db';
import { DispEventRelation } from '../models/dispEventRelation.db';

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
    return Result.ok(this, {
      totalCount: totalCounts[0].count,
      pageSize,
      current,
      data: shipments
    });
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *trackingVehicleUpdateP() {
  let trans;
  try {
    const body = yield cobody(this);
    trans = yield mysql.beginTransaction();
    const { dispId, shipmtNo, plate, driver, remark } = body;
    const fields = {
      task_vehicle: plate,
      task_driver_name: driver,
      task_remark: remark,
      status: SHIPMENT_TRACK_STATUS.undelivered,
    };
    yield shipmentDispDao.updateDispInfo(dispId, fields, trans);
    yield shipmentDispDao.updateDispByShipmtNo(shipmtNo, fields, trans);
    yield mysql.commit(trans);
    return Result.ok(this);
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *trackingPickDeliverDateP() {
  let trans;
  try {
    const body = yield cobody(this);
    const { dispId, shipmtNo, type, actDate, loginId, tenantId, loginName } = body;
    let fields;
    let operationType = '';
    let shipmentEventType = '';
    if (type === 'pickup') {
      operationType = '提货';
      shipmentEventType = SHIPMENT_EVENT_TYPE.pickedup;
      fields = {
        pickup_act_date: new Date(actDate),
        status: SHIPMENT_TRACK_STATUS.intransit,
      };
    } else {
      operationType = '交货';
      shipmentEventType = SHIPMENT_EVENT_TYPE.delivered;
      fields = {
        deliver_act_date: new Date(actDate),
        status: SHIPMENT_TRACK_STATUS.delivered,
      };
    }
    trans = yield mysql.beginTransaction();
    yield shipmentDispDao.updateDispInfo(dispId, fields, trans);
    yield shipmentDispDao.updateDispByShipmtNo(
      shipmtNo, fields, trans
    );
    yield mysql.commit(trans);
    let id = dispId;
    while(id !== null)
    {
      const disps = yield shipmentDispDao.getShipmtDispWithNo(id);
      const disp = disps[0];
      if (disp.sp_tenant_id !== 0 && disp.sr_tenant_id !== -1) {
        yield sendNewShipMessage({
          ...disp,
          tenant_id: disp.sp_tenant_id,
          login_id: loginId,
          name: disp.sp_name,
          to_tenant_id: disp.sr_tenant_id,
          title: `${operationType}通知`,
          remark: `${disp.sp_name} ${operationType}了，快去看看吧！`,
          content: `${disp.sp_name} ${operationType}了，快去看看吧！运单号：${shipmtNo}`
        });
      }
      id = disp.parent_id;
    }
    const shipmentEvent = yield ShipmentEvent.create({
      tenant_id: tenantId,
      login_id: loginId,
      login_name: loginName,
      type: shipmentEventType,
      content: '',
      created_date: new Date(),
    });
    yield DispEventRelation.create({
      disp_id: dispId,
      event_id: shipmentEvent['null'],
    });
    const disps = yield shipmentDispDao.getShipmtDispWithNo(id);
    const disp = disps[0];
    if (disp.pod_type === SHIPMENT_DISPATCH_POD_TYPE.none) {
      const shipmentEvent1 = yield ShipmentEvent.create({
        tenant_id: tenantId,
        login_id: loginId,
        login_name: loginName,
        type: SHIPMENT_EVENT_TYPE.completed,
        content: '不需回单，交货完成',
        created_date: new Date(),
      });
      yield DispEventRelation.create({
        disp_id: dispId,
        event_id: shipmentEvent1['null'],
      });
    }
    return Result.ok(this);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    return Result.internalServerError(this, e.message);
  }
}

function *trackingPointP() {
  let trans;
  try {
    const body = yield cobody(this);
    const { tenantId, shipmtNo, parentNo, point } = body;
    trans = yield mysql.beginTransaction();
    const result = yield shipmentAuxDao.createPoint(point, tenantId, trans);
    const dbs = [
      shipmentAuxDao.createShipmentPointRel(shipmtNo, result.insertId, trans)
    ];
    if (parentNo) {
      dbs.push(
        shipmentAuxDao.createShipmentPointRel(parentNo, result.insertId, trans)
      );
    }
    yield dbs;
    yield mysql.commit(trans);
    return Result.ok(this);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    return Result.internalServerError(this, e.message);
  }
}

function *trackingLastPointG() {
  const shipmtNo = this.request.query.shipmtNo;
  try {
    const lastPoints = yield shipmentAuxDao.getLastPoint(shipmtNo);
    return Result.ok(this, lastPoints.length === 1 ? lastPoints[0] : {});
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *trackingPodUpdateP() {
  let trans;
  try {
    const body = yield cobody(this);
    const { dispId, parentDispId, shipmtNo, submitter, signStatus, signRemark, photos } = body;
    trans = yield mysql.beginTransaction();
    const result = yield shipmentAuxDao.createPod(
      SHIPMENT_POD_TYPE.paperprint, signStatus, signRemark,
      photos, submitter, trans
    );
    // 承运商手动上传回单时标记为已提交,上级标记为待审核
    let dispFields = {
      pod_id: result.insertId,
      status: SHIPMENT_TRACK_STATUS.podaccept,
      pod_status: SHIPMENT_POD_STATUS.acceptByUs,
      pod_recv_date: new Date(),
      pod_acpt_date: new Date(),
    };
    yield shipmentDispDao.updateDispInfo(dispId, dispFields, trans);
    dispFields = {
      pod_id: result.insertId,
      status: SHIPMENT_TRACK_STATUS.podsubmit,
      pod_status: SHIPMENT_POD_STATUS.pending,
      pod_recv_date: new Date(),
    };
    yield shipmentDispDao.updateDispInfo(parentDispId, dispFields, trans);
    yield mysql.commit(trans);
    return Result.ok(this);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    return Result.internalServerError(this, e.message);
  }
}

function *trackingPodShipmtListG() {
  const tenantId = parseInt(this.request.query.tenantId, 10);
  const filters = JSON.parse(this.request.query.filters);
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const current = parseInt(this.request.query.currentPage, 10);
  try {
    const totalCounts = yield shipmentDispDao.getTrackingPodCount(tenantId, filters);
    const shipments = yield shipmentDispDao.getTrackingPodShipments(
      tenantId, filters, pageSize, current
    );
    return Result.ok(this, {
      totalCount: totalCounts[0].count,
      pageSize,
      current,
      data: shipments
    });
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *trackingPodG() {
  const podId = parseInt(this.request.query.podId, 10);
  try {
    const pods = yield shipmentAuxDao.getPod(podId);
    return Result.ok(this, pods.length === 1 ? pods[0] : {});
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *trackingPodAuditP() {
  let trans;
  try {
    const body = yield cobody(this);
    const { podId, dispId, parentDispId, auditor, tenantId, loginId } = body;
    trans = yield mysql.beginTransaction();
    // 默认当前pod为审核接受已提交
    let currPodStatus = SHIPMENT_POD_STATUS.acceptByUs;
    if (!parentDispId) {
      // 当前为货主时,直接修改为客户已接受
      currPodStatus = SHIPMENT_POD_STATUS.acceptByClient;
    }
    const dbUpdates = [
      // 更新当前调度pod状态
      shipmentDispDao.updateDispInfo(dispId, {
        auditor,
        audit_date: new Date(),
        pod_status: currPodStatus,
      }, trans),
      // 下级调度为pod已接受
      shipmentDispDao.updateDispByParentId(dispId, {
        pod_status: SHIPMENT_POD_STATUS.acceptByClient,
        pod_acpt_date: new Date(),
        status: SHIPMENT_TRACK_STATUS.podaccept,
      }, trans),
    ];
    if (parentDispId) {
      // 如果存在上游客户,上级调度为pod待审核
      dbUpdates.push(
        shipmentDispDao.updateDispInfo(
          parentDispId, {
            pod_recv_date: new Date(),
            pod_id: podId,
            pod_status: SHIPMENT_POD_STATUS.pending,
            status: SHIPMENT_TRACK_STATUS.podsubmit,
        }, trans)
      );
    }

    yield dbUpdates;
    yield mysql.commit(trans);
    const shipmentEvent = yield ShipmentEvent.create({
      tenant_id: tenantId,
      login_id: loginId,
      login_name: auditor,
      type: SHIPMENT_EVENT_TYPE.completed,
      content: '回单通过，完成',
      created_date: new Date(),
    });
    yield DispEventRelation.create({
      disp_id: dispId,
      event_id: shipmentEvent['null'],
    });
    return Result.ok(this);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    return Result.internalServerError(this, e.message);
  }
}

function *trackingPodReturnP() {
  let trans;
  try {
    const body = yield cobody(this);
    const { dispId } = body;
    trans = yield mysql.beginTransaction();
    // todo 添加回单异常
    yield [
      // 更新当前调度为pod拒绝
      shipmentDispDao.updateDispInfo(dispId, {
        pod_status: SHIPMENT_POD_STATUS.rejectByUs,
        // status: SHIPMENT_TRACK_STATUS.delivered,
      }, trans),
      // 下级调度为pod已接受
      shipmentDispDao.updateDispByParentId(dispId, {
        pod_status: SHIPMENT_POD_STATUS.rejectByClient,
      }, trans),
    ];
    yield mysql.commit(trans);
    return Result.ok(this);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    return Result.internalServerError(this, e.message);
  }
}

function *trackingPodResubmitP() {
  let trans;
  try {
    const body = yield cobody(this);
    const { dispId, parentDispId } = body;
    trans = yield mysql.beginTransaction();
    yield [
      // 更新当前调度为pod被审核接受
      shipmentDispDao.updateDispInfo(dispId, {
        pod_status: SHIPMENT_POD_STATUS.acceptByUs,
      }, trans),
      // 上级调度为pod待审核
      shipmentDispDao.updateDispInfo(parentDispId, {
        pod_recv_date: new Date(),
        pod_status: SHIPMENT_POD_STATUS.pending,
        status: SHIPMENT_TRACK_STATUS.podsubmit,
      }, trans),
    ]
    yield mysql.commit(trans);
    return Result.ok(this);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    return Result.internalServerError(this, e.message);
  }
}

function *trackingExcpShipmtsG() {
  const tenantId = parseInt(this.request.query.tenantId, 10);
  const filters = JSON.parse(this.request.query.filters);
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const current = parseInt(this.request.query.currentPage, 10);
  try {
    const totalCounts = yield shipmentDispDao.getTrackingCount(tenantId, filters);
    const shipments = yield shipmentDispDao.getTrackingShipments(
      tenantId, filters, pageSize, current
    );
    return Result.ok(this, {
      totalCount: totalCounts[0].count,
      pageSize,
      current,
      data: shipments
    });
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

export default [
  [ 'get', '/v1/transport/tracking/shipmts', trackingShipmtListG ],
  [ 'post', '/v1/transport/tracking/vehicle', trackingVehicleUpdateP ],
  [ 'post', '/v1/transport/tracking/pickordeliverdate', trackingPickDeliverDateP ],
  [ 'post', '/v1/transport/tracking/point', trackingPointP ],
  [ 'get', '/v1/transport/tracking/lastpoint', trackingLastPointG ],
  [ 'post', '/v1/transport/tracking/pod', trackingPodUpdateP ],
  [ 'get', '/v1/transport/tracking/pod/shipmts', trackingPodShipmtListG ],
  [ 'get', '/v1/transport/tracking/pod', trackingPodG ],
  [ 'post', '/v1/transport/tracking/pod/audit', trackingPodAuditP ],
  [ 'post', '/v1/transport/tracking/pod/return', trackingPodReturnP ],
  [ 'post', '/v1/transport/tracking/pod/resubmit', trackingPodResubmitP ],
  [ 'get', '/v1/transport/tracking/exception/shipmts', trackingExcpShipmtsG ],
];
