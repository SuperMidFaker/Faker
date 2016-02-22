import cobody from 'co-body';
import coopDao from '../models/cooperation.db';
import tenantDao from '../models/tenant.db';
import mysql from '../../reusable/db-util/mysql';
import Result from '../../reusable/node-util/response-result';
import { getSmsCode } from '../../reusable/common/validater';
import { TENANT_LEVEL } from '../../universal/constants';

const partnershipTypeNames = ['客户', '报关', '货代', '运输', '仓储'];

function *partnersG() {
  const current = parseInt(this.request.query.currentPage, 10);
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const tenantId = parseInt(this.request.query.tenantId, 10);
  const filters = this.request.query.filters ? JSON.parse(this.request.query.filters) : [];
  try {
    const totals = yield coopDao.getPartnersTotalCount(tenantId, filters);
    const partners = yield coopDao.getPagedPartners(tenantId, current, pageSize, filters);
    const partnerships = yield coopDao.getTenantPartnerships(tenantId, filters);
    const partnershipTypes = partnershipTypeNames.map((name, index) => ({
      key: `${index}`, // used as RadionButton key
      name,
      count: partnerships.filter(pts => pts.name === name).length
    }));
    for (let i = 0; i < partners.length; ++i) {
      const partner = partners[i];
      partner.types = [];
      partnerships.filter(ps => ps.partnerName === partner.name).forEach(
        pt => partner.types.push({
          key: pt.type,
          name: pt.name
        })
      );
    }
    const partnerTenants = yield tenantDao.getAllTenantsExcept(tenantId);
    return Result.OK(this, {
      partnerlist: {
        totalCount: totals.length > 0 ? totals[0].count : 0,
        pageSize,
        current,
        data: partners
      },
      partnershipTypes,
      partnerTenants
    });
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, e.message);
  }
}

function *partnerOnlineP() {
  const body = yield cobody(this);
  const partnerships = body.partnerships.map(pts => ({
    key: partnershipTypeNames.indexOf(pts),
    name: pts
  }));
  let trans;
  try {
    const partnerTenants = yield tenantDao.getTenantInfo(body.partnerId);
    if (partnerTenants.length !== 1) {
      throw new Error('no platform partner tenant found');
    }
    const partner = partnerTenants[0];
    const tenantType = partner.level === TENANT_LEVEL.ENTERPRISE ? '企业法人' : '分支机构';
    trans = yield mysql.beginTransaction();
    yield coopDao.insertPartner(body.tenantId, body.partnerId, partner.name,
                                tenantType, trans);
    yield coopDao.insertPartnership(body.tenantId, body.partnerId, partner.name,
                                    partnerships, trans);
    yield coopDao.insertInvitation(body.tenantId, body.partnerId, partner.name, null, trans);
    yield mysql.commit(trans);
    return Result.OK(this);
  } catch (e) {
    console.log(e && e.stack);
    yield mysql.rollback(trans);
    return Result.InternalServerError(this, '添加线上合作伙伴异常');
  }
}

function *partnerOfflineP() {
  const body = yield cobody(this);
  const partnerships = body.partnerships.map(pts => ({
    key: partnershipTypeNames.indexOf(pts),
    name: pts
  }));
  const tenantType = '线下';
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    const result = yield coopDao.insertPartner(body.tenantId, -1, body.partnerName,
                                               tenantType, trans);
    yield coopDao.insertPartnership(body.tenantId, -1, body.partnerName,
                                    partnerships, trans);
    const code = getSmsCode(6);
    yield coopDao.insertInvitation(body.tenantId, -1, body.partnerName, code, trans);
    yield mysql.commit(trans);
    // sendInvitation by body.contact -> phone or email todo
    return Result.OK(this, {
      key: result.insertId,
      name: body.partnerName,
      tenantType,
      types: partnerships,
      partnerTenantId: -1
    });
  } catch (e) {
    console.log(e && e.stack);
    return Result.InternalServerError(this, '添加线下伙伴异常');
  }
}

function *receivedInvitationsG() {
  const current = parseInt(this.request.query.currentPage, 10);
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const tenantId = parseInt(this.request.query.tenantId, 10);
  try {
    const invitations = yield coopDao.getReceivedInvitations(tenantId, current, pageSize);
    const partnerships = yield coopDao.getPartnershipByInvitee(tenantId);
    const receiveds = [];
    for (let i = 0; i < invitations.length; i++) {
      const receive = {
        key: invitations[i].id,
        createdDate: invitations[i].createdDate,
        status: invitations[i].status
      };
      const receiverNames = yield tenantDao.getTenantInfo(invitations[i].inviterId);
      receive.name = receiverNames[0].name;
      receive.types = partnerships.filter(pts => pts.name === receive.name).forEach(pts => ({
        key: pts.type,
        name: pts.name
      }));
    }
    return Result.OK(this, receiveds);
  } catch (e) {
    console.log(e && e.stack);
    return Result.InternalServerError(this, '获取当前租户收到邀请异常');
  }
}

function *sentInvitationsG() {
  const current = parseInt(this.request.query.currentPage, 10);
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const tenantId = parseInt(this.request.query.tenantId, 10);
  try {
    const invitations = yield coopDao.getSentInvitations(tenantId, current, pageSize);
    const partnerships = yield coopDao.getPartnershipByInviter(tenantId);
    const sents = [];
    for (let i = 0; i < invitations.length; i++) {
      const sent = {
        key: invitations[i].id,
        createdDate: invitations[i].createdDate,
        name: invitations[i].name,
        status: invitations[i].status
      };
      sent.types = partnerships.filter(pts => pts.name === receive.name).forEach(pts => ({
        key: pts.type,
        name: pts.name
      }));
    }
    return Result.OK(this, sents);
  } catch (e) {
    console.log(e && e.stack);
    return Result.InternalServerError(this, '获取当前租户发出邀请异常');
  }
}
export default [
  [ 'get', '/v1/cooperation/partners', partnersG ],
  [ 'post', '/v1/cooperation/partner/online', partnerOnlineP ],
  [ 'post', '/v1/cooperation/partner/offline', partnerOfflineP ],
  [ 'get', '/v1/cooperation/invitations/in', receivedInvitationsG ],
]
