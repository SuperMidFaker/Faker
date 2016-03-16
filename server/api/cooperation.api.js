import cobody from 'co-body';
import coopDao from '../models/cooperation.db';
import tenantDao from '../models/tenant.db';
import mysql from '../../reusable/db-util/mysql';
import Result from '../../reusable/node-util/response-result';
import { getSmsCode } from '../../reusable/common/validater';
import { TENANT_LEVEL, INVITATION_STATUS, PARTNERSHIP_TYPE_INFO, PARTNER_TENANT_TYPE }
  from '../../universal/constants';

const partnershipTypeNames = Object.keys(PARTNERSHIP_TYPE_INFO).map(pstkey => PARTNERSHIP_TYPE_INFO[pstkey]);

function getTenantTypeDesc(level) {
  return level === TENANT_LEVEL.ENTERPRISE ? PARTNER_TENANT_TYPE[0] : PARTNER_TENANT_TYPE[1];
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
      partner.types = partnerships.filter(ps => ps.partnerName === partner.name).map(
        pt => ({
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
    code: pts
  }));
  let trans;
  try {
    const partners = yield coopDao.getPartnerByPair(body.tenantId, body.partnerId);
    if (partners.length > 0) {
      return Result.ParamError(this, { key: 'partnerExist' });
    }
    const partnerTenants = yield tenantDao.getTenantInfo(body.partnerId);
    if (partnerTenants.length !== 1) {
      throw new Error('no platform partner tenant found');
    }
    const partner = partnerTenants[0];
    const tenantType = getTenantTypeDesc(partner.level);
    trans = yield mysql.beginTransaction();
    yield coopDao.insertPartner(
      body.tenantId, body.partnerId, partner.name,
      tenantType, 0, trans
    );
    yield coopDao.deleteSinglePartnership(body.tenantId, body.partnerId, trans);
    yield coopDao.insertPartnership(
      body.tenantId, body.partnerId, partner.name, partnerships, trans
    );
    yield coopDao.insertInvitation(
      body.tenantId, body.partnerId, partner.name,
      INVITATION_STATUS.NEW_SENT, null, trans);
    yield mysql.commit(trans);
    return Result.OK(this);
  } catch (e) {
    console.log(e && e.stack);
    yield mysql.rollback(trans);
    return Result.InternalServerError(this, e.message);
  }
}

function *partnerOfflineP() {
  const body = yield cobody(this);
  const partnerships = body.partnerships.map(pts => ({
    key: partnershipTypeNames.indexOf(pts),
    code: pts
  }));
  const tenantType = PARTNER_TENANT_TYPE[2];
  let trans;
  try {
    const partners = yield coopDao.getPartnerByPair(body.tenantId, null, body.partnerName);
    if (partners.length > 0) {
      return Result.ParamError(this, { key: 'offlinePartnerExist' });
    }
    trans = yield mysql.beginTransaction();
    const result = yield coopDao.insertPartner(
      body.tenantId, -1, body.partnerName, tenantType, 0, trans
    );
    yield coopDao.deleteOfflinePartnership(body.tenantId, body.partnerName, trans);
    yield coopDao.insertPartnership(
      body.tenantId, -1, body.partnerName, partnerships, trans
    );
    const code = getSmsCode(6);
    yield coopDao.insertInvitation(
      body.tenantId, -1, body.partnerName,
      INVITATION_STATUS.NEW_SENT, code, trans);
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
    return Result.InternalServerError(this, e.message);
  }
}

function *receivedInvitationsG() {
  const current = parseInt(this.request.query.currentPage, 10);
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const tenantId = parseInt(this.request.query.tenantId, 10);
  try {
    const totals = yield coopDao.getReceivedInvitationCount(tenantId);
    const invitations = yield coopDao.getReceivedInvitations(
      tenantId, INVITATION_STATUS.CANCELED, current, pageSize);
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
      providerTypes: partnershipTypeNames.slice(1), // 去掉第一个'客户'关系
      data: receiveds
    });
  } catch (e) {
    console.log(e && e.stack);
    return Result.InternalServerError(this, e.message);
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
    let status;
    if (body.type === 'accept') {
      status = INVITATION_STATUS.ACCEPTED;
      yield coopDao.updateInvitationStatus(status, new Date(), body.key, trans);
      yield coopDao.establishPartner(invitations[0].inviterId, invitations[0].inviteeId, trans);
      const partners = yield coopDao.getPartnerByPair(
        invitations[0].inviteeId, invitations[0].inviterId
      );
      if (partners.length === 0) {
        const inviterTenants = yield tenantDao.getTenantInfo(invitations[0].inviterId);
        const partnerName = inviterTenants[0].name;
        const tenantType = getTenantTypeDesc(inviterTenants[0].level);
        yield coopDao.insertPartner(invitations[0].inviteeId, invitations[0].inviterId,
                                    partnerName, tenantType, 1, trans);
        // 先删除再新建, 不在拒绝和取消时删除,因为收到和发出界面里需要显示
        // 若重新建立,则相应界面显示新的关系
        yield coopDao.deleteSinglePartnership(
          invitations[0].inviteeId, invitations[0].inviterId, trans
        );
        yield coopDao.insertPartnership(
          invitations[0].inviteeId, invitations[0].inviterId, partnerName,
          body.partnerships.map(ps => ({
            key: partnershipTypeNames.indexOf(ps),
            code: ps
          })), trans);
      } else {
        // 已经向邀请方发送添加请求,只需将另一条partner记录置为建立,
        // 发送邀请置为取消
        yield coopDao.cancelInvitationByPair(
          INVITATION_STATUS.CANCELED, invitations[0].inviteeId,
          invitations[0].inviterId, null, trans);
        yield coopDao.establishPartner(invitations[0].inviteeId, invitations[0].inviterId, trans);
      }
    } else if (body.type === 'reject') {
      status = INVITATION_STATUS.REJECTED;
      yield coopDao.updateInvitationStatus(status, null, body.key, trans);
      yield coopDao.rejectPartner(
        invitations[0].inviterId, invitations[0].inviteeId,
        invitations[0].inviteeName, trans
      );
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
      sent.types = partnerships.filter(pts => pts.partnerName === invitations[i].name)
        .map(pts => ({
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
    return Result.InternalServerError(this, e.message);
  }
}

function *cancelInvitation() {
  const body = yield cobody(this);
  let trans;
  try {
    const invitations = yield coopDao.getInvitationInfo(body.key);
    if (invitations.length !== 1) {
      throw new Error('invitation not found');
    }
    const status = INVITATION_STATUS.CANCELED;
    trans = yield mysql.beginTransaction();
    yield coopDao.updateInvitationStatus(status, null, body.key, trans);
    yield coopDao.rejectPartner(
      invitations[0].inviterId, invitations[0].inviteeId,
      invitations[0].inviteeName, trans
    );
    yield mysql.commit(trans);
    return Result.OK(this, status);
  } catch (e) {
    yield mysql.rollback(trans);
    return Result.InternalServerError(this, e.message);
  }
}

function *sendOfflineInvitation() {
  const body = yield cobody(this);
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    yield coopDao.cancelInvitationByPair(
      INVITATION_STATUS.CANCELED, body.tenantId,
      null, body.partnerName, trans
    );
    const code = getSmsCode(6);
    yield coopDao.insertInvitation(
      body.tenantId, -1, body.partnerName,
      INVITATION_STATUS.NEW_SENT, code, trans
    );
    // todo body.contact
    yield mysql.commit(trans);
    return Result.OK(this);
  } catch (e) {
    yield mysql.rollback(trans);
    return Result.InternalServerError(this, e.message);
  }
}
export default [
  [ 'get', '/v1/cooperation/partners', partnersG ],
  [ 'post', '/v1/cooperation/partner/online', partnerOnlineP ],
  [ 'post', '/v1/cooperation/partner/offline', partnerOfflineP ],
  [ 'get', '/v1/cooperation/invitations/in', receivedInvitationsG ],
  [ 'post', '/v1/cooperation/invitation', invitationP ],
  [ 'get', '/v1/cooperation/invitations/out', sentInvitationsG ],
  [ 'post', '/v1/cooperation/invitation/cancel', cancelInvitation ],
  [ 'post', '/v1/cooperation/partner/invitation', sendOfflineInvitation ]
]
