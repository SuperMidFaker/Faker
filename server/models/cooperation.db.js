import { STRING, INTEGER, DATE, NOW } from 'sequelize';
import sequelize from './sequelize';
import mysql from '../util/mysql';

function genPartnershipClause(filter, args) {
  let clause = '';
  if (filter.partner_name) {
    clause = `${clause} and partner_name like ?`;
    args.push(`%${filter.partner_name}%`);
  }
  if (filter.partner_code) {
    clause = `${clause} and partner_code like ?`;
    args.push(`%${filter.partner_code}%`);
  }
  return clause;
}
export default {
  insertPartner(tenantId, partnerId, code, partnerName, tenantType, established, trans) {
    const sql = `insert into sso_partners(name, partner_code, tenant_type, partner_tenant_id,
      tenant_id, established, created_date) values (?, NOW())`;
    const args = [partnerName, code, tenantType, partnerId, tenantId, established];
    return mysql.insert(sql, [args], trans);
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
  getPartnerByTypeCode(tenantId, typeCode) {
    const args = [tenantId, typeCode];
    const sql = `select partner_tenant_id as tid, partner_name as name,
      partner_id, partner_code from sso_partnerships where tenant_id = ?
      and type_code = ?`;
    return mysql.query(sql, args);
  },
  getAllPartnerByTypeCode(tenantId, typeCode, filter, offset, size) {
    const args = [tenantId, typeCode];
    const partnerTypeWhere = genPartnershipClause(filter, args);
    const sql = `select partner_id, partner_tenant_id, partner_name from sso_partnerships
      where tenant_id = ? and type_code = ? ${partnerTypeWhere} limit ?, ?`;
    args.push(offset, size);
    return mysql.query(sql, args);
  },
  getAllPartnerByTypeCodeCount(tenantId, typeCode, filter) {
    const args = [tenantId, typeCode];
    const partnerTypeWhere = genPartnershipClause(filter, args);
    const sql = `select count(partner_id) as count from sso_partnerships
      where tenant_id = ? and type_code = ? ${partnerTypeWhere}`;
    return mysql.query(sql, args);
  },
};

export const Partner = sequelize.define('sso_partners', {
  name: STRING,
  partner_code: STRING,
  tenant_type: STRING,
  partner_tenant_id: INTEGER,
  tenant_id: INTEGER,
  business_volume: INTEGER,
  revenue: INTEGER,
  cost: INTEGER,
  established: {
    type: INTEGER,
    defaultValue: 0,
  },
  status: {
    type: INTEGER,
    defaultValue: 1,
  },
  invited: {
    type: INTEGER,
    defaultValue: 0,
  },
  created_date: {
    type: DATE,
    defaultValue: NOW,
  },
}, {
  instanceMethods: {
    transformPartnerships() {
      this.setDataValue('partnerships', this.getDataValue('partnerships').map(ps => ps.type_code));
      return this;
    },
  },
});

export const Partnership = sequelize.define('sso_partnerships', {
  partner_id: INTEGER,
  tenant_id: INTEGER,
  partner_tenant_id: INTEGER,
  partner_name: STRING,
  partner_code: STRING,
  type: INTEGER,
  type_code: STRING,
  status: INTEGER,
});

export const Invitation = sequelize.define('sso_partner_invitations', {
  partner_id: INTEGER,
  inviter_tenant_id: INTEGER,
  invitee_tenant_id: INTEGER,
  invitee_code: STRING,
  invitee_name: STRING,
  invitation_code: STRING,
  created_date: {
    type: DATE,
    defaultValue: NOW,
  },
  accept_date: DATE,
  status: {
    type: INTEGER,
    defaultValue: 0,
  },
}, {
  classMethods: {
    getSendInvitationsByTenantId(tenantId) {
      const sql = `
        SELECT PI.id, PI.partner_id AS partnerId, PI.invitee_name AS name,
        PI.invitee_code AS code, PI.status, PI.created_date, PS.type_code AS partnerships
        FROM sso_partner_invitations AS PI
        INNER JOIN sso_partnerships AS PS ON PI.partner_id = PS.partner_id
        WHERE inviter_tenant_id = ${tenantId} ORDER BY status, created_date DESC;
      `;
      return sequelize
        .query(sql, { model: Invitation, type: sequelize.QueryTypes.SELECT })
        .then(invitations => this.transformInvitations(invitations.map(invitation => invitation.get())));
    },
    getReceiveInvitationsByTenantId(tenantId) {
      const sql = `
      SELECT P.type_code AS partnerships, PPI.id, PPI.partner_id, PPI.name, PPI.code,
      PPI.status, PPI.created_date FROM sso_partnerships AS P INNER JOIN
        (SELECT PI.id, PI.partner_id, T.name, T.code AS code, PI.status,
          PI.invitee_tenant_id, PI.inviter_tenant_id, PI.created_date
          FROM sso_partner_invitations AS PI
          INNER JOIN sso_tenants AS T ON T.tenant_id = PI.inviter_tenant_id
          WHERE invitee_tenant_id = ${tenantId}) AS PPI
          ON PPI.invitee_tenant_id = P.partner_tenant_id AND PPI.inviter_tenant_id = P.tenant_id
      ORDER BY status, created_date DESC;`;
      return sequelize
        .query(sql, { model: Invitation, type: sequelize.QueryTypes.SELECT })
        .then(invitations => this.transformInvitations(invitations.map(invitation => invitation.get())));
    },
    transformInvitations(rawInvites) {
      return rawInvites.map(invitee => ({ ...invitee, partnerships: [invitee.partnerships] })).reduce((total, invitee) => {
        const foundIndex = total.findIndex(item => invitee.code === item.code && invitee.name === item.name);
        if (foundIndex !== -1) {
          total[foundIndex].partnerships.push(invitee.partnerships[0]);
        } else {
          total.push(invitee);
        }
        return total;
      }, []);
    },
  },
});

Partner.hasMany(Partnership, { as: 'partnerships', foreignKey: 'partner_id', constraints: false });
Partnership.belongsTo(Partner, { foreignKey: 'partner_id', constraints: false });
