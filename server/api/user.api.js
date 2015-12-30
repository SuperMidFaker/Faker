import cobody from 'co-body';
import kJwt from 'koa-jwt';
import fs from 'fs';
import path from 'path';
import Result from '../../reusable/node-util/response-result';
import mysql from '../../reusable/db-util/mysql';
import corpDao from '../models/corp.db';
import userDao from '../models/user.db';
import tenantDao from '../models/tenant.db';
import smsDao from '../models/sms.db';
import bCryptUtil from '../../reusable/node-util/BCryptUtil';
import config from '../../reusable/node-util/server.config';
import { isMobile, getSmsCode } from '../../reusable/common/validater';
import smsUtil from '../../reusable/node-util/sms-util';
import { __DEFAULT_PASSWORD__, ADMIN, ENTERPRISE, BRANCH, PERSONNEL, SMS_TYPE } from '../../universal/constants';

export default [
   ['post', '/public/v1/login', loginUserP],
   ['post', '/public/v1/sms/code', requestSmsCodeP],
   ['post', '/public/v1/sms/verify', verifySmsCodeP],
   ['get', '/v1/user/account', getUserAccount],
   ['get', '/v1/account/corps', getCorps],
   ['get', '/v1/user/corp', getCorpInfo],
   ['post', '/v1/account/corp', submitCorp],
   ['put', '/v1/account/corp', editCorp],
   ['delete', '/v1/account/corp', delCorp],
   ['get', '/v1/account/personnels', getCorpPersonnels],
   ['get', '/v1/user/personnel', getPersonnelInfo],
   ['post', '/v1/account/personnel', submitPersonnel],
   ['put', '/v1/account/personnel', editPersonnel],
   ['delete', '/v1/account/personnel', delPersonnel],
   ['put', '/v1/user/password', changePassword],
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
    const users = yield userDao.getUserByAccount(username);
    if (users.length > 0) {
      const user = users[0];
      // todo add the subdomain corp-code condition
      const checkpwd = bCryptUtil.checkpw(password, user.password) || bCryptUtil.checkpw(bCryptUtil.md5(password), user.password);
      if (checkpwd) {
        const claims = { userId: user.account_id, userType: user.user_type };
        const opts = Object.assign({}, config.get('jwt_crypt'), { expiresInMinutes: config.get('jwt_expire_minutes')});
        // todo we should set a shorter interval for token expire, refresh it later
        const jwtoken = kJwt.sign(claims, privateKey, opts);
        const remember = body.remember;
        this.cookies.set(config.get('jwt_cookie_key'), jwtoken, {
          httpOnly : __DEV__ ? false : true,
          expires: remember ? new Date(Date.now() + config.get('jwt_expire_minutes') * 60000) : undefined,
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
    const userId = users[0].account_id;
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
  const curUserId = this.state.user.userId;
  try {
    const accounts = yield userDao.getAccountInfo(curUserId);
    let username;
    let corpId;
    let tenantId;
    if (accounts.length > 0) {
      username = accounts[0].name;
      corpId = accounts[0].corpId;
      tenantId = accounts[0].parentCorpId === 0 ? corpId : accounts[0].parentCorpId;
    } else if (accounts.length === 0 && userType === ADMIN) {
      username = ADMIN;
    } else {
      throw new Error('current user account isnot exist');
    }
    Result.OK(this, {username, corpId, type: userType, tenantId});
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}

function *getCorps() {
  const userType = this.state.user.userType;
  const userId = this.state.user.userId;
  const pageSize = parseInt(this.request.query.pageSize || 10, 10);
  const current = parseInt(this.request.query.currentPage || 1, 10);
  try {
    const counts = yield corpDao.getCorpCountByCreator(userId);
    const corps = yield corpDao.getPagedCorpsByCreator(userId, current, pageSize);
    const data = {
      totalCount: counts[0].num,
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
  try {
    let corps = [];
    let readonly = false;
    let isTenant = true;
    if (userType === PERSONNEL) {
      const corps = yield userDao.getPersonnelCorpInfo(accountId);
      if (corps.length > 0) {
        userType = corps[0].userType;
        accountId = corps[0].accountId;
      }
      readonly = true;
    }
    if (userType === ENTERPRISE) {
      corps = yield corpDao.getEnterpriseAccountCorp(accountId);
    } else if (userType === BRANCH) {
      corps = yield corpDao.getBranchAccountCorp(accountId);
      isTenant = false;
    }
    if (corps.length === 0) {
      throw new Error('no corp found for current user');
    }
    const thisCorp = corps[0];
    if (userType === BRANCH) {
      const parentCorps = yield corpDao.getCorpInfo(thisCorp.parentCorpId);
      thisCorp.status = parentCorps[0].status;
      thisCorp.che = parentCorps[0].che;
      thisCorp.tms = parentCorps[0].tms;
      thisCorp.app = parentCorps[0].app;
    }
    Result.OK(this,{
      corpInfo: {
        readonly,
        isTenant,
        thisCorp
      }
    });
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}

function *submitCorp() {
  const body = yield cobody(this);
  const salt = bCryptUtil.gensalt();
  const pwdHash = bCryptUtil.hashpw(__DEFAULT_PASSWORD__, salt);
  const unid = bCryptUtil.hashMd5(body.mobile + salt + Date.now());
  const corp = body.corp;
  const curUserId = this.state.user.userId;
  const userType = this.state.user.userType;
  let trans;
  try {
    const parentAccounts = yield userDao.getAccountInfo(curUserId);
    let parentCorpId = 0;
    let status = corp.status;
    if (parentAccounts.length > 0) {
      parentCorpId = parentAccounts[0].corpId;
      // 创建子帐号公司状态与主帐号一致
      status = parentAccounts[0].status;
    }
    trans = yield mysql.beginTransaction();
    let result = yield userDao.insertAccount(corp.mobile, salt, pwdHash,
                                             userType === ADMIN ? ENTERPRISE : BRANCH, unid, trans);
    const accountId = result.insertId;
    result = yield corpDao.insertCorp(corp, parentCorpId, curUserId, status, trans);
    const corpId = result.insertId;
    yield userDao.insertCorpAdmin(corp.name, accountId, corpId, parentCorpId, curUserId, trans);
    /*
    if (parentCorpId === 0) {
      yield tenantDao.insert(corpid, trans);
    } else {
      yield tenantDao.updateBranchCount(parentCorpId, trans);
    }
   */
    yield mysql.commit(trans);
    Result.OK(this, {corpId, status});
  } catch (e) {
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}

function *editCorp() {
  const body = yield cobody(this);
  const corp = body.corp;
  let trans;
  try {
    const caIds = yield userDao.getCorpAccountId(corp.key);
    if (caIds.length === 0) {
      throw new Error('current corp account donot exist');
    }
    trans = yield mysql.beginTransaction();
    yield userDao.updatePhone(caIds[0].accountId, corp.mobile, trans);
    yield corpDao.updateCorp(corp, trans);
    yield mysql.commit(trans);
    Result.OK(this);
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
    const usids = yield userDao.getCorpUserIds(corpId);
    const accids = [];
    usids.forEach((user) => accids.push(user.accountId));
    trans = yield mysql.beginTransaction();
    if (accids.length > 0) {
      yield userDao.deleteAccounts(accids, trans);
    }
    yield userDao.deleteCorpUsers(corpId, trans);
    yield corpDao.deleteCorp(corpId, trans);
    yield tenantDao.deleteTenant(corpId, trans);
    yield mysql.commit(trans);
    Result.OK(this);
  } catch (e) {
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}

function *submitPersonnel() {
  const curUserId = this.state.user.userId;
  const body = yield cobody(this);
  const salt = bCryptUtil.gensalt();
  const pwdHash = bCryptUtil.hashpw(__DEFAULT_PASSWORD__, salt);
  const personnel = body.personnel;
  const unid = bCryptUtil.hashMd5(personnel.phone + salt + Date.now());
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    let result = yield userDao.insertAccount(personnel.phone, salt, pwdHash, PERSONNEL, unid, trans);
    const accountId = result.insertId;
    result = yield userDao.insertPersonnel(curUserId, accountId, personnel, trans);
    yield mysql.commit(trans);
    Result.OK(this, { pid: result.insertId, accountId });
  } catch (e) {
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}

function *editPersonnel() {
  const body = yield cobody(this);
  const personnel = body.personnel;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    yield userDao.updatePhone(personnel.accountId, personnel.phone, trans);
    yield userDao.updatePersonnel(personnel, trans);
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
  const accountId = body.accountId;
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    yield userDao.deleteAccount(accountId);
    yield userDao.deletePersonnel(pid);
    yield mysql.commit(trans);
    Result.OK(this);
  } catch (e) {
    yield mysql.rollback(trans);
    Result.InternalServerError(this, e.message);
  }
}

function *getCorpPersonnels() {
  const curUserId = this.state.user.userId;
  const pageSize = parseInt(this.request.query.pageSize || 10, 10);
  const current = parseInt(this.request.query.currentPage || 1, 10);
  try {
    const counts = yield userDao.getCorpPersonnelCount(curUserId);
    const totalCount = counts[0].num;
    const personnel = yield userDao.getPagedPersonnelInCorp(curUserId, current, pageSize);
    Result.OK(this, {
      totalCount,
      data: personnel
    });
  } catch (e) {
    Result.InternalServerError(this, e.message);
  }
}

function *getPersonnelInfo() {
  const curUserId = this.state.user.userId;
  try {
    const personnels = yield userDao.getPersonnelInfo(curUserId);
    Result.OK(this, {
      personnelInfo: {
        thisPersonnel: personnels[0]
      }
    });
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
