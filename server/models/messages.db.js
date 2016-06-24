import { STRING, INTEGER, DATE, TEXT, NOW } from 'sequelize';
import sequelize from './sequelize';
import mysql from '../util/mysql';

export const messages = sequelize.define('sso_messages', {
  id: {
    type: INTEGER,
    primaryKey: true
  },
  tenant_id: INTEGER,
  login_id: INTEGER,
  from_tenant_id: INTEGER,
  from_login_id: INTEGER,
  from_name: STRING,
  content: STRING,
  status: INTEGER,
  readTime: DATE,
  time: DATE
}, {
    freezeTableName: true
});
