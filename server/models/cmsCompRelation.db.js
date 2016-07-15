import { STRING, INTEGER, DATE, TEXT, NOW } from 'sequelize';
import sequelize from './sequelize';
import mysql from '../util/mysql';

export const CompRelation = sequelize.define('cms_comp_relation', {
  id: {
    type: INTEGER,
    primaryKey: true,
  },
  comp_code: {
    type: STRING,
  },
  comp_name: STRING,
  i_e_type: STRING,
  relation_type: STRING,
  tenant_id: INTEGER,
  status: INTEGER,
  created_date: DATE,
}, {
  freezeTableName: true,
});
