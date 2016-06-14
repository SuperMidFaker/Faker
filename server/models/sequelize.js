import Sequelize, { STRING, INTEGER, DATE, TEXT } from 'sequelize';

const sequelize = new Sequelize('mysql://root:qeemo1234@192.168.0.200:3306/qm_saas', {
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
  established: INTEGER,
  status: INTEGER,
  invited: INTEGER,
  created_date: DATE
});

export const Partnership = sequelize.define('sso_partnerships', {
  partner_id: INTEGER,
  tenant_id: INTEGER,
  partner_tenant_id: INTEGER,
  partner_name: STRING,
  partner_code: STRING,
  type: INTEGER,
  type_code: STRING
});

export const Invitation = sequelize.define('sso_partner_invitations', {
  partner_id: INTEGER,
  inviter_tenant_id: INTEGER,
  invitee_tenant_id: INTEGER,
  invitee_code: STRING,
  invitee_name: STRING,
  invitation_code: STRING,
  created_date: DATE,
  accept_date: DATE,
  status: INTEGER
});

Partner.hasMany(Partnership, {as: 'Partnerships', foreignKey: 'partner_id'});