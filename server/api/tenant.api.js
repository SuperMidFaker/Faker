import cobody from 'co-body';
import Result from '../util/responseResult';
import mysql from '../util/mysql';
import userDao from '../models/user.db';
import tenantDao from '../models/tenant.db';
import tenantUserDao from '../models/tenant-user.db';
import smsDao from '../models/sms.db';
import bCryptUtil from '../util/BCryptUtil';
import { isMobile, getSmsCode } from '../../common/validater';
import smsUtil from '../util/sms-util';
import {
  TENANT_LEVEL, TENANT_ROLE,
  ACCOUNT_STATUS, ENTERPRISE, BRANCH, PERSONNEL
} from 'common/constants';
import {__DEFAULT_PASSWORD__, SMS_TYPE, ADMIN } from '../util/constants';
import { genJwtCookie } from '../util/jwt-kit';

export default [
   ['put', '/v1/user/corp/status', switchCorpStatus],
   ['get', '/v1/user/corp/tenants', getTenants],
   ['get', '/v1/user/corp/tenant/:tid', getTenant],
   ['get', '/v1/user/corp/tenant/getTenantAppList', getTenantAppList],
   ['put', '/v1/user/corp/tenant/upsert',upsertTenant],
   ['delete', '/v1/user/corp/tenant/delete',deleteTenantByTenantId]
];

function *switchCorpStatus() {
  const body = yield cobody(this);
  try {
    yield tenantDao.updateStatus(body.tenantId, body.status);
    Result.ok(this);
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

function *switchTenantApp() {
  const body = yield cobody(this);
  try {
    yield tenantDao.changeOverTenantApp(body.tenantId, body.checked, body.app);
    Result.ok(this);
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

function *updateUserProfile() {
  let trans;
  try {
    const body = yield cobody(this);
    const profile = body.profile;
    trans = yield mysql.beginTransaction();
    const yielders = [
      userDao.updateUserProfile(
        profile.loginId, profile.phone, profile.avatar,
        `${profile.username}@${body.code}`, profile.email, trans
      ),
      tenantUserDao.updatePersonnelName(
        profile.loginId, profile.name, trans
      )
    ];
    if (profile.role === TENANT_ROLE.owner.name) {
      yielders.push(tenantDao.updateCorpOwnerInfo(
        body.tenantId, profile.phone, profile.name,
        profile.email, trans
      ));
    }
    yield yielders;
    yield mysql.commit(trans);
    Result.ok(this);
  } catch (e) {
    yield mysql.rollback(trans);
    Result.internalServerError(this, e.message);
  }
}

function *getTenantAppList() {
  let result = yield tenantDao.getTenantApps();
  Result.ok(this,result);
}
function *getTenants(){
  const parent_tenant_id = this.request.query.tenantId;
  const pageSize = this.request.query.pageSize;
  const currentPage = this.request.query.currentPage;
  try {
    const tenants = yield tenantDao.getTenants(parent_tenant_id, currentPage, pageSize);
    Result.ok(this,tenants);
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

function *getTenant(){
  const tid = this.params.tid;
  try {
    let tenant = yield tenantDao.getTenant(tid);
    let tenantAppValueList = yield tenantDao.getTenantAppListByTenantId(tid);
    tenant[0].tenantAppValueList = tenantAppValueList;
    Result.ok(this,tenant);
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

function *upsertTenant(){
  const body = yield cobody(this);
  const apps = yield tenantDao.getTenantApps();
  try {
    const { code, name, aspect, phone, subdomain, logo, contact, email, tenantAppList } = body;
    if(body.tenant_id == undefined) {
      const result = yield tenantDao.insertTenant(code, name, aspect, phone, subdomain, logo, contact, email);
      const tenant_id = result.insertId;
      if(tenantAppList != undefined) {
        yield tenantDao.insertTenantApps(tenant_id, tenantAppList, apps);
      }
      const salt = bCryptUtil.gensalt();
      const pwdHash = bCryptUtil.hashpw(__DEFAULT_PASSWORD__, salt);
      const unid = bCryptUtil.hashMd5(phone + salt + Date.now());
      const result1 = yield tenantDao.insertTenantLogin(code, email, phone, salt, pwdHash, unid);
      const login_id = result1.insertId;
      const result2 = yield tenantDao.insertTenantUser(tenant_id, login_id);
      Result.ok(this);
    }
    else {
      yield tenantDao.updateTenantByTenantId(body.tenant_id, code, name, aspect, phone, subdomain, logo, contact, email);
      if(tenantAppList != undefined) {
        yield tenantDao.deleteTenantApps(body.tenant_id);
        yield tenantDao.insertTenantApps(body.tenant_id, tenantAppList, apps);
      }
      
    }
    Result.ok(this);
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

function *deleteTenantByTenantId(){
  const body = yield cobody(this);
  try {
    const result = yield tenantDao.deleteTenantByTenantId(body.tenantId,body.login_id);
    Result.ok(this);
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

