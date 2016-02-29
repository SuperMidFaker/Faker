import cobody from 'co-body';
import kJwt from 'koa-jwt';
import fs from 'fs';
import path from 'path';
import Result from '../../reusable/node-util/response-result';
import mysql from '../../reusable/db-util/mysql';
import corpDao from '../models/corp.db';
import userDao from '../models/user.db';
import tenantDao from '../models/tenant.db';
import delegate from '../models/delegate.db';
import smsDao from '../models/sms.db';
import config from '../../reusable/node-util/server.config';
import { isMobile, getSmsCode } from '../../reusable/common/validater';
import smsUtil from '../../reusable/node-util/sms-util';
import { __DEFAULT_PASSWORD__, TENANT_LEVEL, TENANT_ROLE, ACCOUNT_STATUS, ADMIN, ENTERPRISE, BRANCH, PERSONNEL, SMS_TYPE } from '../../universal/constants';

export default [
   ['get', '/v1/delegate/delegate', getCorpdelegate],
   ['put', '/v1/delegate/status', switchdelegateStatus],
   ['delete', '/v1/delegate/delete', deldelegate],
   ['put', '/v1/delegate/edit', editdelegate],
   ['post', '/v1/delegate/submit', submitdelegate],
   ['get', '/v1/delegate/:tid/tenants', getTenantsUnderMain],
   ['get', '/v1/delegate/Master_Customs', getMaster_CustomsMain],
   ['put', '/v1/delegate/UnsentUnsent', getUnsent]
];


function *getCorpdelegate() {
  const tenantId = this.request.query.tenantId;
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const current = parseInt(this.request.query.currentPage, 10);
  const filters = this.request.query.filters ? JSON.parse(this.request.query.filters) : [];
  const sortField = this.request.query.sortField;
  const sortOrder = this.request.query.sortOrder;
  try {
    const counts = yield delegate.getTenantdelegateCount(tenantId, filters);
    const totalCount = counts[0].num;
    const personnel = yield delegate.getPageddelegateInCorp(tenantId, current, pageSize,
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
  const tenantId=body.tenant.id;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    const result =yield delegate.insertdelegate(delegates,tenantId, trans);
    yield mysql.commit(trans);
    Result.OK(this, { smsId: result.insertId});
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
function *getMaster_CustomsMain() {
  try {
    const customs_code = yield delegate.getAttachedcustoms_code();
    Result.OK(this, customs_code); 
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}


