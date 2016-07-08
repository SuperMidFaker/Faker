import cobody from 'co-body';
import shipmentDao from '../models/shipment.db';
import shipmentAuxDao from '../models/shipment-auxil.db';
import shipmentDispDao from '../models/shipment-disp.db';
import coopDao from '../models/cooperation.db';
import tenantUserDao from '../models/tenant-user.db';
import mysql from '../util/mysql';
import Result from '../util/responseResult';
import crypto from 'crypto';
import {
  PARTNERSHIP_TYPE_INFO, SHIPMENT_EFFECTIVES, SHIPMENT_SOURCE,
  SHIPMENT_TRACK_STATUS,
  VEHICLE_TYPES, VEHICLE_LENGTH_TYPES, GOODS_TYPES, CONTAINER_PACKAGE_TYPE,
} from 'common/constants';
import { SHIPMENT_DISPATCH_STATUS, CONSIGN_TYPE } from '../util/constants';
import { sendNewShipMessage }from '../socket.io';

const vehicleTypes = VEHICLE_TYPES;

const vehicleLengths = VEHICLE_LENGTH_TYPES;

const goodsTypes = GOODS_TYPES;

function *shipmentListG() {
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const current = parseInt(this.request.query.currentPage, 10);
  const filters = JSON.parse(this.request.query.filters);
  const tenantId = parseInt(this.request.query.tenantId, 10);
  const sortOrder = this.request.query.sortOrder || 'created_date';
  const sortField = this.request.query.sortField || 'desc';
  let shipmtNo;
  let shipmtType;
  let shipmtDispType;
  filters.forEach(flt => {
    if (flt.name === 'type') {
      if (flt.value === 'unaccepted') {
        shipmtDispType = true;
      } else if (flt.value === 'accepted') {
        shipmtDispType = false;
      } else if (flt.value === 'draft') {
        shipmtType = SHIPMENT_EFFECTIVES.draft;
      } else if (flt.value === 'archived') {
        shipmtType = SHIPMENT_EFFECTIVES.archived;
      }
    } else if (flt.name === 'name') {
      shipmtNo = flt.value;
    }
  });
  try {
    if (shipmtType !== undefined) {
      const [ totals, shipmts ] = yield [
        shipmentDao.getCountByType(tenantId, shipmtType, shipmtNo),
        shipmentDao.getShipmentsByType(
          tenantId, shipmtType, shipmtNo, pageSize, current,
          sortField, sortOrder
        )
      ];
      return Result.ok(this, {
        totalCount: totals[0].count,
        pageSize,
        current,
        data: shipmts,
      });
    } else {
      const [ totals, shipmts ] = yield [
        shipmentDispDao.getFilteredTotalCount(
          tenantId, shipmtDispType, shipmtNo,
          SHIPMENT_DISPATCH_STATUS.confirmed, SHIPMENT_TRACK_STATUS.unaccepted
        ),
        shipmentDispDao.getFilteredShipments(
          tenantId, shipmtDispType, shipmtNo, SHIPMENT_DISPATCH_STATUS.confirmed,
          pageSize, current, sortField, sortOrder, SHIPMENT_TRACK_STATUS.unaccepted
        )
      ];
      return Result.ok(this, {
        totalCount: totals[0].count,
        pageSize,
        current,
        data: shipmts,
      });
    }
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

function *shipmtRequiresG() {
  const tenantId = this.request.query.tenantId;
  try {
    const [ consignerLocations, consigneeLocations, transitModes, packagings, clients ] =
      yield [
        shipmentDao.getConsignLocations(tenantId, CONSIGN_TYPE.consigner),
        shipmentDao.getConsignLocations(tenantId, CONSIGN_TYPE.consignee),
        shipmentDao.getTransitModes(tenantId),
        shipmentDao.getPackagings(tenantId),
        coopDao.getPartnerByTypeCode(tenantId, PARTNERSHIP_TYPE_INFO.customer)
    ];
    return Result.ok(this, {
      consignerLocations,
      consigneeLocations,
      transitModes,
      vehicleTypes,
      vehicleLengths,
      goodsTypes,
      packagings,
      containerPackagings: CONTAINER_PACKAGE_TYPE,
      clients,
    });
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *createShipment(shipmtNo, shipmt, sp, effective, trans) {
    const dbOps = [
      shipmentDao.createByLSP(
        shipmtNo, shipmt, sp.tid, sp.name, sp.login_id,
        effective, trans
      )
    ];
    if (!shipmt.consigner_id && shipmt.consigner_name
        && shipmt.consigner_name.trim().length > 0) {
      dbOps.push(shipmentDao.upsertLocation(
        shipmt.consigner_id, shipmt.consigner_name, shipmt.consigner_province,
        shipmt.consigner_city, shipmt.consigner_district, shipmt.consigner_addr,
        shipmt.consigner_email, shipmt.consigner_contact, shipmt.consigner_mobile,
        sp.tid, CONSIGN_TYPE.consigner, trans
      ));
    }
    if (!shipmt.consignee_id && shipmt.consignee_name
        && shipmt.consignee_name.trim().length > 0) {
      dbOps.push(shipmentDao.upsertLocation(
        shipmt.consignee_id, shipmt.consignee_name, shipmt.consignee_province,
        shipmt.consignee_city, shipmt.consignee_district, shipmt.consignee_addr,
        shipmt.consignee_email, shipmt.consignee_contact, shipmt.consignee_mobile,
        sp.tid, CONSIGN_TYPE.consignee, trans
      ));
    }
    if (shipmt.goodslist.length > 0) {
      dbOps.push(shipmentDispDao.createGoods(shipmt.goodslist, shipmtNo, sp.tid, sp.login_id, trans));
    }
    yield dbOps;
}

function *shipmtSavePendingP() {
  const body = yield cobody(this);
  const shipmt = body.shipment;
  const sp = body.sp;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    const shipmtNo = yield shipmentDao.genShipmtNoAsync(sp.tid);
    yield* createShipment(shipmtNo, shipmt, sp, SHIPMENT_EFFECTIVES.effected, trans);
    const result = yield shipmentDispDao.createAndAcceptByLSP(
      shipmtNo, shipmt.customer_tenant_id, shipmt.customer_name,
      shipmt.customer_partner_id,
      SHIPMENT_SOURCE.consigned, sp.tid, sp.name, null, sp.login_id,
      sp.login_name, 'ePOD', SHIPMENT_DISPATCH_STATUS.confirmed,
      SHIPMENT_TRACK_STATUS.unaccepted, shipmt.freight_charge, new Date(), trans
    );
    yield shipmentDao.updateDispId(shipmtNo, result.insertId, trans);
    yield mysql.commit(trans);
    return Result.ok(this, shipmt);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    Result.internalServerError(this, e.message);
  }
}

function *shipmtSaveAcceptP() {
  const body = yield cobody(this);
  const shipmt = body.shipment;
  const sp = body.sp;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    const shipmtNo = yield shipmentDao.genShipmtNoAsync(sp.tid);
    yield* createShipment(shipmtNo, shipmt, sp, SHIPMENT_EFFECTIVES.effected, trans);
    const result = yield shipmentDispDao.createAndAcceptByLSP(
      shipmtNo, shipmt.customer_tenant_id, shipmt.customer_name,
      shipmt.customer_partner_id,
      SHIPMENT_SOURCE.consigned, sp.tid, sp.name, null, sp.login_id,
      sp.login_name, 'ePOD', SHIPMENT_DISPATCH_STATUS.confirmed,
      SHIPMENT_TRACK_STATUS.undispatched, shipmt.freight_charge, new Date(), trans
    );
    yield shipmentDao.updateDispId(shipmtNo, result.insertId, trans);
    yield mysql.commit(trans);
    return Result.ok(this, shipmt);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    Result.internalServerError(this, e.message);
  }
}

function *shipmtDispatchersG() {
  const tenantId = this.request.query.tenantId;
  try {
    const users = yield tenantUserDao.getTenantUsers(tenantId);
    return Result.ok(this, users);
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *shipmtAcceptP() {
  let trans;
  try {
    const body = yield cobody(this);
    trans = yield mysql.beginTransaction();
    yield [
      shipmentDispDao.updateAcptDisperInfo(
        body.shipmtDispId, body.acptId, body.acptName,
        body.disperId, body.disperName, SHIPMENT_DISPATCH_STATUS.confirmed,
        SHIPMENT_TRACK_STATUS.undispatched, trans
      ),
      shipmentDao.updateEffective(body.shipmtDispId, SHIPMENT_EFFECTIVES.effected, trans)
    ];
    yield mysql.commit(trans);
    const disps = yield shipmentDispDao.getShipmtDispWithNo(body.shipmtDispId);
    const disp = disps[0];
    yield sendNewShipMessage({
      tenant_id: disp.sp_tenant_id,
      login_id: body.acptId,
      name: disp.sp_name,
      to_tenant_id: disp.sr_tenant_id,
      shipmt_no: disp.shipmt_no,
      status: disp.status,
      consigner_city: disp.consigner_city,
      consignee_city: disp.consignee_city,
      title: '接单通知',
      remark: `${disp.sp_name} 接单了，快去看看吧！`,
      content: `${disp.sp_name} 接单了，快去看看吧！运单号：${disp.shipmt_no}`
    });
    return Result.ok(this);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    return Result.internalServerError(this, e.message);
  }
}

function *shipmtDraftG() {
  const shipmtno = this.request.query.shipmtno;
  try {
    const shipmts = yield shipmentDao.getDraftShipmt(shipmtno);
    if (shipmts.length !== 1) {
      throw new Error('draft shipment not found');
    }
    const goodslist = yield shipmentDispDao.getShipmtGoodsWithNo(shipmtno);
    return Result.ok(this, {
      shipmt: shipmts[0],
      goodslist,
    });
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *shipmtDraftP() {
  const body = yield cobody(this);
  const shipmt = body.shipment;
  const sp = body.sp;
  let trans;
  try {
    const shipmtNo = yield shipmentDao.genShipmtNoAsync(sp.tid);
    trans = yield mysql.beginTransaction();
    yield* createShipment(shipmtNo, shipmt, sp, SHIPMENT_EFFECTIVES.draft, trans);
    yield mysql.commit(trans);
    return Result.ok(this, shipmt);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    Result.internalServerError(this, e.message);
  }
}

function *shipmtDraftSaveAcceptP() {
  let trans;
  try {
    const body = yield cobody(this);
    const { shipment, loginName, loginId, tenantId } = body;
    const { goodslist, shipmt_no, removedGoodsIds } = shipment;
    const newGoods = goodslist.filter(goods => goods.id === undefined);
    const editGoods = goodslist.filter(goods => goods.id !== undefined);
    trans = yield mysql.beginTransaction();
    const dbOps = [
      shipmentDao.updateShipmtWithInfo(shipment, trans),
    ];
    if (editGoods.length > 0) {
      dbOps.push(shipmentDispDao.updateGoodsWithInfo(editGoods));
    }
    if (removedGoodsIds) {
      // if no goods removed in editing mode, this variable will be undefined,
      // and we should skip it
      dbOps.push(shipmentDispDao.removeGoodsWithIds(removedGoodsIds));
    }
    if (newGoods.length > 0) {
      dbOps.push(shipmentDispDao.createGoods(newGoods, shipmt_no, tenantId, loginId, trans));
    }
    yield dbOps;
    const result = yield shipmentDispDao.createAndAcceptByLSP(
      shipmt_no, shipment.customer_tenant_id, shipment.customer_name,
      shipment.customer_partner_id, SHIPMENT_SOURCE.consigned,
      shipment.lsp_tenant_id, shipment.lsp_name, shipment.lsp_partner_id,
      loginId, loginName, 'ePOD', SHIPMENT_DISPATCH_STATUS.confirmed,
      SHIPMENT_TRACK_STATUS.undispatched, shipment.freight_charge,
      new Date(), trans
    );
    yield shipmentDao.updateDispIdEffective(shipmt_no, result.insertId, SHIPMENT_EFFECTIVES.effected, trans);
    yield mysql.commit(trans);
    return Result.ok(this);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    return Result.internalServerError(this, e.message);
  }
}

function *shipmtDraftDelP() {
  try {
    const body = yield cobody(this);
    yield shipmentDao.delDraft(body.shipmtno);
    return Result.ok(this);
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

function *shipmtG() {
  const { shipmtNo } = this.request.query;
  try {
    const [shipmtInfo] = yield shipmentDispDao.getShipmtWithNo(shipmtNo);
    const goodslist = yield shipmentDispDao.getShipmtGoodsWithNo(shipmtNo);
    return Result.ok(this, {formData: {...shipmtInfo, goodslist}});
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

function *shipmtSaveEditP() {
  const body = yield cobody(this);
  const { shipment, tenantId, loginId } = body;
  const { goodslist, shipmt_no, removedGoodsIds } = shipment;
  const newGoods = goodslist.filter(goods => goods.id === undefined);
  const editGoods = goodslist.filter(goods => goods.id !== undefined);
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    const dbOps = [
      shipmentDao.updateShipmtWithInfo(shipment, trans),
      shipmentDispDao.updateDispInfo(shipment.disp_id, {
       freight_charge: shipment.freight_charge,
      }, trans),
    ];
    if (editGoods.length > 0) {
      dbOps.push(shipmentDispDao.updateGoodsWithInfo(editGoods));
    }
    if (removedGoodsIds) {
      // if no goods removed in editing mode, this variable will be undefined,
      // and we should skip it
      dbOps.push(shipmentDispDao.removeGoodsWithIds(removedGoodsIds));
    }
    if (newGoods.length > 0) {
      dbOps.push(shipmentDispDao.createGoods(newGoods, shipmt_no, tenantId, loginId, trans));
    }
    yield dbOps;
    yield mysql.commit(trans);
    return Result.ok(this);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    Result.internalServerError(this, e.message);
  }
}

function *shipmtRevokeP() {
  let trans;
  try {
    const body = yield cobody(this);
    trans = yield mysql.beginTransaction();
    const [ _, logRes, __ ] = yield [
      shipmentDao.updateEffective(body.shipmtDispId, SHIPMENT_EFFECTIVES.cancelled, trans),
      shipmentAuxDao.createLog('revoke', body.reason, trans),
      shipmentDispDao.updateLogAction('revoke', body.shipmtDispId, trans),
    ];
    yield shipmentAuxDao.createDispLogRel(logRes.insertId, body.shipmtDispId, trans);
    yield mysql.commit(trans);
    return Result.ok(this);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    return Result.internalServerError(this, e.message);
  }
}

function *shipmtRejectP() {
  let trans;
  try {
    const body = yield cobody(this);
    trans = yield mysql.beginTransaction();
    yield [
      // todo shipmentAuxDao.createException
      // todo set excp_level
      shipmentDispDao.updateRejectStatus(SHIPMENT_DISPATCH_STATUS.cancel, body.dispId, trans),
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

function *shipmtDetailG() {
  const shipmtNo = this.request.query.shipmtNo;
  const tenantId = this.request.query.tenantId;
  const sourceType = this.request.query.sourceType;
  try {
    const [ goodslist, shipmts, shipmtSrDisps, shipmtSpDisps, points ] = yield [
      shipmentDispDao.getShipmtGoodsWithNo(shipmtNo),
      shipmentDao.getShipmtInfo(shipmtNo),
      shipmentDispDao.getShipmtDispInfo(shipmtNo, tenantId, 'sr'),
      shipmentDispDao.getShipmtDispInfo(shipmtNo, tenantId, 'sp'),
      shipmentAuxDao.getShipmentPoints(shipmtNo),
    ];
    let shipmt = {};
    const charges = {
      earnings:  shipmtSpDisps.length === 1 ? shipmtSpDisps[0].freight_charge : null,
      payout: shipmtSrDisps.length === 1 && shipmtSrDisps[0].sp_tenant_id !== 0
        ? shipmtSrDisps[0].freight_charge : null,
    };
    let shipmtCreator;
    if (shipmts.length === 1) {
      shipmt = shipmts[0];
      if (shipmt.vehicle_type) {
        const vt = vehicleTypes[shipmt.vehicle_type];
        if (vt) {
          shipmt.vehicle_type = vt.text;
        }
      }
      if (shipmt.vehicle_length) {
        const vl = vehicleLengths[shipmt.vehicle_length];
        if (vl) {
          shipmt.vehicle_length = vl.text;
        }
      }
      if (shipmt.tenant_id === shipmt.customer_tenant_id) {
        shipmtCreator = shipmt.customer_name;
      } else if (shipmt.tenant_id === shipmt.lsp_tenant_id) {
        shipmtCreator = shipmt.lsp_name;
      }
    }
    shipmt.goodslist = goodslist;
    let downstreamDispStatus;
    let tracking = {};
    // 上游dispatch为shipmtSpDisps[0]
    // 下游dispatch为shipmtSrDisps[0]
    if (sourceType === 'sr' && shipmtSrDisps.length === 1) {
      const upstream = shipmtSpDisps.length === 1;
      // 下游dispatch若为司机,则不需要显示
      const downstream = shipmtSrDisps[0].sp_tenant_id !== 0;
      downstreamDispStatus = shipmtSrDisps[0].disp_status;
      tracking = {
        created_date: shipmt.created_date,
        upstream_name:
          upstream ? shipmtSpDisps[0].sp_name : null,
        upstream_acpt_time:
          upstream ? shipmtSpDisps[0].acpt_time : null,
        upstream_disp_time:
          upstream ? shipmtSpDisps[0].disp_time : null,
        downstream_name: downstream ? shipmtSrDisps[0].sp_name : null,
        downstream_acpt_time: downstream ? shipmtSrDisps[0].acpt_time : null,
        downstream_disp_time: downstream ? shipmtSrDisps[0].disp_time : null,
        pickup_act_date: shipmtSrDisps[0].pickup_act_date,
        deliver_act_date: shipmtSrDisps[0].deliver_act_date,
        pod_recv_date: shipmtSrDisps[0].pod_recv_date,
        upstream_status: upstream ? shipmtSpDisps[0].status : -1,
        downstream_status: downstream ? shipmtSrDisps[0].status : -1,
        vehicle: shipmtSrDisps[0].task_vehicle,
        poder: shipmtSrDisps[0].sp_name || shipmtSrDisps[0].sr_name,
      };
    } else if (sourceType === 'sp' && shipmtSpDisps.length === 1) {
      // 下游dispatch若为司机,则不需要显示
      const downstream = shipmtSrDisps.length === 1 && shipmtSrDisps[0].sp_tenant_id !== 0;
      downstreamDispStatus = downstream ? shipmtSrDisps[0].disp_status : -1;
      tracking = {
        created_date: shipmt.created_date,
        upstream_name: shipmtSpDisps[0].sp_name,
        upstream_acpt_time: shipmtSpDisps[0].acpt_time,
        upstream_disp_time: shipmtSpDisps[0].disp_time,
        downstream_name: downstream ? shipmtSrDisps[0].sp_name : null,
        downstream_acpt_time: downstream ? shipmtSrDisps[0].acpt_time : null,
        downstream_disp_time: downstream ? shipmtSrDisps[0].disp_time : null,
        pickup_act_date: shipmtSpDisps[0].pickup_act_date,
        deliver_act_date: shipmtSpDisps[0].deliver_act_date,
        pod_recv_date: shipmtSpDisps[0].pod_recv_date,
        upstream_status: shipmtSpDisps[0].status,
        downstream_status: downstream ? shipmtSrDisps[0].status : -1,
        vehicle: shipmtSpDisps[0].task_vehicle,
        poder: downstream ? shipmtSrDisps[0].sp_name : shipmtSpDisps[0].sp_name,
      };
    }
    tracking.creator = shipmtCreator;
    tracking.points = points;
    shipmt.status = tracking.downstream_status >= SHIPMENT_TRACK_STATUS.unaccepted
      && downstreamDispStatus > 0 ?
      tracking.downstream_status : tracking.upstream_status;
    return Result.ok(this, {
      shipmt,
      tracking,
      charges,
    });
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *shipmtPublicDetail() {
  const shipmtNo = this.request.query.shipmtNo;
  const key = this.request.query.key;
  try {
    const [ goodslist, shipmts, draftShipmts, shipmtDisp, points ] = yield [
      shipmentDispDao.getShipmtGoodsWithNo(shipmtNo),
      shipmentDao.getShipmtInfo(shipmtNo),
      shipmentDao.getDraftShipmt(shipmtNo),
      shipmentDispDao.getShipmtDispWithShipmtNo(shipmtNo),
      shipmentAuxDao.getShipmentPoints(shipmtNo),
    ];
    let shipmt = {};
    let shipmtCreator;
    if (shipmts.length === 1 && draftShipmts.length === 1) {
      shipmt = {
        ...shipmts[0],
        ...draftShipmts[0],
        ...shipmtDisp[0],
      };
      if (shipmt.vehicle_type) {
        const vt = vehicleTypes[shipmt.vehicle_type];
        if (vt) {
          shipmt.vehicle_type = vt.text;
        }
      }
      if (shipmt.vehicle_length) {
        const vl = vehicleLengths[shipmt.vehicle_length];
        if (vl) {
          shipmt.vehicle_length = vl.text;
        }
      }
      if (shipmt.tenant_id === shipmt.customer_tenant_id) {
        shipmtCreator = shipmt.customer_name;
      } else if (shipmt.tenant_id === shipmt.lsp_tenant_id) {
        shipmtCreator = shipmt.lsp_name;
      }
    }
    shipmt.goodslist = goodslist;
    let tracking = {
      created_date: shipmt.created_date,
    };
    tracking.creator = shipmtCreator;
    tracking.points = points;
    const dateStr = shipmt.created_date.getTime().toString();
    const md5 = crypto.createHash('md5');
    md5.update(shipmtNo + dateStr);
    const KEY = md5.digest('hex');
    if (key === KEY) {
      return Result.ok(this, {
        shipmt,
        tracking,
      });
    } else {
      return Result.paramError(this);
    }
    
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

export default [
  [ 'get', '/v1/transport/shipments', shipmentListG ],
  [ 'get', '/v1/transport/shipment/requires', shipmtRequiresG ],
  [ 'post', '/v1/transport/shipment/save', shipmtSavePendingP ],
  [ 'post', '/v1/transport/shipment/saveaccept', shipmtSaveAcceptP ],
  [ 'post', '/v1/transport/shipment/accept', shipmtAcceptP ],
  [ 'post', '/v1/transport/shipment/draft', shipmtDraftP ],
  [ 'get', '/v1/transport/shipment', shipmtG ],
  [ 'post', '/v1/transport/shipment/save_edit', shipmtSaveEditP ],
  [ 'get', '/v1/transport/shipment/draft', shipmtDraftG ],
  [ 'post', '/v1/transport/shipment/draft/saveaccept', shipmtDraftSaveAcceptP ],
  [ 'post', '/v1/transport/shipment/draft/del', shipmtDraftDelP ],
  [ 'get', '/v1/transport/shipment/dispatchers', shipmtDispatchersG ],
  [ 'post', '/v1/transport/shipment/revoke', shipmtRevokeP ],
  [ 'post', '/v1/transport/shipment/reject', shipmtRejectP ],
  [ 'get', '/v1/transport/shipment/detail', shipmtDetailG ],
  [ 'get', '/public/v1/transport/shipment/detail', shipmtPublicDetail ],
];
