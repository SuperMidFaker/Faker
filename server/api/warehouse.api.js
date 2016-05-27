import cobody from 'co-body';
import whDao from '../models/warehouse.db';
import Result from '../util/responseResult';

export default [
  ['get', '/v1/wewms/warehouses', warehouseG],
  ['post', '/v1/wewms/warehouse', warehouseP],

  ['get', '/v1/wms/customer/warehouses', getWarehouses],
  ['post', '/v1/wms/customer/inbound', getInbound],
  ['post', '/v1/wms/customer/outbound', getOutbound],
  ['post', '/v1/wms/customer/inventory', getInventory],
  ['post', '/v1/wms/customer/wh_fee', getFee]
]

function *warehouseG() {
  const current = parseInt(this.request.query.currentPage || 1, 10);
  const pageSize = parseInt(this.request.query.pageSize || 10, 10);
  const corpId = parseInt(this.request.query.corpId || 0, 10);
  if (!corpId) {
    return Result.paramError(this, 'corpid incorrect');
  }
  try {
    const totals = yield whDao.getWhTotalCount(corpId);
    const whs = yield whDao.getPagedWhsByCorp(current, pageSize, corpId);
    return Result.ok(this, {
      totalCount: totals.length > 0 ? totals[0].count : 0,
      pageSize,
      current,
      data: whs
    });
  } catch (e) {
    console.log(e);
    return Result.internalServerError(this, e.message);
  }
}

function *warehouseP() {
  const body = yield cobody(this);
  try {
    // todo check duplicates by wh_code maybe
    const result = yield whDao.insertWh(body.warehouse, body.corpId, body.tenantId);
    return Result.ok(this, { id: result.insertId });
  } catch (e) {
    console.log(e);
    return Result.internalServerError(this, '添加仓库异常');
  }
}

function *getWarehouses() {
  try {
    var body = {
      since_id: this.request.query.since_id,
      max_id: this.request.query.max_id,
      count: this.request.query.count,
      page: this.request.query.page
    };
    var records = yield whDao.getSlicedWarehouses(body, this.state.user.userId);
    records = packRespRecords(records, body.since_id && !body.max_id);/*使用since_id数据库内取出为按u_code从小到大排列*/
    Result.ok(this, records);
  } catch (e) {
    /* handle error */
    Result.internalServerError(this, e.message);
  }
}

function packRespRecords(records, needReverse) {
  for (var i = 0; i < records.length; ++i) {
    var record = records[i];
    if (record.hasOwnProperty('qty') && record.qty === null) {
      record.qty = 0;
    }
    if (record.hasOwnProperty('amount') && record.amount === null) {
      record.amount = 0;
    }
    if (record.hasOwnProperty('trans_date')) {
      record.trans_date = record.trans_date * 1000;// .getTime();
    }
  }
  return needReverse ? records.reverse() : records;
}

function *getInbound() {
  try {
    var body = yield cobody(this);
    var records = yield whDao.getSlicedInbound(body, this.state.user.userId);
    records = packRespRecords(records, body.since_id && !body.max_id);
    Result.ok(this, records);
  } catch (e) {
    /* handle error */
    Result.internalServerError(this, e.message);
  }
}

function *getOutbound() {
  try {
    var body = yield cobody(this);
    var records = yield whDao.getSlicedOutbound(body, this.state.user.userId);
    records = packRespRecords(records, body.since_id && !body.max_id);
    Result.ok(this, records);
  } catch (e) {
    /* handle error */
    Result.internalServerError(this, e.message);
  }
}

function *getInventory() {
  try {
    var body = yield cobody(this);
    var records = yield whDao.getSlicedInventory(body, this.state.user.userId);
    records = packRespRecords(records, body.since_id && !body.max_id);
    Result.ok(this, records);
  } catch (e) {
    /* handle error */
    Result.internalServerError(this, e.message);
  }
}

function *getFee() {
  try {
    var body = yield cobody(this);
    var records = yield whDao.getSlicedFee(body, this.state.user.userId);
    records = packRespRecords(records, body.since_id && !body.max_id);
    Result.ok(this, records);
  } catch (e) {
    /* handle error */
    Result.internalServerError(this, e.message);
  }
}
