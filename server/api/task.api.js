import cobody from 'co-body';
import kJwt from 'koa-jwt';
import fs from 'fs';
import path from 'path';
import Result from '../../reusable/node-util/response-result';
import mysql from '../../reusable/db-util/mysql';
import corpDao from '../models/corp.db';
import taskDao from '../models/task.db';
import smsDao from '../models/sms.db';
import bCryptUtil from '../../reusable/node-util/BCryptUtil';
import config from '../../reusable/node-util/server.config';
import { isMobile, getSmsCode } from '../../reusable/common/validater';
import smsUtil from '../../reusable/node-util/sms-util';
import tenantDao from '../models/tenant.db';
import tenantUserDao from '../models/tenant-user.db';
import { __DEFAULT_PASSWORD__, TENANT_LEVEL, TENANT_ROLE, ACCOUNT_STATUS, ADMIN, ENTERPRISE, BRANCH, PERSONNEL, SMS_TYPE } from '../../universal/constants';

export default [
   ['get', '/v1/user/tasks', getCorpTgs],
   ['get', '/v1/user/task', gettgInfo],
   ['post', '/v1/user/task', submittg],
   ['put', '/v1/user/task', edittg],
   ['delete', '/v1/user/task', deltg],
   ['get', '/v1/user/state', getstatus]
];

function *getCorpTgs() {
  const current = parseInt(this.request.query.currentPage || 1, 10);
  const pageSize = parseInt(this.request.query.pageSize || 10, 10);
  const parentTenantId = this.request.query.tenantId;
  const currentStatus = parseInt(this.request.query.currentStatus || -1, 10)//木有状态则默认查询未发送的数据;
  const loginId = parseInt(this.request.query.loginId || -1, 10)//木有状态则默认查询未发送的数据;
  const filters = this.request.query.filters ? JSON.parse(this.request.query.filters) : [];
  
  const sortField = this.request.query.sortField;
  const sortOrder = this.request.query.sortOrder;
  
  try {
      
       console.log(currentStatus);
      console.log(loginId);
    const totals = yield taskDao.getTaskTotalCount(parentTenantId,currentStatus,loginId,filters);
    const whs = yield taskDao.getPagedTaskByCorp(current,currentStatus,loginId,filters, pageSize,parentTenantId,sortField,sortOrder);
    //const child1 = yield taskDao.getPagedTaskByCorp1(current, pageSize, parentTenantId);
     //const child2 = yield taskDao.getPagedTaskByCorp2(current, pageSize, parentTenantId);
     //child1.push({children:child2});
     //whs.push({children:child1});
    return Result.OK(this, {
      totalCount: totals.length > 0 ? totals[0].count : 0,
      pageSize,
      current,
      data: whs
    });
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, e.message);
  }
}

function *getstatus() {
  console.log(this.request.query.loginId);
  const tenantId = parseInt(this.request.query.tenantId || 0, 10);
  const loginId = parseInt(this.request.query.loginId || -1, 10);
  const filters = this.request.query.filters ? JSON.parse(this.request.query.filters) : [];
  
  try {
    const notSendCount = yield taskDao.getStatusCount(tenantId, 0, filters);
    const toMeCount = yield taskDao.getToMeCount(tenantId, loginId, filters);
    const notAcceptCount = yield taskDao.getStatusCount(tenantId, 1, filters);
    const acceptCount = yield taskDao.getStatusCount(tenantId, 2, filters);
    const invalidCount= yield taskDao.getStatusCount(tenantId, 4, filters);
    
    return Result.OK(this, {
      toMeCount:toMeCount.length > 0 ? toMeCount[0].count : 0,
      notSendCount:notSendCount.length > 0 ? notSendCount[0].count : 0,
      notAcceptCount:notAcceptCount.length > 0 ? notAcceptCount[0].count : 0,
      acceptCount:acceptCount.length > 0 ? acceptCount[0].count : 0,
      invalidCount:invalidCount.length > 0 ? invalidCount[0].count: 0
    });
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, e.message);
  }
}

function *gettgInfo() {
  const persId = this.request.query.pid;
  try {
    const tgs = yield tenantUserDao.gettgInfo(persId);
    if (tgs.length === 0) {
      throw new Error('用户不存在');
    }
    Result.OK(this, tgs[0]);
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}

function *submittg() {
  const curUserId = this.state.user.userId;
  const body = yield cobody(this);
  const tenant = body.tenant;
  const tg = body.tg;
  const salt = bCryptUtil.gensalt();
  const pwdHash = bCryptUtil.hashpw(tg.password, salt);
  const unid = bCryptUtil.hashMd5(tg.phone + salt + Date.now());
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    const accountType = tg.role === TENANT_ROLE.manager.name ? (
      tenant.parentId === 0 ? ENTERPRISE : BRANCH) : tg;
    let result = yield userDao.insertAccount(tg.loginName, tg.email,
                                             tg.phone, salt, pwdHash, accountType, unid, trans);
    const loginId = result.insertId;
    result = yield tenantUserDao.inserttg(curUserId, loginId, tg, tenant, trans);
    yield tenantDao.updateUserCount(tenant.id, 1, trans);
    yield tenantDao.updateUserCount(tenant.parentId, 1, trans);
    yield mysql.commit(trans);
    Result.OK(this, { pid: result.insertId, loginId, status: 0 });
  } catch (e) {
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}

function *edittg() {
  const body = yield cobody(this);
  const tg = body.tg;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    yield userDao.updateLoginName(tg.loginId, tg.phone, tg.loginName,
                                  tg.email, trans);
    if (tg.role === TENANT_ROLE.owner.name) {
      yield tenantDao.updateCorpOwnerInfo(body.tenantId, null, tg.phone, tg.name,
                                          tg.email, trans);
    }
    yield tenantUserDao.updatetg(tg, trans);
    yield mysql.commit(trans);
    Result.OK(this);
  } catch (e) {
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}

function *deltg() {
  const body = yield cobody(this);
  const pid = body.pid;
  const loginId = body.loginId;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    yield userDao.deleteAccount(loginId);
    yield tenantUserDao.deletetg(pid);
    yield tenantDao.updateUserCount(body.tenant.id, -1, trans);
    yield tenantDao.updateUserCount(body.tenant.parentId, -1, trans);
    yield mysql.commit(trans);
    Result.OK(this);
  } catch (e) {
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}

function *switchtgStatus() {
  const body = yield cobody(this);
  try {
    yield tenantUserDao.updateStatus(body.pid, body.status);
    Result.OK(this);
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}