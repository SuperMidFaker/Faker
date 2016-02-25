import mysql from '../../reusable/db-util/mysql';

function getDefaultPartnerClause(tenantId, args) {
  args.push(tenantId);
  return `tenant_id = ? and (established = 1 or partner_tenant_id = -1)`;
}
function getPartnerWhereClause(filters, tenantId, args) {
  const defaultClause = getDefaultPartnerClause(tenantId, args);
  let nameLikeClause = '';
  let partnershipClause = '';
  filters.forEach(flt => {
    if (flt.name === 'name') {
      nameLikeClause = 'and name like ?';
      args.push(`%${flt.value}%`);
    }
    if (flt.name === 'partnerType') {
      partnershipClause = `and name in (select partner_name from sso_partnerships where
        tenant_id = ? and type = ?)`;
      args.push(tenantId);
      args.push(flt.value);
    }
  });
  return `${defaultClause} ${nameLikeClause} ${partnershipClause}`;
}
export default {
  getPartnersTotalCount(tenantId, filters) {
    const args = [];
    const sqlClause = getPartnerWhereClause(filters, tenantId, args);
    const sql = `select count(id) as count from sso_partners where ${sqlClause}`;
    return mysql.query(sql, args);
  },
  getPagedPartners(tenantId, current, pageSize, filters) {
    const args = [];
    const sqlClause = getPartnerWhereClause(filters, tenantId, args);
    const sql = `select id as \`key\`, name, tenant_type as tenantType,
      partner_tenant_id as partnerTenantId, business_volume as volume, revenue, cost
      from sso_partners where ${sqlClause} limit ?,?`;
    console.log(sql, args);
    args.push((current - 1) * pageSize, pageSize);
    return mysql.query(sql, args);
  },
  getTenantPartnerships(tenantId, filters) {
    // used to get partnership type counts
    // if you join in getPagedPartner, you can't get total count group by type,
    // if you put stats in another table, you can't get count filter by name
    const args = [];
    const partnerClause = getPartnerWhereClause(filters.filter(flt => flt.name !== 'partnerType'),
                                                tenantId, args);
    const sql = `select type, type_name as name, partner_name as partnerName from sso_partnerships
      as PS inner join (select tenant_id, name from sso_partners where ${partnerClause}) as P
      on PS.partner_name = P.name where PS.tenant_id = ?`;
    args.push(tenantId);
    return mysql.query(sql, args);
  },
  getPartnerByPair(inviterId, inviteeId, inviteeName) {
    const sql = `select id, established from sso_partners where tenant_id = ?
      and (partner_tenant_id = ? or name = ?)`;
    const args = [inviterId, inviteeId, inviteeName];
    return mysql.query(sql, args);
  },
  insertPartner(tenantId, partnerId, partnerName, tenantType, established, trans) {
    const sql = `insert into sso_partners(name, tenant_type, partner_tenant_id,
      tenant_id, established, created_date) values (?, NOW())`;
    const args = [partnerName, tenantType, partnerId, tenantId, established];
    return mysql.insert(sql, [args], trans);
  },
  establishPartner(tenantId, partnerId, trans) {
    const sql = `update sso_partners set established = 1 where tenant_id = ?
      and partner_tenant_id = ?`;
    const args = [tenantId, partnerId];
    return mysql.update(sql, args, trans);
  },
  deleteSinglePartner(tenantId, partnerId, trans) {
    const sql = 'delete from sso_partners where tenant_id = ? and partner_tenant_id = ?';
    const args = [tenantId, partnerId];
    return mysql.delete(sql, args, trans);
  },
  insertPartnership(tenantId, partnerId, partnerName, partnerships, trans) {
    const sql = `insert into sso_partnerships(tenant_id, partner_tenant_id, partner_name,
      type, type_name) values ?`;
    const args = [];
    partnerships.forEach(pts => {
      args.push([tenantId, partnerId, partnerName, pts.key, pts.name]);
    });
    console.log('partnership args', args);
    return mysql.insert(sql, [args], trans);
  },
  deleteSinglePartnership(tenantId, partnerId, trans) {
    const sql = 'delete from sso_partnerships where tenant_id = ? and partner_tenant_id = ?';
    const args = [tenantId, partnerId];
    return mysql.delete(sql, args, trans);
  },
  insertInvitation(tenantId, partnerId, partnerName, code, trans) {
    const sql = `insert into sso_partner_invitations(inviter_tenant_id, invitee_tenant_id,
      invitee_name, invitation_code, status, created_date) values (?, 0, NOW())`;
    const args = [tenantId, partnerId, partnerName, code];
    return mysql.insert(sql, [args], trans);
  },
  getReceivedInvitationCount(tenantId) {
    const sql = `select count(id) as count from sso_partner_invitations
      where invitee_tenant_id = ?`;
    const args = [tenantId];
    return mysql.query(sql, args);
  },
  getReceivedInvitations(tenantId, current, pageSize) {
    const sql = `select id, inviter_tenant_id as inviterId,
      created_date as createdDate, status from sso_partner_invitations
      where invitee_tenant_id = ? and status != 3 limit ?,?`;
    const args = [tenantId, (current - 1) * pageSize, pageSize];
    return mysql.query(sql, args);
  },
  getPartnershipByInvitee(tenantId) {
    const sql = `select type, type_name as name, tenant_id as inviterId
      from sso_partnerships where partner_tenant_id = ?`;
    const args = [tenantId];
    return mysql.query(sql, args);
  },
  getSentInvitationCount(tenantId) {
    const sql = `select count(id) as count from sso_partner_invitations
      where inviter_tenant_id = ?`;
    const args = [tenantId];
    return mysql.query(sql, args);
  },
  getSentInvitations(tenantId, current, pageSize) {
    const sql = `select id, invitee_name as name, created_date as createdDate, status
      from sso_partner_invitations where inviter_tenant_id = ? limit ?,?`;
    const args = [tenantId, (current - 1) * pageSize, pageSize];
    return mysql.query(sql, args);
  },
  getPartnershipByInviter(tenantId) {
    const sql = `select type, type_name as name, partner_name as partnerName
      from sso_partnerships where tenant_id = ?`;
    const args = [tenantId];
    return mysql.query(sql, args);
  },
  getInvitationInfo(invKey) {
    const sql = `select inviter_tenant_id as inviterId, invitee_tenant_id as inviteeId
      from sso_partner_invitations where id = ?`;
    const args = [invKey];
    return mysql.query(sql, args);
  },
  updateInvitationStatus(status, acceptDate, key, trans) {
    const sql = 'update sso_partner_invitations set status = ?, accept_date = ? where id = ?';
    const args = [status, acceptDate, key];
    return mysql.update(sql, args, trans);
  },
  updateInvitationStatusByPair(status, acceptDate, inviterId, inviteeId, trans) {
    const sql = `update sso_partner_invitations set status = ?, accept_date = ?
      where inviter_tenant_id = ? and invitee_tenant_id = ?`;
    const args = [status, acceptDate, inviterId, inviteeId];
    return mysql.update(sql, args, trans);
  }
};
