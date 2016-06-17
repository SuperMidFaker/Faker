import Sequelize, { STRING, INTEGER, DATE, TEXT, NOW } from 'sequelize';
import { mysql } from '../../config/db.config';

const sequelize = new Sequelize(`mysql://${mysql.user}:${mysql.password}@${mysql.host}:3306/${mysql.database}`, {
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
  partner_id:{
    type: INTEGER,
    references: {
      model: Partnership,
      key: 'partner_id'
    }
  },
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