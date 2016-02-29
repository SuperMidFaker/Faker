import cobody from 'co-body';
import kJwt from 'koa-jwt';
import fs from 'fs';
import path from 'path';
import Result from '../../reusable/node-util/response-result';
import mysql from '../../reusable/db-util/mysql';
import userDao from '../models/user.db';
import tenantDao from '../models/tenant.db';
import tenantUserDao from '../models/tenant-user.db';
import smsDao from '../models/sms.db';
import bCryptUtil from '../../reusable/node-util/BCryptUtil';
import config from '../../reusable/node-util/server.config';
import { isMobile, getSmsCode } from '../../reusable/common/validater';
import smsUtil from '../../reusable/node-util/sms-util';
import { __DEFAULT_PASSWORD__, TENANT_LEVEL, TENANT_ROLE, ACCOUNT_STATUS, ADMIN, ENTERPRISE, BRANCH, PERSONNEL, SMS_TYPE } from '../../universal/constants';

export default [
   ['post', '/public/v1/login', loginUserP],
   ['post', '/public/v1/sms/code', requestSmsCodeP],
   ['post', '/public/v1/sms/verify', verifySmsCodeP],
   ['get', '/public/v1/subdomain/corp', getCorpBySubdomain],
   ['get', '/v1/user/account', getUserAccount],
   ['get', '/v1/user/corp', getCorpInfo],
   ['put', '/v1/user/corp', editCorp],
   ['post', '/v1/user/corp', submitCorp],
   ['delete', '/v1/user/corp', delCorp],
   ['get', '/v1/user/organizations', getOrganizations],
   ['get', '/v1/user/organization', getOrganization],
   ['put', '/v1/user/organization', editOrganization],
   ['post', '/v1/user/corp/app', switchTenantApp],
   ['get', '/v1/user/:tid/tenants', getTenantsUnderMain],
   ['get', '/v1/user/personnels', getCorpPersonnels],
   ['get', '/v1/user/personnel', getPersonnelInfo],
   ['post', '/v1/user/personnel', submitPersonnel],
   ['put', '/v1/user/personnel', editPersonnel],
   ['delete', '/v1/user/personnel', delPersonnel],
   ['put', '/v1/user/password', changePassword],
   ['get', '/v1/user/corp/check/subdomain', isSubdomainExist],
   ['get', '/v1/user/check/loginname', isLoginNameExist],
   ['put', '/v1/user/corp/status', switchCorpStatus],
   ['put', '/v1/user/personnel/status', switchPersonnelStatus],
   ['get', '/v1/admin/notexist', getUserAccount]
];

const privateKey = fs.readFileSync(path.resolve(__dirname, '..', '..', 'reusable', 'keys', 'qm.rsa'));
function *loginUserP() {
  const body = yield cobody(this);
  const username = body.username;
  const password = body.password;
  if (!username || !password) {
    return Result.ParamError(this, '用户名或密码有误');
  }
  try {
    const users = yield userDao.getUserByAccount(username, body.code);
    if (users.length > 0) {
      const user = users[0];
      const checkpwd = bCryptUtil.checkpw(password, user.password) || bCryptUtil.checkpw(bCryptUtil.md5(password), user.password);
      if (checkpwd) {
        const userTypes = yield tenantUserDao.getUserTypeInfo(user.id);
        let userType = user.user_type;
        if (userTypes.length === 1) {
          const personnel = userTypes[0];
          if (personnel.role !== TENANT_ROLE.member.name) {
            if (personnel.parentId === 0) {
              userType = ENTERPRISE;
            } else {
              userType = BRANCH;
            }
          } else {
           userType = PERSONNEL;
          }
        }
        const claims = { userId: user.id, userType };
        const opts = Object.assign({}, config.get('jwt_crypt'), { expiresIn: config.get('jwt_expire_seconds')});
        // todo we should set a shorter interval for token expire, refresh it later
        const jwtoken = kJwt.sign(claims, privateKey, opts);
        const remember = body.remember;
        const ONE_DAY = 24 * 60 * 60;
        this.cookies.set(config.get('jwt_cookie_key'), jwtoken, {
          httpOnly : __DEV__ ? false : true,
          expires: remember ? new Date(Date.now() + config.get('jwt_expire_seconds') * 1000) : new Date(Date.now() + ONE_DAY * 1000),
          domain: !__PROD__ ? undefined : config.get('jwt_cookie_domain')
        });
        return Result.OK(this, { token: jwtoken, userType: user.user_type, unid: user.unid });
      } else {
        return Result.ParamError(this, '用户名或密码有误');
      }
    } else {
      Result.NotFound(this, `用户ID: ${username}不存在`);
    }
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, '登录异常');
  }
}

function *requestSmsCodeP() {
  const body = yield cobody(this);
  if (!body.phone || !isMobile(body.phone)) {
    return Result.ParamError(this, '手机号码错误');
  }
  try {
    const phone = body.phone;
    const users = yield userDao.getUserByPhone(phone);
    if (users.length === 0) {
      return Result.NotFound(this, `手机号不存在,请先添加`);
    }
    const userId = users[0].id;
    const smsCode = getSmsCode(6);
    const msg = yield smsUtil.sendSms(phone, smsCode);
    console.log('sendsms result msg', msg);
    const result = yield smsDao.insertSms(phone, smsCode, SMS_TYPE.WEB_LOGIN_PWD_FORGET);
    return Result.OK(this, { smsId: result.insertId, userId });
  } catch (e) {
    console.log(e.stack);
    return Result.InternalServerError(this, '请求验证码异常');
  }
}

function *verifySmsCodeP() {
  const body = yield cobody(this);
  const smsId = body.smsId;
  const userId = body.userId;
  const newPwd = body.newPwd;
  const smsCode = body.smsCode;
  try {
    const smsItems = yield smsDao.getSmsById(smsId);
    if (smsItems.length === 0 || smsItems[0].code !== smsCode) {
      return Result.ParamError(this, '验证码错误');
    } else {
      const salt = bCryptUtil.gensalt();
      const pwdHash = bCryptUtil.hashpw(bCryptUtil.md5(newPwd), salt);
      yield userDao.updatePassword(salt, pwdHash, userId);
      return Result.OK(this);
    }
  } catch (e) {
    return Result.InternalServerError(this, '验证输入码异常');
  }
}

function *getUserAccount() {
  const userType = this.state.user.userType;
  if (userType === ADMIN) {
    return Result.OK(this, {username: 'root'});
  }
  const curUserId = this.state.user.userId;
  try {
    const accounts = yield tenantUserDao.getAccountInfo(curUserId);
    let account;
    if (accounts.length > 0) {
      account = accounts[0];
    } else {
      throw new Error('current user account do not exist');
    }
    Result.OK(this, {...account, type: userType});
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}

function *getOrganizations() {
  const parentTenantId = this.request.query.tenantId;
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const current = parseInt(this.request.query.currentPage, 10);
  try {
    console.time('organ count');
    const counts = yield tenantDao.getOrganCountByParent(parentTenantId);
    console.timeEnd('organ count');
    console.time('organs');
    const corps = yield tenantDao.getPagedOrgansByParent(parentTenantId, current, pageSize);
    console.timeEnd('organs');
    console.time('appPackage');
    const tenantAppPackage = yield tenantDao.getAppsInfoById(parentTenantId);
    console.timeEnd('appPackage');
    console.time('apps');
    for (let idx = 0; idx < corps.length; ++idx) {
      corps[idx].apps = yield tenantDao.getAppsInfoById(corps[idx].key);
    }
    console.timeEnd('apps');
    const data = {
      tenantAppPackage,
      totalCount: counts[0].num,
      pageSize,
      current,
      data: corps
    };
    Result.OK(this, data);
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}

function *getCorpInfo() {
  let accountId = this.state.user.userId;
  let userType = this.state.user.userType;
  const tenantId = this.request.query.corpId;
  try {
    const tenants = yield tenantDao.getCorpAndOwnerInfo(tenantId);
    if (tenants.length === 0) {
      throw new Error('企业租户不存在');
    }
    const tenant = tenants[0];
    Result.OK(this, tenant);
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}

function *submitCorp() {
  const body = yield cobody(this);
  const corp = body.corp;
  const parentTenant = body.tenant;
  const parentTenantId = parentTenant.tenantId;
  corp.code = parentTenant.code;
  // parentTenantId为0表示platform创建enterprise
  corp.level = parentTenantId === 0 ? TENANT_LEVEL.ENTERPRISE : TENANT_LEVEL.STANDARD;
  corp.category_id = corp.category_id || parentTenant.category_id;
  corp.aspect = corp.aspect || parentTenant.aspect;
  const salt = bCryptUtil.gensalt();
  const pwdHash = bCryptUtil.hashpw(__DEFAULT_PASSWORD__, salt);
  const unid = bCryptUtil.hashMd5(corp.phone + salt + Date.now());
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    let result = yield tenantDao.insertCorp(corp, parentTenantId, trans);
    corp.key = result.insertId;
    result = yield userDao.insertAccount(`${corp.loginName}@${corp.code}`, corp.email, corp.phone, salt, pwdHash,
                                         unid, trans);
    corp.loginId = result.insertId;
    corp.status = ACCOUNT_STATUS.normal.name;
    corp.apps = [];
    yield tenantUserDao.insertTenantOwner(corp.contact, corp.loginId, corp.key, parentTenantId,
                                          this.state.user.userId, trans);
    yield tenantDao.updateBranchCount(parentTenantId, 1, trans);
    yield tenantDao.updateUserCount(corp.key, 1, trans);
    yield tenantDao.updateUserCount(parentTenantId, 1, trans);
    yield mysql.commit(trans);
    Result.OK(this, corp);
  } catch (e) {
    console.log('submitCorp', e && e.stack);
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}

function *editCorp() {
  const body = yield cobody(this);
  const corp = body.corp;
  let trans;
  try {
    const loginIds = yield tenantUserDao.getOwnerLoginId(corp.key);
    if (loginIds.length === 0) {
      throw new Error('current corp owner do not exist');
    }
    trans = yield mysql.beginTransaction();
    yield userDao.updateLoginName(loginIds[0].id, corp.phone, corp.loginName, corp.email, trans);
    yield tenantUserDao.updateOwnerInfo(loginIds[0].id, corp.contact, corp.position, trans);
    yield tenantDao.updateCorp(corp, trans);
    yield mysql.commit(trans);
    Result.OK(this);
  } catch (e) {
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}

function *getOrganization() {
  const corpId = this.request.query.corpId;
  try {
    const tenants = yield tenantDao.getPartialTenantInfo(corpId);
    if (tenants.length !== 1) {
      throw new Error('未找到该组织机构');
    }
    const users = yield tenantUserDao.getTenantUsers(corpId);
    return Result.OK(this, {
      tenant: tenants[0],
      users
    });
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}
function *editOrganization() {
  const body = yield cobody(this);
  const corp = body.corp;
  const prevOwnerId = corp.poid;
  const currOwnerId = corp.coid;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    yield tenantUserDao.updateUserType(prevOwnerId, TENANT_ROLE.member.name, trans);
    yield tenantUserDao.updateUserType(currOwnerId, TENANT_ROLE.owner.name, trans);
    const users = yield tenantUserDao.getPersonnelInfo(currOwnerId);
    if (users.length !== 1) {
      throw new Error('not found selected owner');
    }
    const currOwner = users[0];
    yield tenantDao.updateCorpOwnerInfo(corp.key, corp.name, currOwner.phone, currOwner.name,
                                        currOwner.email, trans);
    yield mysql.commit(trans);
    Result.OK(this, {
      name: corp.name,
      contact: currOwner.name,
      phone: currOwner.phone,
      email: currOwner.email
    });
  } catch (e) {
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}

function *delCorp() {
  const body = yield cobody(this);
  const corpId = body.corpId;
  let trans;
  try {
    const logins = yield tenantUserDao.getAttchedLoginIds(corpId);
    const lids = [];
    logins.forEach((login) => lids.push(login.id));
    trans = yield mysql.beginTransaction();
    if (lids.length > 0) {
      yield userDao.deleteAccounts(lids, trans);
    }
    yield tenantUserDao.deleteTenantUsers(corpId, trans);
    yield tenantDao.deleteTenant(corpId, trans);
    yield tenantDao.updateBranchCount(body.parentTenantId, -1, trans);
    console.log('decrease user count ', lids.length);
    yield tenantDao.updateUserCount(body.parentTenantId, -lids.length, trans);
    yield mysql.commit(trans);
    Result.OK(this);
  } catch (e) {
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}

function *getCorpPersonnels() {
  const tenantId = this.request.query.tenantId;
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const current = parseInt(this.request.query.currentPage, 10);
  const filters = this.request.query.filters ? JSON.parse(this.request.query.filters) : [];
  const sortField = this.request.query.sortField;
  const sortOrder = this.request.query.sortOrder;
  try {
    const counts = yield tenantUserDao.getTenantPersonnelCount(tenantId, filters);
    const totalCount = counts[0].num;
    const personnel = yield tenantUserDao.getPagedPersonnelInCorp(tenantId, current, pageSize,
                                                                  filters, sortField, sortOrder);
    // 换页,切换页数时从这里传到reducer里更新
    Result.OK(this, {
      totalCount,
      current,
      pageSize,
      data: personnel.map(pers => {
        pers.loginName = pers.loginName.split('@')[0]
        return pers;
      })
    });
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}

function *submitPersonnel() {
  const curUserId = this.state.user.userId;
  const body = yield cobody(this);
  const tenant = body.tenant;
  const code = body.code;
  const personnel = body.personnel;
  const salt = bCryptUtil.gensalt();
  const pwdHash = bCryptUtil.hashpw(personnel.password, salt);
  const unid = bCryptUtil.hashMd5(personnel.phone + salt + Date.now());
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    let result = yield userDao.insertAccount(`${personnel.loginName}@${code}`, personnel.email,
                                             personnel.phone, salt, pwdHash, unid, trans);
    const loginId = result.insertId;
    result = yield tenantUserDao.insertPersonnel(curUserId, loginId, personnel, tenant, trans);
    yield tenantDao.updateUserCount(tenant.id, 1, trans);
    yield tenantDao.updateUserCount(tenant.parentId, 1, trans);
    yield mysql.commit(trans);
    Result.OK(this, { pid: result.insertId, loginId, status: 0 });
  } catch (e) {
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}

function *editPersonnel() {
  const body = yield cobody(this);
  const personnel = body.personnel;
  const code = body.code;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    yield userDao.updateLoginName(personnel.loginId, personnel.phone,
      `${personnel.loginName}@${code}`, personnel.email, trans);
    if (personnel.role === TENANT_ROLE.owner.name) {
      yield tenantDao.updateCorpOwnerInfo(body.tenantId, null, personnel.phone, personnel.name,
                                          personnel.email, trans);
    }
    yield tenantUserDao.updatePersonnel(personnel, trans);
    yield mysql.commit(trans);
    Result.OK(this);
  } catch (e) {
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}

function *delPersonnel() {
  const body = yield cobody(this);
  const pid = body.pid;
  const loginId = body.loginId;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    yield userDao.deleteAccount(loginId);
    yield tenantUserDao.deletePersonnel(pid);
    yield tenantDao.updateUserCount(body.tenant.id, -1, trans);
    yield tenantDao.updateUserCount(body.tenant.parentId, -1, trans);
    yield mysql.commit(trans);
    Result.OK(this);
  } catch (e) {
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}

function *getTenantsUnderMain() {
  const tenantId = this.params.tid;
  try {
    const branches = yield tenantDao.getAttachedTenants(tenantId);
    Result.OK(this, branches);
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}
function *getPersonnelInfo() {
  const persId = this.request.query.pid;
  try {
    const personnels = yield tenantUserDao.getPersonnelInfo(persId);
    if (personnels.length === 0) {
      throw new Error('用户不存在');
    }
    personnels.forEach(pers => pers.loginName = pers.loginName.split('@')[0]);
    Result.OK(this, personnels[0]);
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}

function *changePassword() {
  const body = yield cobody(this);
  const curUserId = this.state.user.userId;
  const users = yield userDao.getUserById(curUserId);
  if (users.length > 0) {
    const user = users[0];
    const checkpwd = bCryptUtil.checkpw(body.oldPwd, user.password) || bCryptUtil.checkpw(bCryptUtil.md5(body.oldPwd), user.password);
    if (checkpwd) {
      const salt = bCryptUtil.gensalt();
      const pwdHash = bCryptUtil.hashpw(body.newPwd, salt);
      const result = yield userDao.updatePassword(salt, pwdHash, curUserId);
      Result.OK(this);
    } else {
      Result.ParamError(this, '旧密码有误');
    }
  } else {
    Result.InternalServerError(this, '用户异常');
  }
}

function *isSubdomainExist() {
  const subdomain = this.request.query.domain;
  const tenantId = this.request.query.tenantId;
  try {
    const cnts = yield tenantDao.getSubdomainCount(subdomain, tenantId);
    const unexist = (cnts.length === 0 || cnts[0].count === 0);
    Result.OK(this, { exist: !unexist });
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}

function *isLoginNameExist() {
  const loginName = this.request.query.loginName;
  const loginId = this.request.query.loginId;
  const tenantId = this.request.query.tenantId;
  try {
    const cnts = yield tenantUserDao.getLoginNameCount(loginName, loginId, tenantId);
    const unexist = (cnts.length === 0 || cnts[0].count === 0);
    Result.OK(this, { exist: !unexist });
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}

function *switchCorpStatus() {
  const body = yield cobody(this);
  try {
    yield tenantDao.updateStatus(body.tenantId, body.status);
    Result.OK(this);
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}

function *switchPersonnelStatus() {
  const body = yield cobody(this);
  try {
    yield tenantUserDao.updateStatus(body.pid, body.status);
    Result.OK(this);
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}

function *getCorpBySubdomain() {
  const subdomain = this.request.query.subdomain;
  console.log('getCorpBySubdomain', subdomain);
  try {
   const result = yield tenantDao.getTenantByDomain(subdomain);
   if (result.length === 0) {
     throw new Error('当前子域未对应任何租户');
   }
   Result.OK(this, result[0]);
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}

function *switchTenantApp() {
  const body = yield cobody(this);
  try {
    yield tenantDao.changeOverTenantApp(body.tenantId, body.checked, body.app);
    Result.OK(this);
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}
