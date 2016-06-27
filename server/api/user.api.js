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
import { messages } from '../models/messages.db';
import { sendMessage }from '../socket.io';

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
   ['get', '/v1/user/corp/check/subdomain', isSubdomainExist],
   ['get', '/v1/user/check/loginname', isLoginNameExist],
   ['put', '/v1/user/corp/status', switchCorpStatus],
   ['put', '/v1/user/personnel/status', switchPersonnelStatus],
   ['put', '/v1/user/password', changePassword],
   ['put', '/v1/user/profile', updateUserProfile],
   ['get', '/v1/admin/notexist', getUserAccount],
   ['get', '/v1/user/account/messages', getMessages],
   ['post', '/v1/user/account/message/status', updateMessageStatus],
   ['put', '/v1/user/account/message', sendPromptMessage]
];

function *loginUserP() {
  const body = yield cobody(this);
  const username = body.username;
  const password = body.password;
  if (!username || !password) {
    return Result.paramError(this, { key: 'loginEmptyParam' });
  }
  try {
    const users = yield userDao.getUserByAccount(username, body.code);
    if (users.length > 0) {
      const user = users[0];
      const checkpwd = bCryptUtil.checkpw(password, user.password) ||
        bCryptUtil.checkpw(bCryptUtil.md5(password), user.password);
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
        genJwtCookie(this.cookies, user.id, userType, body.remember);
        return Result.ok(this, { userType: user.user_type, unid: user.unid });
      } else {
        return Result.paramError(this, { key: 'loginErrorParam' });
      }
    } else {
      return Result.notFound(this, { key: 'loginUserNotFound', values: { username }});
    }
  } catch (e) {
    console.log(e);
    return Result.internalServerError(this, { key: 'loginExceptionError' });
  }
}

function *requestSmsCodeP() {
  const body = yield cobody(this);
  if (!body.phone || !isMobile(body.phone)) {
    return Result.paramError(this, { key: 'invalidPhone' });
  }
  try {
    const phone = body.phone;
    const users = yield userDao.getUserByPhone(phone);
    if (users.length === 0) {
      return Result.notFound(this, { key: 'phoneNotfound' });
    }
    const userId = users[0].id;
    const smsCode = getSmsCode(6);
    const msg = yield smsUtil.sendSms(phone, smsCode);
    console.log('sendsms result msg', msg);
    const result = yield smsDao.insertSms(phone, smsCode, SMS_TYPE.WEB_LOGIN_PWD_FORGET);
    return Result.ok(this, { smsId: result.insertId, userId });
  } catch (e) {
    console.log(e.stack);
    return Result.internalServerError(this, { key: 'requestCodeException' });
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
      return Result.paramError(this, { key: 'invalidSmsCode' });
    } else {
      const salt = bCryptUtil.gensalt();
      const pwdHash = bCryptUtil.hashpw(bCryptUtil.md5(newPwd), salt);
      yield userDao.updatePassword(salt, pwdHash, userId);
      return Result.ok(this);
    }
  } catch (e) {
    return Result.internalServerError(this, { key: 'smsCodeVerifyException' });
  }
}

function *getUserAccount() {
  const userType = this.state.user.userType;
  if (userType === ADMIN) {
    return Result.ok(this, { username: 'root', level: TENANT_LEVEL.PLATFORM });
  }
  const curUserId = this.state.user.userId;
  try {
    const [ accounts, profiles ] = yield [
      tenantUserDao.getAccountInfo(curUserId),
      tenantUserDao.getProfile(curUserId)
    ];
    if (accounts.length === 1 && profiles.length === 1) {
      profiles[0].username = profiles[0].username.split('@')[0];
    } else {
      throw new Error('current user account do not exist');
    }
    Result.ok(this, { ...accounts[0], type: userType, profile: profiles[0] });
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

function *getOrganizations() {
  const parentTenantId = this.request.query.tenantId;
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const current = parseInt(this.request.query.currentPage, 10);
  try {
    console.time('organ count');
    const [ counts, corps, tenantAppPackage ] = yield [
      tenantDao.getOrganCountByParent(parentTenantId),
      tenantDao.getPagedOrgansByParent(parentTenantId, current, pageSize),
      tenantDao.getAppsInfoById(parentTenantId)
    ];
    console.timeEnd('organ count');
    console.time('apps');
    const appsYielders = corps.map(corp => tenantDao.getAppsInfoById(corp.key));
    const corpsApps = yield appsYielders;
    for (let idx = 0; idx < corps.length; ++idx) {
      corps[idx].apps = corpsApps[idx];
    }
    console.timeEnd('apps');
    const data = {
      tenantAppPackage,
      totalCount: counts[0].num,
      pageSize,
      current,
      data: corps
    };
    Result.ok(this, data);
  } catch (e) {
    Result.internalServerError(this, e.message);
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
    Result.ok(this, tenant);
  } catch (e) {
    Result.internalServerError(this, e.message);
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
  corp.subdomain = parentTenant.subdomain;
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
    yield tenantUserDao.insertPersonnel(
      this.state.user.userId, corp.loginId,
      { name: corp.contact, role: TENANT_ROLE.owner.name },
      { id: corp.key, parentId: parentTenantId }, trans
    );
    yield tenantDao.updateBranchCount(parentTenantId, 1, trans);
    yield tenantDao.updateUserCount(corp.key, 1, trans);
    yield tenantDao.updateUserCount(parentTenantId, 1, trans);
    yield mysql.commit(trans);
    Result.ok(this, corp);
  } catch (e) {
    console.log('submitCorp', e && e.stack);
    yield mysql.rollback(trans);
    Result.internalServerError(this, e.message);
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
    Result.ok(this);
  } catch (e) {
    yield mysql.rollback(trans);
    Result.internalServerError(this, e.message);
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
    return Result.ok(this, {
      tenant: tenants[0],
      users
    });
  } catch (e) {
    Result.internalServerError(this, e.message);
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
    const [ users, _, __ ] = yield [
      tenantUserDao.getPersonnelInfo(currOwnerId),
      tenantUserDao.updateUserType(prevOwnerId, TENANT_ROLE.member.name, trans),
      tenantUserDao.updateUserType(currOwnerId, TENANT_ROLE.owner.name, trans)
    ];
    if (users.length !== 1) {
      throw new Error('not found selected owner');
    }
    const currOwner = users[0];
    yield tenantDao.updateOrganizationInfo(
      corp.key, corp.name, corp.subCode, currOwner.phone,
      currOwner.name, currOwner.email, trans
    );
    yield mysql.commit(trans);
    Result.ok(this, {
      name: corp.name,
      subCode: corp.subCode,
      contact: currOwner.name,
      phone: currOwner.phone,
      email: currOwner.email
    });
  } catch (e) {
    yield mysql.rollback(trans);
    Result.internalServerError(this, e.message);
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
    Result.ok(this);
  } catch (e) {
    yield mysql.rollback(trans);
    Result.internalServerError(this, e.message);
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
    const [ counts, personnel ] = yield [
      tenantUserDao.getTenantPersonnelCount(tenantId, filters),
      tenantUserDao.getPagedPersonnelInCorp(
        tenantId, current, pageSize, filters, sortField, sortOrder
      )
    ];
    // 换页,切换页数时从这里传到reducer里更新
    Result.ok(this, {
      totalCount: counts[0].num,
      current,
      pageSize,
      data: personnel.map(pers => {
        pers.loginName = pers.loginName.split('@')[0]
        return pers;
      })
    });
  } catch (e) {
    Result.internalServerError(this, e.message);
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
    Result.ok(this, { pid: result.insertId, loginId, status: 0 });
  } catch (e) {
    yield mysql.rollback(trans);
    Result.internalServerError(this, e.message);
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
      yield tenantDao.updateCorpOwnerInfo(body.tenantId, personnel.phone, personnel.name,
                                          personnel.email, trans);
    }
    yield tenantUserDao.updatePersonnel(personnel, trans);
    yield mysql.commit(trans);
    Result.ok(this);
  } catch (e) {
    yield mysql.rollback(trans);
    Result.internalServerError(this, e.message);
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
    Result.ok(this);
  } catch (e) {
    yield mysql.rollback(trans);
    Result.internalServerError(this, e.message);
  }
}

function *getTenantsUnderMain() {
  const tenantId = this.params.tid;
  try {
    const branches = yield tenantDao.getAttachedTenants(tenantId);
    Result.ok(this, branches);
  } catch (e) {
    Result.internalServerError(this, e.message);
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
    Result.ok(this, personnels[0]);
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

function *changePassword() {
  const curUserId = this.state.user.userId;
  try {
    const [ body, users ] = yield [
      cobody(this),
      userDao.getUserById(curUserId)
    ];
    if (users.length > 0) {
      const user = users[0];
      const checkpwd = bCryptUtil.checkpw(body.oldPwd, user.password) || bCryptUtil.checkpw(bCryptUtil.md5(body.oldPwd), user.password);
      if (checkpwd) {
        const salt = bCryptUtil.gensalt();
        const pwdHash = bCryptUtil.hashpw(body.newPwd, salt);
        const result = yield userDao.updatePassword(salt, pwdHash, curUserId);
        Result.ok(this);
      } else {
        Result.paramError(this, { key: 'incorretOldPwd' });
      }
    } else {
      Result.internalServerError(this, { key: 'invalidUser' });
    }
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

function *isSubdomainExist() {
  const subdomain = this.request.query.domain;
  const tenantId = this.request.query.tenantId;
  try {
    const cnts = yield tenantDao.getSubdomainCount(subdomain, tenantId);
    const unexist = (cnts.length === 0 || cnts[0].count === 0);
    Result.ok(this, { exist: !unexist });
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

function *isLoginNameExist() {
  const loginName = this.request.query.loginName;
  const loginId = this.request.query.loginId;
  const tenantId = this.request.query.tenantId;
  try {
    const cnts = yield tenantUserDao.getLoginNameCount(loginName, loginId, tenantId);
    const unexist = (cnts.length === 0 || cnts[0].count === 0);
    Result.ok(this, { exist: !unexist });
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

function *switchCorpStatus() {
  const body = yield cobody(this);
  try {
    yield tenantDao.updateStatus(body.tenantId, body.status);
    Result.ok(this);
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

function *switchPersonnelStatus() {
  const body = yield cobody(this);
  try {
    yield tenantUserDao.updateStatus(body.pid, body.status);
    Result.ok(this);
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

function *getCorpBySubdomain() {
  const subdomain = this.request.query.subdomain;
  try {
   const result = yield tenantDao.getTenantByDomain(subdomain);
   if (result.length === 0) {
     throw ({ key: 'subdomainNotFound' });
   }
   Result.ok(this, result[0]);
  } catch (e) {
    Result.internalServerError(this, e.message || e);
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

function *getMessages() {
  try {
    const query = this.request.query;
    const status = parseInt(query.status, 10);;
    const loginId = parseInt(query.loginId, 10);;

    let pageSize = parseInt(query.pageSize, 10);
    let currentPage = parseInt(query.currentPage, 10);
    const result = yield messages.findAll({
      raw: true,
      where:{
        login_id: loginId,
        status: status
      },
      offset: (currentPage-1) * pageSize,
      limit: pageSize,
      order: [
        ['time', 'DESC']
      ]
    });
    const totalCount = yield messages.count({
      where:{
        login_id: loginId,
        status: status
      }
    });
    Result.ok(this, {data: result, pageSize, currentPage: currentPage, totalCount, status});
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

function *updateMessageStatus() {
  try {
    const body = yield cobody(this);
    const {loginId, status} = body;
    let result;
    if (status === 1) {
      result = yield messages.update({
          status: 1
        },
        {where:{
          status: 0,
          login_id: loginId
        } 
      });
    }
    else if (status === 2) {
      result = yield messages.update({
          status: 2
        },
        {where:{
          status: 1,
          login_id: loginId
        } 
      });
    }
    Result.ok(this,result);
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

function *sendPromptMessage() {
  try {
    const body = yield cobody(this);
    const {from, to, msg} = body;
    sendPromptMessage(from,to,msg);
    Result.ok(this);
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}