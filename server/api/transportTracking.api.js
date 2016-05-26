import cobody from 'co-body';
import shipmentDao from '../models/shipment.db';
import shipmentAuxDao from '../models/shipment-auxil.db';
import shipmentDispDao from '../models/shipment-disp.db';
import { SHIPMENT_TRACK_STATUS, SHIPMENT_POD_STATUS, SHIPMENT_POD_TYPE } from 'common/constants';
import mysql from '../util/mysql';
import Result from '../util/response-result';

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
  let trans;
  try {
    const body = yield cobody(this);
    const { dispId, shipmtNo, type, actDate } = body;
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
    trans = yield mysql.beginTransaction();
    yield shipmentDispDao.updateDispInfo(dispId, fields, trans);
    yield shipmentDispDao.updateStatusByShipmtNo(
      shipmtNo, fields.status, trans
    );
    yield mysql.commit(trans);
    return Result.OK(this);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    return Result.InternalServerError(this, e.message);
  }
}

function *trackingPodUpdateP() {
  let trans;
  try {
    const body = yield cobody(this);
    const { dispId, shipmtNo, submitter, signStatus, signRemark, photos } = body;
    trans = yield mysql.beginTransaction();
    const result = yield shipmentAuxDao.createPod(
      SHIPMENT_POD_TYPE.paperprint, signStatus, signRemark,
      photos, submitter, trans
    );
    const dispFields = {
      pod_id: result.insertId,
      status: SHIPMENT_TRACK_STATUS.podsubmit,
      pod_status: SHIPMENT_POD_STATUS.pending,
      pod_recv_date: new Date(),
    };
    yield shipmentDispDao.updateDispInfo(dispId, dispFields, trans);
    // yield shipmentDispDao.updateStatusByShipmtNo(
    //   shipmtNo, SHIPMENT_TRACK_STATUS.podsubmit, trans
    // );
    yield mysql.commit(trans);
    return Result.OK(this);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    return Result.InternalServerError(this, e.message);
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

function *trackingPodG() {
  const podId = parseInt(this.request.query.podId, 10);
  try {
    const pods = yield shipmentAuxDao.getPod(podId);
    return Result.OK(this, pods.length === 1 ? pods[0] : {});
  } catch (e) {
    return Result.InternalServerError(this, e.message);
  }
}

function *trackingPodAuditP() {
  let trans;
  try {
    const body = yield cobody(this);
    const { podId, dispId, parentDispId, auditor } = body;
    trans = yield mysql.beginTransaction();
    yield [
      // 更新当前调度为pod被审核接受
      shipmentDispDao.updateDispInfo(dispId, {
        auditor,
        audit_date: new Date(),
        pod_status: SHIPMENT_POD_STATUS.acceptByUs,
      }, trans),
      // 上级调度为pod待审核
      shipmentDispDao.updateDispInfo(parentDispId, {
        pod_recv_date: new Date(),
        pod_id: podId,
        pod_status: SHIPMENT_POD_STATUS.pending,
        status: SHIPMENT_TRACK_STATUS.podsubmit,
      }, trans),
      // 下级调度为pod已接受
      shipmentDispDao.updateDispByParentId(dispId, {
        pod_status: SHIPMENT_POD_STATUS.acceptByClient,
        pod_acpt_date: new Date(),
        status: SHIPMENT_TRACK_STATUS.podaccept,
      }, trans),
    ]
    yield mysql.commit(trans);
    return Result.OK(this);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    return Result.InternalServerError(this, e.message);
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
    return Result.OK(this);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    return Result.InternalServerError(this, e.message);
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
    return Result.OK(this);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    return Result.InternalServerError(this, e.message);
  }
}

export default [
  [ 'get', '/v1/transport/tracking/shipmts', trackingShipmtListG ],
  [ 'post', '/v1/transport/tracking/vehicle', trackingVehicleUpdateP ],
  [ 'post', '/v1/transport/tracking/pickordeliverdate', trackingPickDeliverDateP ],
  [ 'post', '/v1/transport/tracking/pod', trackingPodUpdateP ],
  [ 'get', '/v1/transport/tracking/pod/shipmts', trackingPodShipmtListG ],
  [ 'get', '/v1/transport/tracking/pod', trackingPodG ],
  [ 'post', '/v1/transport/tracking/pod/audit', trackingPodAuditP ],
  [ 'post', '/v1/transport/tracking/pod/return', trackingPodReturnP ],
  [ 'post', '/v1/transport/tracking/pod/resubmit', trackingPodResubmitP ],
];
