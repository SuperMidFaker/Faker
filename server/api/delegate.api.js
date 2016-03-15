import cobody from 'co-body';
import Result from '../../reusable/node-util/response-result';
import mysql from '../../reusable/db-util/mysql';
import delegate from '../models/delegate.db';

export default [
   ['get', '/v1/delegate/delegate', getCorpdelegate],
   ['put', '/v1/delegate/status', switchdelegateStatus],
   ['get', '/v1/delegate/StatusG', importdelegateStatusG],
   ['delete', '/v1/delegate/delete', deldelegate],
   ['get', '/v1/delegate/:tid/customsBrokers', customsBrokersG],
   ['put', '/v1/delegate/edit', editdelegate],
   ['post', '/v1/delegate/submit', submitdelegate],
   ['get', '/v1/delegate/:tid/tenants', getTenantsUnderMain],
   ['get', '/v1/delegate/getSelectOptions', getSelectOptions],
   ['put', '/v1/delegate/UnsentUnsent', getUnsent],
   ['put', '/v1/delegate/senddelegate', sendDelegate],
   ['get', '/v1/delegate/exportdelegatelogs', exportdelegatelogs],
  ['put', '/v1/delegate/invalidDelegate', invalidDelegate]
];


function *getCorpdelegate() {
  const tenantId = this.request.query.tenantId;
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const current = parseInt(this.request.query.currentPage, 10);
  const filters = this.request.query.filters ? JSON.parse(this.request.query.filters) : [];
  const sortField = this.request.query.sortField;
  const sortOrder = this.request.query.sortOrder;
  
  const currentStatus = parseInt(this.request.query.currentStatus || 0, 10) //木有状态则默认查询未发送的数据;
  try {
    const counts = yield delegate.getTenantdelegateCount(tenantId, filters,currentStatus);
    const totalCount = counts[0].num;
    const personnel = yield delegate.getPageddelegateInCorp(tenantId, current, pageSize,
                                                                  filters, sortField, sortOrder,currentStatus);
    // 换页,切换页数时从这里传到reducer里更新
    Result.OK(this, {
      totalCount: totalCount.length > 0 ? totalCount[0].count : 0,
      current,
      pageSize,
      data: personnel
    });
    
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}


function *getUnsent() {
  const tenantId = this.request.query.tenantId;
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const current = parseInt(this.request.query.currentPage, 10);
  const filters = this.request.query.filters ? JSON.parse(this.request.query.filters) : [];
  const sortField = this.request.query.sortField;
  const sortOrder = this.request.query.sortOrder;
  try {
    const counts = yield delegate.getTenantdelegateCount(tenantId, filters);
    const totalCount = counts[0].num;
    const personnel = yield delegate.getdelegateUnsent(tenantId, current, pageSize,
                                                                  filters, sortField, sortOrder);
    // 换页,切换页数时从这里传到reducer里更新
    Result.OK(this, {
      totalCount,
      current,
      pageSize,
      data: personnel
    });
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}


function *switchdelegateStatus() {
  const body = yield cobody(this);
  try {
    yield delegate.updateStatus(body.pid, body.status);
    Result.OK(this);
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}

function *deldelegate() {
  const body = yield cobody(this);
  const pid = body.idkey;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    yield delegate.deletedelegate(pid);
    yield mysql.commit(trans);
    Result.OK(this);
  } catch (e) {
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}
function *editdelegate() {
  const body = yield cobody(this);
  const entity = body.delegate;
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
    const result = yield delegate.updatedelegate(newEntity, entity.key, trans);
    if (parseInt(params.status, 10) === 2) {
      yield delegate.writeLog(entity.key, params.loginId, params.username, `变更业务单:${entity.del_no}`, trans);
    }
    yield delegate.saveFileInfo(params.declareFileList, params.tenantId, entity.key, entity.del_no, trans);
    yield mysql.commit(trans);
    Result.OK(this);
  } catch (e) {
    console.log('submitImport', e && e.stack);
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}
function *submitdelegate() {
  const body = yield cobody(this);
  const delegates = body.delegate;
  delegates.usebook = (delegates.usebook || false) ? 1 : 0;
  delegates.urgent = (delegates.urgent || false) ? 1 : 0;
  delegates.tenant_id = body.tenantId;
  const params = body.params;
  const loginId=body.loginId;
  const username=body.username;
  delegates.status = 0;
  delegates.delegate_type=1;
  delegates.creater_login_id = loginId;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    const result =yield delegate.insertdelegate(delegates, trans);
    yield delegate.writeLog(result[0].key, loginId, username, `添加业务单:${result[0].del_no}`, trans);
    yield delegate.insertUser(result[0].key, result[0].del_no, 0, loginId, trans);
    yield delegate.saveFileInfo(params, delegates.tenant_id, result[0].key, result[0].del_no, trans);
    yield mysql.commit(trans);
    Result.OK(this, result[0]);
  } catch (e) {
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}
function *getTenantsUnderMain() {
  const tenantId = this.params.tid;
  try {
    const branches = yield delegate.getAttachedTenants(tenantId);
    Result.OK(this, branches);
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}
function* getSelectOptions() {
  const params = this.request.query;
  const customsInfoList = yield delegate.getCustomsInfo();
  const declareWayList = yield delegate.getDeclareWay();
  const tradeModeList = yield delegate.getTradeMode();
  const tenantId = params.tenantId;
  const delId = params.delId;

  const declareFileList = yield delegate.getDeclareFileList(tenantId, delId);
  const declareCategoryList = yield delegate.getDeclareCategoryList(tenantId);
  return Result.OK(this, {
    customsInfoList: customsInfoList,
    declareWayList: declareWayList,
    tradeModeList: tradeModeList,
    declareFileList: declareFileList,
    declareCategoryList: declareCategoryList
  });
}
function* importdelegateStatusG() {
  const tenantId = parseInt(this.request.query.tenantId || 0, 10);
  const filters = this.request.query.filters ? JSON.parse(this.request.query.filters) : [];
  try {
    const notSendCount = yield delegate.getStatusCount(tenantId, 0, filters);
    const notAcceptCount = yield delegate.getStatusCount(tenantId, 1, filters);
    const acceptCount = yield delegate.getStatusCount(tenantId, 2, filters);
    const invalidCount = yield delegate.getStatusCount(tenantId, 3, filters);

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
function* sendDelegate() {
  const tenantId = this.request.query.tenantId;
  const customsBroker = this.request.query.customsBroker;
  const sendlist = this.request.query.sendlist;
  const status = this.request.query.status;
  try {
    yield delegate.sendDelegate(tenantId, sendlist, customsBroker, status);
    Result.OK(this);
  } catch (e) {
    console.log('send', e && e.stack);
    Result.InternalServerError(this, e.message);
  }
}
function* customsBrokersG() {
  const tenantId = this.params.tid;
  const cbs = yield delegate.getcustomsBrokers(tenantId);
  return Result.OK(this, cbs);
}
function* exportdelegatelogs() {
  const current = parseInt(this.request.query.currentPage || 1, 10);
  const pageSize = parseInt(this.request.query.pageSize || 10, 10);
  const delegateId = parseInt(this.request.query.delegateId || 10, 10);

  try {
    const totals = yield delegate.getLogsCount(delegateId);
    const logs = yield delegate.getLogs(current, pageSize, delegateId);

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
function* invalidDelegate() {
  const tenantId = this.request.query.tenantId;
  const loginId = this.request.query.loginId;
  const username = this.request.query.username;
  const delegateId = this.request.query.delegateId;
  const reason = this.request.query.reason;
  const del_no = this.request.query.del_no;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    yield delegate.invalidDelegate(tenantId, loginId, username, delegateId, reason, trans);
    yield delegate.writeLog(delegateId, loginId, username, `作废业务单:${del_no}`, trans);
    yield mysql.commit(trans);
    Result.OK(this);
  } catch (e) {
    console.log('invalid', e && e.stack);
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}


