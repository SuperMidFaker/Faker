import cobody from 'co-body';
import shipmentDao from '../models/shipment.db';
import shipmentDispDao from '../models/shipment-disp.db';
import coopDao from '../models/cooperation.db';
import mysql from '../../reusable/db-util/mysql';
import Result from '../../reusable/node-util/response-result';
import uuid from 'reusable/node-util/uuid32';
import {
  PARTNERSHIP_TYPE_INFO, CONSIGN_TYPE, SHIPMENT_EFFECTIVES, SHIPMENT_SOURCE,
  SHIPMENT_DISPATCH_STATUS, SHIPMENT_TRACK_STATUS
} from 'universal/constants';

uuid.init();
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
    const modes = yield shipmentDao.getTransitModes(tenantId);
    const totals = yield shipmentDispDao.getFilteredTotalCount(
      tenantId, shipmtType, shipmtDispType, shipmtNo
    );
    const shipmts = yield shipmentDispDao.getFilteredShipments(
      tenantId, shipmtType, shipmtDispType, shipmtNo
    );
    shipmts.forEach(shm => {
      shm.transport_mode =
        modes.filter(mod => mod.mode_code === shm.transport_mode)[0].mode_name
    });
    Result.OK(this, {
      totalCount: totals[0].count,
      pageSize,
      current,
      data: shipmts,
    });
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
    if (shipmt.consigner_id) {
      dbOps.push(shipmentDao.upsertLocation(
        shipmt.consigner_id, shipmt.consigner_name, shipmt.consigner_province,
        shipmt.consigner_city, shipmt.consigner_district, shipmt.consigner_addr,
        shipmt.consigner_email, shipmt.consigner_contact, shipmt.consigner_mobile,
        sp.tid, CONSIGN_TYPE.consigner, trans
      ));
    }
    if (shipmt.consignee_id) {
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
    const shipmtNo = uuid.gen();
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
function *shipmtAcceptP() {
}

function *shipmtDraftP() {
  const body = yield cobody(this);
  const shipmt = body.shipment;
  const sp = body.sp;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    const shipmtNo = uuid.gen();
    yield* createShipment(shipmtNo, shipmt, sp, SHIPMENT_EFFECTIVES.draft, trans);
    const result = yield shipmentDispDao.createAndAcceptByLSP(
      shipmtNo, shipmt.client_id, shipmt.client, SHIPMENT_SOURCE.consigned,
      sp.tid, sp.name, null, null, SHIPMENT_DISPATCH_STATUS.unconfirmed,
      SHIPMENT_TRACK_STATUS.unaccepted, shipmt.freight_charge, null, trans
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
export default [
  [ 'get', '/v1/transport/shipments', shipmentListG ],
  [ 'get', '/v1/transport/shipment/requires', shipmtRequiresG ],
  [ 'post', '/v1/transport/shipment/saveaccept', shipmtSaveAcceptP ],
  [ 'post', '/v1/transport/shipment/accept', shipmtAcceptP ],
  [ 'post', '/v1/transport/shipment/draft', shipmtDraftP ],
]
