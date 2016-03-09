import cobody from 'co-body';
import Result from '../../reusable/node-util/response-result';
import mysql from '../../reusable/db-util/mysql';
import delegate from '../models/delegate.db';

export default [
   ['get', '/v1/delegate/delegate', getCorpdelegate],
   ['put', '/v1/delegate/status', switchdelegateStatus],
   ['get', '/v1/delegate/StatusG', importdelegateStatusG],
   ['delete', '/v1/delegate/delete', deldelegate],
   ['put', '/v1/delegate/edit', editdelegate],
   ['post', '/v1/delegate/submit', submitdelegate],
   ['get', '/v1/delegate/:tid/tenants', getTenantsUnderMain],
   ['get', '/v1/delegate/getSelectOptions', getSelectOptions],
   ['put', '/v1/delegate/UnsentUnsent', getUnsent]
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
  const pid = body.pid;
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
  const delegates = body.delegate;
  const key =delegates.key;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    yield delegate.updatedelegate(delegates.del_no, delegates.invoice_no,delegates.master_customs,delegates.declare_way_no,delegates.bill_no,delegates.usebook,delegates.trade_mode,delegates.urgent,delegates.other_note,key,trans);              
    yield mysql.commit(trans);
    Result.OK(this);
  } catch (e) {
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
  delegates.status = 0;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    const result =yield delegate.insertdelegate(delegates, trans);
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
  const customsInfoList = yield delegate.getCustomsInfo();
  const declareWayList = yield delegate.getDeclareWay();
  const tradeModeList = yield delegate.getTradeMode();
  return Result.OK(this, {
    customsInfoList: customsInfoList,
    declareWayList: declareWayList,
    tradeModeList: tradeModeList
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


