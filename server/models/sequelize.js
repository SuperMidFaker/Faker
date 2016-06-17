import Sequelize, { STRING, INTEGER, DATE, TEXT, NOW } from 'sequelize';
import { mysql } from '../../config/db.config';

export const sequelize = new Sequelize(`mysql://${mysql.user}:${mysql.password}@${mysql.host}:3306/${mysql.database}`, {
  define: {
    timestamps: false,
    freezeTabName: true
  }
});

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
    defaultValue: 0
  },
  status: {
    type: INTEGER,
    defaultValue: 1
  },
  invited: {
    type: INTEGER,
    defaultValue: 0
  },
  created_date: {
    type: DATE,
    defaultValue: NOW
  }
}, {
  instanceMethods: {
    transformPartnerships() {
      this.setDataValue('partnerships', this.getDataValue('partnerships').map(ps => ps.type_code));
      return this;
    }
  }
});

export const Partnership = sequelize.define('sso_partnerships', {
  partner_id: INTEGER,
  tenant_id: INTEGER,
  partner_tenant_id: INTEGER,
  partner_name: STRING,
  partner_code: STRING,
  type: INTEGER,
  type_code: STRING,
  status: INTEGER
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
    defaultValue: NOW
  },
  accept_date: DATE,
  status: {
    type: INTEGER,
    defaultValue: 0
  }
}, {
  classMethods: {
    getSendInvitationsByTenantId(tenantId) {
      const sql = `
        SELECT PI.id, PI.partner_id AS partnerId, PI.invitee_name AS name, PI.invitee_code AS code, PI.status, PI.created_date, PS.type_code AS partnerships FROM sso_partner_invitations AS PI
        INNER JOIN sso_partnerships AS PS ON PI.partner_id = PS.partner_id
        WHERE inviter_tenant_id = ${tenantId} ORDER BY status, created_date DESC;
      `;
      return sequelize
        .query(sql, {model: Invitation, type: sequelize.QueryTypes.SELECT})
        .then(invitations => this.transformInvitations(invitations.map(invitation => invitation.get())));
    },
    getReceiveInvitationsByTenantId(tenantId) {
      const sql = `
      SELECT P.type_code AS partnerships, PPI.id, PPI.partner_id, PPI.name, PPI.code, PPI.status, PPI.created_date
      FROM sso_partnerships AS P INNER JOIN
        (SELECT PI.id, PI.partner_id, T.name, T.code AS code, PI.status, PI.invitee_tenant_id, PI.inviter_tenant_id, PI.created_date
          FROM sso_partner_invitations AS PI
          INNER JOIN sso_tenants AS T ON T.tenant_id = PI.inviter_tenant_id
          WHERE invitee_tenant_id = ${tenantId}) AS PPI
          ON PPI.invitee_tenant_id = P.partner_tenant_id AND PPI.inviter_tenant_id = P.tenant_id
      ORDER BY status, created_date DESC;`;
      return sequelize
        .query(sql, {model: Invitation, type: sequelize.QueryTypes.SELECT})
        .then(invitations => this.transformInvitations(invitations.map(invitation => invitation.get())));
    },
    transformInvitations(rawInvites) {
      return rawInvites.map(invitee => ({...invitee, partnerships: [invitee.partnerships]})).reduce((total, invitee) => {
        const foundIndex = total.findIndex(item => invitee.code === item.code && invitee.name === item.name);
        if (foundIndex !== -1) {
          total[foundIndex].partnerships.push(invitee.partnerships[0]);
        } else {
          total.push(invitee);
        }
        return total;
      }, []);
    }
  },
});

export const Tenant = sequelize.define('sso_tenants', {
  tenant_id: {
    type: INTEGER,
    primaryKey: true
  },
  code: STRING,
  sub_code: STRING,
  aspect: INTEGER,
  name: STRING,
  telephone: STRING,
  phone: STRING,
  subdomain: STRING,
  foundation: DATE,
  country: STRING,
  province: STRING,
  city: STRING,
  district: STRING,
  address: STRING,
  logo: STRING,
  short_name: STRING,
  category_id: INTEGER,
  website: STRING,
  remark: STRING,
  contact: STRING,
  level: STRING,
  email: STRING,
  branch_count: INTEGER,
  user_count: INTEGER,
  parent_tenant_id: INTEGER,
  delegate_prefix: STRING,
  status: STRING,
  created_date: DATE
});

Partner.hasMany(Partnership, {as: 'partnerships', foreignKey: 'partner_id', constraint: false});
Partnership.belongsTo(Partner, {foreignKey: 'partner_id', constraint: false});