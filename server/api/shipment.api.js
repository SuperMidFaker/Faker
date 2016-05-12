import cobody from 'co-body';
import shipmentDao from '../models/shipment.db';
import shipmentAuxDao from '../models/shipment-auxil.db';
import shipmentDispDao from '../models/shipment-disp.db';
import coopDao from '../models/cooperation.db';
import tenantUserDao from '../models/tenant-user.db';
import mysql from '../../reusable/db-util/mysql';
import Result from '../../reusable/node-util/response-result';
import {
  PARTNERSHIP_TYPE_INFO, CONSIGN_TYPE, SHIPMENT_EFFECTIVES, SHIPMENT_SOURCE,
  SHIPMENT_DISPATCH_STATUS, SHIPMENT_TRACK_STATUS
} from 'universal/constants';

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

function *shipmentListG() {
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const current = parseInt(this.request.query.currentPage, 10);
  const filters = JSON.parse(this.request.query.filters);
  const tenantId = parseInt(this.request.query.tenantId, 10);
  const sortOrder = this.request.query.sortOrder;
  const sortField = this.request.query.sortField;
  let shipmtNo;
  let shipmtType;
  let shipmtDispType;
  filters.forEach(flt => {
    if (flt.name === 'type') {
      if (flt.value === 'unaccepted') {
        shipmtDispType = SHIPMENT_TRACK_STATUS.unaccepted;
      } else if (flt.value === 'accepted') {
        shipmtDispType = SHIPMENT_TRACK_STATUS.undispatched;
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
      return Result.OK(this, {
        totalCount: totals[0].count,
        pageSize,
        current,
        data: shipmts,
      });
    } else {
      const [ totals, shipmts ] = yield [
        shipmentDispDao.getFilteredTotalCount(
          tenantId, shipmtDispType, shipmtNo,
          SHIPMENT_DISPATCH_STATUS.confirmed
        ),
        shipmentDispDao.getFilteredShipments(
          tenantId, shipmtDispType, shipmtNo, SHIPMENT_DISPATCH_STATUS.confirmed,
          pageSize, current, sortField, sortOrder
        )
      ];
      return Result.OK(this, {
        totalCount: totals[0].count,
        pageSize,
        current,
        data: shipmts,
      });
    }
  } catch (e) {
    Result.InternalServerError(this, e.message);
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
      coopDao.getOnlinePartnerByTypeCode(tenantId, PARTNERSHIP_TYPE_INFO.customer)
    ];
    return Result.OK(this, {
      consignerLocations,
      consigneeLocations,
      transitModes,
      vehicleTypes,
      vehicleLengths,
      goodsTypes,
      packagings,
      clients,
    });
  } catch (e) {
    return Result.InternalServerError(this, e.message);
  }
}

function *createShipment(shipmtNo, shipmt, sp, effective, trans) {
    const dbOps = [
      shipmentDao.createByLSP(
        shipmtNo, shipmt, sp.tid, sp.name, sp.login_id,
        effective, trans
      )
    ];
    if (!shipmt.consigner_id) {
      dbOps.push(shipmentDao.upsertLocation(
        shipmt.consigner_id, shipmt.consigner_name, shipmt.consigner_province,
        shipmt.consigner_city, shipmt.consigner_district, shipmt.consigner_addr,
        shipmt.consigner_email, shipmt.consigner_contact, shipmt.consigner_mobile,
        sp.tid, CONSIGN_TYPE.consigner, trans
      ));
    }
    if (!shipmt.consignee_id) {
      dbOps.push(shipmentDao.upsertLocation(
        shipmt.consignee_id, shipmt.consignee_name, shipmt.consignee_province,
        shipmt.consignee_city, shipmt.consignee_district, shipmt.consignee_addr,
        shipmt.consignee_email, shipmt.consignee_contact, shipmt.consignee_mobile,
        sp.tid, CONSIGN_TYPE.consignee, trans
      ));
    }
    shipmt.goodslist.forEach(goods => {
      dbOps.push(shipmentDao.createGoods(goods, shipmtNo, sp.tid, sp.login_id, trans));
    });
    yield dbOps;
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
      shipmtNo, shipmt.client_id, shipmt.client, SHIPMENT_SOURCE.consigned,
      sp.tid, sp.name, sp.login_id, sp.login_name, SHIPMENT_DISPATCH_STATUS.confirmed,
      SHIPMENT_TRACK_STATUS.undispatched, shipmt.freight_charge, new Date(), trans
    );
    yield shipmentDao.updateDispId(shipmtNo, result.insertId, trans);
    yield mysql.commit(trans);
    return Result.OK(this, shipmt);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    Result.InternalServerError(this, e.message);
  }
}

function *shipmtDispatchersG() {
  const tenantId = this.request.query.tenantId;
  try {
    const users = yield tenantUserDao.getTenantUsers(tenantId);
    return Result.OK(this, users);
  } catch (e) {
    return Result.InternalServerError(this, e.message);
  }
}

function *shipmtAcceptP() {
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    const body = yield cobody(this);
    yield [
      shipmentDispDao.updateAcptDisperInfo(
        body.shipmtDispId, body.acptId, body.acptName,
        body.disperId, body.disperName, SHIPMENT_DISPATCH_STATUS.confirmed,
        SHIPMENT_TRACK_STATUS.undispatched, trans
      ),
      shipmentDao.updateEffective(body.shipmtDispId, SHIPMENT_EFFECTIVES.effected, trans)
    ];
    yield mysql.commit(trans);
    return Result.OK(this);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    Result.InternalServerError(this, e.message);
  }
}

function *shipmtDraftP() {
  const body = yield cobody(this);
  const shipmt = body.shipment;
  const sp = body.sp;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    const shipmtNo = yield shipmentDao.genShipmtNoAsync(sp.tid);
    yield* createShipment(shipmtNo, shipmt, sp, SHIPMENT_EFFECTIVES.draft, trans);
    yield mysql.commit(trans);
    return Result.OK(this, shipmt);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    Result.InternalServerError(this, e.message);
  }
}

function *shipmtG() {
  const {tenantId, shipmtNo} = this.request.query;
  try {
    const [shipmtInfo] = yield shipmentDispDao.getShipmtWithNo(shipmtNo);
    const goodslist = yield shipmentDispDao.getShipmtGoodsWithNo(shipmtNo);
    return Result.OK(this, {formData: {...shipmtInfo, goodslist}});
  }catch (e) {
    Result.InternalServerError(this, e.message); 
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
    yield shipmentDispDao.updateShipmtWithInfo(shipment, trans);
    yield shipmentDispDao.updateGoodsWithInfo(editGoods);
    if(removedGoodsIds) { // if no goods removed in editing mode, this variable will be undefined, and we should skip it 
      yield shipmentDispDao.removeGoodsWithIds(removedGoodsIds);
    }
    for(let goods of newGoods) {
      yield shipmentDao.createGoods(newGoods[0], shipmt_no, tenantId, loginId, trans);
    }
    yield mysql.commit(trans);
    return Result.OK(this);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    Result.InternalServerError(this, e.message);
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
    return Result.OK(this);
  } catch (e) {
    if (trans) {
      yield mysql.rollback(trans);
    }
    return Result.InternalServerError(this, e.message);
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
      shipmentDispDao.updateRejectStatus(SHIPMENT_DISPATCH_STATUS.unconfirmed, body.dispId, trans),
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

function *shipmtDetailG() {
  const shipmtNo = this.request.query.shipmtNo;
  try {
    const [ goodslist, shipmts, shipmtdisps ] = yield [
      shipmentDispDao.getShipmtGoodsWithNo(shipmtNo),
      shipmentDao.getShipmtInfo(shipmtNo),
      shipmentDispDao.getShipmtDispInfo(shipmtNo),
    ];
    let shipmt = {};
    if (shipmts.length === 1) {
      shipmt = shipmts[0];
    }
    shipmt.goodslist = goodslist;
    if (shipmtdisps.length === 1) {
      shipmt.status = shipmtdisps[0].status;
      shipmt.source = shipmtdisps[0].source;
    }
    return Result.OK(this, shipmt);
  }catch(e){
    return Result.InternalServerError(this, e.message);
  }
}

export default [
  [ 'get', '/v1/transport/shipments', shipmentListG ],
  [ 'get', '/v1/transport/shipment/requires', shipmtRequiresG ],
  [ 'post', '/v1/transport/shipment/saveaccept', shipmtSaveAcceptP ],
  [ 'post', '/v1/transport/shipment/accept', shipmtAcceptP ],
  [ 'post', '/v1/transport/shipment/draft', shipmtDraftP ],
  [ 'get', '/v1/transport/shipment/dispatchers', shipmtDispatchersG ],
  [ 'post', '/v1/transport/shipment/revoke', shipmtRevokeP ],
  [ 'post', '/v1/transport/shipment/reject', shipmtRejectP ],
  [ 'get', '/v1/transport/shipment', shipmtG ],
  [ 'post', '/v1/transport/shipment/save_edit', shipmtSaveEditP ],
  [ 'get', '/v1/transport/shipment/detail', shipmtDetailG ],
]
