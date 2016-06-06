import mysql from '../util/mysql';

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
    const sql = `select id as \`key\`, name, partner_code as partnerCode,
      tenant_type as tenantType, tenant_id as tenantId, partner_tenant_id as partnerTenantId,
      business_volume as volume, revenue, cost from sso_partners where ${sqlClause}`;
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
    const sql = `select type, type_code as name, partner_name as partnerName,
      PS.partner_code as partnerCode from sso_partnerships as PS inner join
      (select tenant_id, name, partner_code from sso_partners where ${partnerClause}) as P
      on PS.partner_code = P.partner_code where PS.tenant_id = ?`;
    args.push(tenantId);
    return mysql.query(sql, args);
  },
  getPartnerByPair(inviterId, inviteeId, inviteeCode) {
    const sql = `select id, established from sso_partners where tenant_id = ?
      and (partner_tenant_id = ? or partner_code = ?)`;
    const args = [inviterId, inviteeId, inviteeCode];
    return mysql.query(sql, args);
  },
  insertPartner(tenantId, partnerId, code, partnerName, tenantType, established, trans) {
    const sql = `insert into sso_partners(name, partner_code, tenant_type, partner_tenant_id,
      tenant_id, established, created_date) values (?, NOW())`;
    const args = [partnerName, code, tenantType, partnerId, tenantId, established];
    return mysql.insert(sql, [args], trans);
  },
  establishPartner(tenantId, partnerId, trans) {
    const sql = `update sso_partners set established = 1 where tenant_id = ?
      and partner_tenant_id = ?`;
    const args = [tenantId, partnerId];
    return mysql.update(sql, args, trans);
  },
  rejectPartner(tenantId, partnerId, partnerCode, trans) {
    const sql = `delete from sso_partners where tenant_id = ? and partner_tenant_id = ?
      and partner_code = ? and established != 1`;
    const args = [tenantId, partnerId, partnerCode];
    return mysql.delete(sql, args, trans);
  },
  insertPartnership(partnerKey, tenantId, partnerId, partnerCode, partnerName, partnerships, trans) {
    const sql = `insert into sso_partnerships(partner_id, tenant_id, partner_tenant_id,
      partner_code, partner_name, type, type_code) values ?`;
    const args = [];
    partnerships.forEach(pts => {
      args.push([partnerKey, tenantId, partnerId, partnerCode, partnerName, pts.key, pts.code]);
    });
    return mysql.insert(sql, [args], trans);
  },
  deleteSinglePartnership(tenantId, partnerId, trans) {
    const sql = 'delete from sso_partnerships where tenant_id = ? and partner_tenant_id = ?';
    const args = [tenantId, partnerId];
    return mysql.delete(sql, args, trans);
  },
  deleteOfflinePartnership(tenantId, partnerCode, trans) {
    const sql = `delete from sso_partnerships where tenant_id = ?
      and partner_code = ? and partner_tenant_id = -1`;
    const args = [tenantId, partnerCode];
    return mysql.delete(sql, args, trans);
  },
  insertInvitation(partnerKey, tenantId, partnerId, partnerCode, partnerName, status, code, trans) {
    const sql = `insert into sso_partner_invitations(partner_id, inviter_tenant_id, invitee_tenant_id,
      invitee_code, invitee_name, status, invitation_code, created_date) values (?, NOW())`;
    const args = [partnerKey, tenantId, partnerId, partnerCode, partnerName, status, code];
    return mysql.insert(sql, [args], trans);
  },
  getReceivedInvitationCount(tenantId) {
    const sql = `select count(id) as count from sso_partner_invitations
      where invitee_tenant_id = ?`;
    const args = [tenantId];
    return mysql.query(sql, args);
  },
  getReceivedInvitations(tenantId, exceptStatus, current, pageSize) {
    const sql = `select id, inviter_tenant_id as inviterId,
      created_date as createdDate, status from sso_partner_invitations
      where invitee_tenant_id = ? and status != ? limit ?,?`;
    const args = [tenantId, exceptStatus, (current - 1) * pageSize, pageSize];
    return mysql.query(sql, args);
  },
  getPartnershipByInvitee(tenantId) {
    const sql = `select type, type_code as name, tenant_id as inviterId
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
    const sql = `select id, invitee_code as code, invitee_name as name,
      created_date as createdDate, status from sso_partner_invitations
      where inviter_tenant_id = ? limit ?,?`;
    const args = [tenantId, (current - 1) * pageSize, pageSize];
    return mysql.query(sql, args);
  },
  getPartnershipByInviter(tenantId) {
    const sql = `select type, type_code as name, partner_code as partnerCode
      from sso_partnerships where tenant_id = ?`;
    const args = [tenantId];
    return mysql.query(sql, args);
  },
  getInvitationInfo(invKey) {
    const sql = `select inviter_tenant_id as inviterId, invitee_tenant_id as inviteeId,
      invitee_code as inviteeCode from sso_partner_invitations where id = ?`;
    const args = [invKey];
    return mysql.query(sql, args);
  },
  updateInvitationStatus(status, acceptDate, key, trans) {
    const sql = 'update sso_partner_invitations set status = ?, accept_date = ? where id = ?';
    const args = [status, acceptDate, key];
    return mysql.update(sql, args, trans);
  },
  cancelInvitationByPair(status, inviterId, inviteeId, inviteeCode, trans) {
    const sql = `update sso_partner_invitations set status = ? where inviter_tenant_id = ?
      and (invitee_tenant_id = ? or invitee_code = ?)`;
    const args = [status, inviterId, inviteeId, inviteeCode];
    return mysql.update(sql, args, trans);
  },
  getPartnerByTypeCode(tenantId, typeCode) {
    const sql = `select partner_tenant_id as tid, partner_name as name, partner_id,
      partner_code from sso_partnerships where tenant_id = ? and type_code = ?`;
    const args = [ tenantId, typeCode ];
    return mysql.query(sql, args);
  },
  getAllPartnerByTypeCode(tenantId, typeCode, offset, size) {
    const sql = 'select partner_id, partner_tenant_id, partner_name from sso_partnerships where tenant_id = ? and type_code = ? limit ?, ?';
    const args = [ tenantId, typeCode, offset, size ];
    return mysql.query(sql, args);
  },
  getAllPartnerByTypeCodeCount(tenantId, typeCode) {
    const sql = 'select count(partner_id) as count from sso_partnerships where tenant_id = ? and type_code = ?';
    const args = [ tenantId, typeCode];
    return mysql.query(sql, args);
  },
  getReceiveablePartnerTenants(tenantId) {
    const sql = `
      SELECT T.tenant_id AS id, T.code AS code, T.name AS name
      FROM sso_tenants AS T
      WHERE T.tenant_id != ${tenantId} 
            AND T.tenant_id NOT IN(SELECT partner_tenant_id FROM sso_partners AS P WHERE P.tenant_id = ${tenantId})
            AND T.tenant_id NOT IN(SELECT invitee_tenant_id FROM sso_partner_invitations AS I WHERE I.inviter_tenant_id = ${tenantId}  AND I.status IN (0, 1));
    `;
    return mysql.query(sql);
  },
  // TODO: above db opetaion need to refactor
  removePartnerships(tenantId, partnerName, partnerCode, trans) {
    const sql = `DELETE FROM sso_partnerships WHERE tenant_id = ${tenantId} AND partner_name = '${partnerName}' AND partner_code = '${partnerCode}';`;
    return mysql.delete(sql, [], trans);
  },
  insertPartnerships(partnerKey, tenantId, partnerTenantId, partnerName, partnerCode, partnerships, trans) {
    const sql = `
      INSERT INTO sso_partnerships(partner_id, tenant_id, partner_tenant_id, partner_code, partner_name, type_code) values ?
    `;
      const args = [];
      partnerships.forEach(pts => {
        args.push([partnerKey, tenantId, partnerTenantId, partnerCode, partnerName, pts]);
      });
      return mysql.insert(sql, [args], trans);
  },
  getToInvitesWithTenantId(tenantId) {
    const sql = `
      SELECT P.name, P.partner_code AS code, PS.type_code AS partnerships, PS.partner_tenant_id AS tenant_id
      FROM sso_partners AS P
      INNER JOIN sso_partnerships AS PS
      ON P.name = PS.partner_name AND P.partner_code = PS.partner_code
      WHERE P.tenant_id = ${tenantId} AND P.partner_tenant_id = -1
            AND NOT EXISTS(
              SELECT 1 FROM sso_partner_invitations AS PI
              WHERE PI.inviter_tenant_id = P.tenant_id 
                      AND PI.invitee_code = P.partner_code
                      AND PI.invitee_name = P.name
                      AND PI.status <= 2
            );
    `;
    return mysql.query(sql);
  },
  getInvitationsByTenantId(tenantId, tenantType) {
    let tenantField;
    if (tenantType === 0) { // 邀请方
      tenantField = 'inviter_tenant_id';
    } else { // 被邀方
      tenantField = 'invitee_tenant_id';
    }
    const sql = `SELECT id, invitee_name AS name, invitee_code AS code, status FROM sso_partner_invitations WHERE ${tenantField} = ${tenantId} ORDER BY status;`;
    console.log(sql);
    return mysql.query(sql);
  }
};
