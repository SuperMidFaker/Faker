import cobody from 'co-body';
import idDao from '../models/exportaccept.db';
import Result from '../../reusable/node-util/response-result';
import mysql from '../../reusable/db-util/mysql';

export default [
  ['get', '/v1/export/exportaccepts', exportaccepts],
  ['get', '/v1/export/status', exportacceptstatusG],
  ['get', '/v1/export/:tid/customsBrokers', customsBrokersG],
  ['get', '/v1/export/getSelectOptions', getSelectOptions],
  ['delete', '/v1/export/exportaccept', delId],
  ['post', '/v1/export/exportaccept', submitexportaccept],
  ['put', '/v1/export/exportaccept', editexportaccept]
]
function* exportaccepts() {
  const current = parseInt(this.request.query.currentPage || 1, 10);
  const pageSize = parseInt(this.request.query.pageSize || 10, 10);
  const tenantId = parseInt(this.request.query.tenantId || 0, 10);
  const currentStatus = parseInt(this.request.query.currentStatus || 1, 10) //木有状态则默认查询未发送的数据;


  const filters = this.request.query.filters ? JSON.parse(this.request.query.filters) : [];
  const sortField = this.request.query.sortField;
  const sortOrder = this.request.query.sortOrder;

  try {
    const totals = yield idDao.getIdTotalCount(currentStatus, filters, tenantId);
    const ids = yield idDao.getPagedIdsByCorp(current, pageSize, filters, sortField, sortOrder, currentStatus, tenantId);
    return Result.OK(this, {
      totalCount: totals.length > 0 ? totals[0].count : 0,
      pageSize,
      current,
      data: ids
    });
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, e.message);
  }
}

function* exportacceptstatusG() {

  const tenantId = parseInt(this.request.query.tenantId || 0, 10);
  const filters = this.request.query.filters ? JSON.parse(this.request.query.filters) : [];

  try {
    const notAcceptCount = yield idDao.getStatusCount(tenantId, 1, filters);
    const acceptCount = yield idDao.getStatusCount(tenantId, 2, filters);
    const invalidCount = yield idDao.getStatusCount(tenantId, 3, filters);
    const revokedCount = yield idDao.getStatusCount(tenantId, 4, filters);

    return Result.OK(this, {
      notAcceptCount: notAcceptCount.length > 0 ? notAcceptCount[0].count : 0,
      acceptCount: acceptCount.length > 0 ? acceptCount[0].count : 0,
      invalidCount: invalidCount.length > 0 ? invalidCount[0].count : 0,
      revokedCount: revokedCount.length > 0 ? revokedCount[0].count : 0,
    });
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, e.message);
  }
}

function* delId() {
  const body = yield cobody(this);
  try {
    yield idDao.deleteId(body.idkey);
    return Result.OK(this);
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, '删除出口业务受理数据异常');
  }
}

function* customsBrokersG() {
  const tenantId = this.params.tid;
  const cbs = yield idDao.getcustomsBrokers(tenantId);
  return Result.OK(this, cbs);
}

function* getSelectOptions() {
  const customsInfoList = yield idDao.getCustomsInfo();
  const declareWayList = yield idDao.getDeclareWay();
  const tradeModeList = yield idDao.getTradeMode();
  return Result.OK(this, {
    customsInfoList: customsInfoList,
    declareWayList: declareWayList,
    tradeModeList: tradeModeList
  });
}




function* editexportaccept() {
  const body = yield cobody(this);
  const entity = body.exportaccept;
  const newEntity = {};
  newEntity.usebook = entity.usebook == true ? 1 : 0;
  newEntity.urgent = entity.urgent == true ? 1 : 0;
  newEntity.tenant_id = body.tenantId;
  newEntity.master_customs = entity.master_customs;
  newEntity.bill_no = entity.bill_no;
  newEntity.invoice_no = entity.invoice_no;
  newEntity.trade_mode = entity.trade_mode;
  newEntity.other_note = entity.other_note;

  console.log(newEntity);
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    const result = yield idDao.editexportaccept(newEntity, entity.key, trans);
    yield mysql.commit(trans);
    Result.OK(this);
  } catch (e) {
    console.log('submitImport', e && e.stack);
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}

function* submitexportaccept() {
  const body = yield cobody(this);
  const entity = body.exportaccept;

  entity.usebook = (entity.usebook || false) ? 1 : 0;
  entity.urgent = (entity.urgent || false) ? 1 : 0;
  entity.tenant_id = body.tenantId;
  entity.status = 0;

  let trans;
  try {
    trans = yield mysql.beginTransaction();
    const result = yield idDao.insertexportaccept(entity, trans);
    yield mysql.commit(trans);
    Result.OK(this, result[0]);
  } catch (e) {
    console.log('submitImport', e && e.stack);
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}
