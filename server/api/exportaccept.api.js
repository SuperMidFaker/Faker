import cobody from 'co-body';
import idDao from '../models/exportaccept.db';
import Result from '../util/response-result';
import mysql from '../util/mysql';

export default [
  ['get', '/v1/export/exportaccepts', exportaccepts],
  ['get', '/v1/export/status', exportacceptStatusG],
  ['get', '/v1/export/:tid/customsBrokers', customsBrokersG],
  ['get', '/v1/export/getSelectOptions', getSelectOptions],
  ['delete', '/v1/export/exportaccept', delId],
  ['post', '/v1/export/exportaccept', submitExportAccept],
  ['put', '/v1/export/exportaccept', editExportAccept],
  ['put', '/v1/export/sendaccept', sendAccept],
  ['put', '/v1/export/invalidAccept', invalidAccept],
  ['get', '/v1/export/exportacceptlogs', exportacceptlogs],
]

function* exportaccepts() {
  const current = parseInt(this.request.query.currentPage || 1, 10);
  const pageSize = parseInt(this.request.query.pageSize || 10, 10);
  const tenantId = parseInt(this.request.query.tenantId || 0, 10);
  const currentStatus = parseInt(this.request.query.currentStatus || 1, 10)


  const filters = this.request.query.filters ? JSON.parse(this.request.query.filters) : [];
  const sortField = this.request.query.sortField;
  const sortOrder = this.request.query.sortOrder;

  try {
    const totals = yield idDao.getIdTotalCount(currentStatus, filters, tenantId);
    const ids = yield idDao.getPagedIdsByCorp(current, pageSize, filters, sortField, sortOrder, currentStatus, tenantId);

    const notSendCount = yield idDao.getStatusCount(tenantId, 0, filters);
    const notAcceptCount = yield idDao.getStatusCount(tenantId, 1, filters);
    const acceptCount = yield idDao.getStatusCount(tenantId, 2, filters);
    const invalidCount = yield idDao.getStatusCount(tenantId, 3, filters);


    return Result.OK(this, {
      idlist: {
        totalCount: totals.length > 0 ? totals[0].count : 0,
        pageSize,
        current,
        data: ids
      },
      statusList: {
        notSendCount: notSendCount.length > 0 ? notSendCount[0].count : 0,
        notAcceptCount: notAcceptCount.length > 0 ? notAcceptCount[0].count : 0,
        acceptCount: acceptCount.length > 0 ? acceptCount[0].count : 0,
        invalidCount: invalidCount.length > 0 ? invalidCount[0].count : 0
      }
    });
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, e.message);
  }
}

function* exportacceptStatusG() {

  const tenantId = parseInt(this.request.query.tenantId || 0, 10);
  const filters = this.request.query.filters ? JSON.parse(this.request.query.filters) : [];

  try {
    const notSendCount = yield idDao.getStatusCount(tenantId, 0, filters);
    const notAcceptCount = yield idDao.getStatusCount(tenantId, 1, filters);
    const acceptCount = yield idDao.getStatusCount(tenantId, 2, filters);
    const invalidCount = yield idDao.getStatusCount(tenantId, 3, filters);

    return Result.OK(this, {
      notSendCount: notSendCount.length > 0 ? notSendCount[0].count : 0,
      notAcceptCount: notAcceptCount.length > 0 ? notAcceptCount[0].count : 0,
      acceptCount: acceptCount.length > 0 ? acceptCount[0].count : 0,
      invalidCount: invalidCount.length > 0 ? invalidCount[0].count : 0
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
    return Result.InternalServerError(this, '删除进口委托数据异常');
  }
}

function* customsBrokersG() {
  const tenantId = this.params.tid;
  const cbs = yield idDao.getcustomsBrokers(tenantId);
  return Result.OK(this, cbs);
}

function* getSelectOptions() {
  const params = this.request.query;
  const customsInfoList = yield idDao.getCustomsInfo();
  const declareWayList = yield idDao.getDeclareWay();
  const tradeModeList = yield idDao.getTradeMode();
  const shortNameList=yield idDao.getShortName();
  const tenantId = params.tenantId;
  const delId = params.delId;

  const declareFileList = yield idDao.getDeclareFileList(tenantId, delId);
  const declareCategoryList = yield idDao.getDeclareCategoryList(tenantId);
  return Result.OK(this, {
    customsInfoList: customsInfoList,
    declareWayList: declareWayList,
    tradeModeList: tradeModeList,
    declareFileList: declareFileList,
    declareCategoryList: declareCategoryList,
    shortNameList:shortNameList
  });
}

function* editExportAccept() {
  const body = yield cobody(this);
  const entity = body.exportaccept;
  const params = JSON.parse(body.params);
  const newEntity = {};
  newEntity.usebook = entity.usebook == true ? 1 : 0;
  newEntity.urgent = entity.urgent == true ? 1 : 0;
  newEntity.tenant_id = params.tenantId;
  newEntity.master_customs = entity.master_customs;
  newEntity.bill_no = entity.bill_no;
  newEntity.invoice_no = entity.invoice_no;
  newEntity.trade_mode = entity.trade_mode;
  newEntity.other_note = entity.other_note;

  let trans;
  try {
    trans = yield mysql.beginTransaction();
    const result = yield idDao.editExportAccept(newEntity, entity.key, trans);
    if (parseInt(params.status, 10) === 2) {
      yield idDao.writeLog(entity.key, params.loginId, params.username, `变更业务单:${entity.del_no}`, trans);
    }
    yield idDao.saveFileInfo(params.declareFileList, params.tenantId, entity.key, entity.del_no, trans);
    yield mysql.commit(trans);
    Result.OK(this);
  } catch (e) {
    console.log('submitExport', e && e.stack);
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}

function* submitExportAccept() {
  const body = yield cobody(this);
  const entity = body.exportaccept;
  const params = JSON.parse(body.params);

  entity.usebook = (entity.usebook || false) ? 1 : 0;
  entity.urgent = (entity.urgent || false) ? 1 : 0;
  entity.tenant_id = params.tenantId;
  entity.creater_login_id = params.loginId;
  entity.status = 0;

  let trans;
  try {
    trans = yield mysql.beginTransaction();
    const result = yield idDao.insertExportAccept(entity, trans);
    yield idDao.writeLog(result[0].key, params.loginId, params.username, `添加业务单:${result[0].del_no}`, trans);
    yield idDao.insertUser(result[0].key, result[0].del_no, 0, params.loginId, trans);
    yield idDao.saveFileInfo(params.declareFileList, params.tenantId, result[0].key, result[0].del_no, trans);
    yield mysql.commit(trans);
    Result.OK(this, result[0]);
  } catch (e) {
    console.log('submitExport', e && e.stack);
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}

function* sendAccept() {
  const tenantId = this.request.query.tenantId;
  const customsBroker = this.request.query.customsBroker;
  const sendlist = this.request.query.sendlist;
  const status = this.request.query.status;
  try {
    yield idDao.sendAccept(tenantId, sendlist, customsBroker, status);
    Result.OK(this);
  } catch (e) {
    console.log('send', e && e.stack);
    Result.InternalServerError(this, e.message);
  }
}

function* invalidAccept() {
  const tenantId = this.request.query.tenantId;
  const loginId = this.request.query.loginId;
  const username = this.request.query.username;
  const acceptId = this.request.query.acceptId;
  const reason = this.request.query.reason;
  const del_no = this.request.query.del_no;

  let trans;
  try {
    trans = yield mysql.beginTransaction();
    yield idDao.invalidAccept(tenantId, loginId, username, acceptId, reason, trans);
    yield idDao.writeLog(acceptId, loginId, username, `作废业务单:${del_no}`, trans);
    yield mysql.commit(trans);
    Result.OK(this);
  } catch (e) {
    console.log('invalid', e && e.stack);
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}

function* exportacceptlogs() {
  const current = parseInt(this.request.query.currentPage || 1, 10);
  const pageSize = parseInt(this.request.query.pageSize || 10, 10);
  const acceptId = parseInt(this.request.query.acceptId || 10, 10);

  try {
    const totals = yield idDao.getLogsCount(acceptId);
    const logs = yield idDao.getLogs(current, pageSize, acceptId);

    return Result.OK(this, {
      loglist: {
        totalCount: totals.length > 0 ? totals[0].count : 0,
        pageSize,
        current,
        data: logs
      }
    });
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, e.message);
  }
}
