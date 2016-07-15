import cobody from 'co-body';
import Result from '../util/responseResult';
import mysql from '../util/mysql';
import tenantDao from '../models/tenant.db';
import Tenant from '../models/tenant.db';
import shipmentAuxDao, { TmsParamTransMode, TmsParamPackage } from '../models/shipment-auxil.db';
import bCryptUtil from '../util/BCryptUtil';
import { __DEFAULT_PASSWORD__ } from '../util/constants';

export default [
   ['get', '/v1/user/corp/tenants', getTenants],
   ['get', '/v1/user/corp/tenant/:tid', getTenant],
   ['get', '/v1/user/corp/tenant/getTenantAppList', getTenantAppList],
   ['put', '/v1/user/corp/tenant/upsert', upsertTenant],
   ['delete', '/v1/user/corp/tenant/delete', deleteTenantByTenantId],
];

function *switchTenantApp() {
  const body = yield cobody(this);
  try {
    yield tenantDao.changeOverTenantApp(body.tenantId, body.checked, body.app);
    Result.ok(this);
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

function *getTenantAppList() {
  let result = yield tenantDao.getTenantApps();
  Result.ok(this,result);
}

function *getTenants(){
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const currentPage = parseInt(this.request.query.currentPage, 10);
  try {
    const tenants = yield tenantDao.getTenants(currentPage-1, pageSize);
    const count = yield tenantDao.countTenants();
    Result.ok(this,{
      data: tenants,
      totalCount: count[0].totalCount,
      pageSize: pageSize,
      current: currentPage,
    });
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

function *upsertTenant() {
  const body = yield cobody(this);
  const apps = yield tenantDao.getTenantApps();
  try {
    const { code, name, aspect, phone, subdomain, logo, contact, email, tenantAppList } = body;
    if (body.tenant_id == undefined) {
      const result = yield tenantDao.insertTenant(code, name, aspect, phone, subdomain, logo, contact, email);
      const tenant_id = result.insertId;
      if (tenantAppList && tenantAppList.length > 0 && apps.length > 0) {
        yield tenantDao.insertTenantApps(tenant_id, tenantAppList, apps);
      }
      const salt = bCryptUtil.gensalt();
      const pwdHash = bCryptUtil.hashpw(__DEFAULT_PASSWORD__, salt);
      const unid = bCryptUtil.hashMd5(phone + salt + Date.now());
      const result1 = yield tenantDao.insertTenantLogin(code, email, phone, salt, pwdHash, unid);
      const login_id = result1.insertId;
      const result2 = yield tenantDao.insertTenantUser(tenant_id, login_id, contact);
      yield [
        shipmentAuxDao.presetTmsPackages(tenant_id),
        shipmentAuxDao.presetTmsModes(tenant_id),
      ];
    } else {
      yield tenantDao.updateTenantByTenantId(body.tenant_id, code, name, aspect, phone, subdomain, logo, contact, email);
      if(tenantAppList != undefined && tenantAppList.length !== 0) {
        yield tenantDao.deleteTenantApps(body.tenant_id);
        yield tenantDao.insertTenantApps(body.tenant_id, tenantAppList, apps);
      }
    }
    Result.ok(this);
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

function *deleteTenantByTenantId() {
  const body = yield cobody(this);
  try {
    const result = yield tenantDao.deleteTenantByTenantId(body.tenantId, body.login_id);
    yield [
      TmsParamTransMode.destroy({
        where: {
          tenant_id: body.tenantId,
        }
      }),
      TmsParamPackage.destroy({
        where: {
          tenant_id: body.tenantId,
        }
      }),
    ];
    Result.ok(this);
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}
