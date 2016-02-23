import cobody from 'co-body';
import coopDao from '../models/cooperation.db';
import tenantDao from '../models/tenant.db';
import mysql from '../../reusable/db-util/mysql';
import Result from '../../reusable/node-util/response-result';
import { getSmsCode } from '../../reusable/common/validater';
import { TENANT_LEVEL } from '../../universal/constants';

const partnershipTypeNames = ['客户', '报关', '货代', '运输', '仓储'];

function getTenantTypeDesc(level) {
  return level === TENANT_LEVEL.ENTERPRISE ? '企业法人' : '分支机构';
}
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
    const tenantType = getTenantTypeDesc(partner.level);
    trans = yield mysql.beginTransaction();
    yield coopDao.insertPartner(body.tenantId, body.partnerId, partner.name,
                                tenantType, 0, trans);
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
                                               tenantType, 0, trans);
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
    const totals = yield coopDao.getReceivedInvitationCount(tenantId);
    const invitations = yield coopDao.getReceivedInvitations(tenantId, current, pageSize);
    const partnerships = yield coopDao.getPartnershipByInvitee(tenantId);
    const receiveds = [];
    const invitees = yield tenantDao.getTenantInfo(tenantId);
    if (invitees.length !== 1) {
      throw new Error('no invitee tenant');
    }
    for (let i = 0; i < invitations.length; i++) {
      const inviters = yield tenantDao.getTenantInfo(invitations[i].inviterId);
      const receive = {
        key: invitations[i].id,
        createdDate: invitations[i].createdDate,
        status: invitations[i].status,
        name: inviters[0].name
      };
      receive.types = partnerships.filter(pts => pts.inviterId === invitations[i].inviterId)
        .map(pts => ({
          key: pts.type,
          name: pts.name
        }));
      receiveds.push(receive);
    }
    return Result.OK(this, {
      totalCount: totals.length > 0 ? totals[0].count : 0,
      pageSize,
      current,
      data: receiveds
    });
  } catch (e) {
    console.log(e && e.stack);
    return Result.InternalServerError(this, '获取当前租户收到邀请异常');
  }
}

function *invitationP() {
  const body = yield cobody(this);
  let trans;
  try {
    const invitations = yield coopDao.getInvitationInfo(body.key);
    if (invitations.length !== 1) {
      throw new Error('invitation not found');
    }
    trans = yield mysql.beginTransaction();

    let status = -1;
    if (body.type === 'accept') {
      status = 1;
      yield coopDao.updateInvitationStatus(status, new Date(), body.key, trans);
      yield coopDao.establishPartner(invitations[0].inviterId, invitations[0].inviteeId, trans);
      const inviterTenants = yield tenantDao.getTenantInfo(invitations[0].inviterId);
      const partnerName = inviterTenants[0].name;
      const tenantType = getTenantTypeDesc(inviterTenants[0].level);
      yield coopDao.insertPartner(invitations[0].inviteeId, invitations[0].inviterId,
                                  partnerName, tenantType, 1, trans);
      // 建立双向合作关系时另一个合作关系都为'客户' fixme
      yield coopDao.insertPartnership(invitations[0].inviteeId, invitations[0].inviterId,
                                      partnerName, [{ key: 0, name: partnershipTypeNames[0] }],
                                      trans);
    } else if (body.type === 'reject') {
      status = 2;
      yield coopDao.updateInvitationStatus(status, null, body.key, trans);
      // todo delete the partners partnerships records??
    }
    yield mysql.commit(trans);
    return Result.OK(this, status);
  } catch (e) {
    yield mysql.rollback(trans);
    console.log(e && e.stack);
    return Result.InternalServerError(this, e.message);
  }
}

function *sentInvitationsG() {
  const current = parseInt(this.request.query.currentPage, 10);
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const tenantId = parseInt(this.request.query.tenantId, 10);
  try {
    const totals = yield coopDao.getSentInvitationCount(tenantId);
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
      sent.types = partnerships.filter(pts => pts.partnerName === invitations[i].name).map(pts => ({
        key: pts.type,
        name: pts.name
      }));
      sents.push(sent);
    }
    return Result.OK(this, {
      totalCount: totals.length > 0 ? totals[0].count : 0,
      pageSize,
      current,
      data: sents
    });
  } catch (e) {
    console.log(e && e.stack);
    return Result.InternalServerError(this, '获取当前租户发出邀请异常');
  }
}

function *cancelInvitation() {
}
export default [
  [ 'get', '/v1/cooperation/partners', partnersG ],
  [ 'post', '/v1/cooperation/partner/online', partnerOnlineP ],
  [ 'post', '/v1/cooperation/partner/offline', partnerOfflineP ],
  [ 'get', '/v1/cooperation/invitations/in', receivedInvitationsG ],
  [ 'post', '/v1/cooperation/invitation', invitationP ],
  [ 'get', '/v1/cooperation/invitations/out', sentInvitationsG ],
  [ 'post', '/v1/cooperation/invitation/cancel', cancelInvitation ],
]
