import sequelize from './sequelize';
import { STRING, INTEGER, DATE, NOW } from 'sequelize';

export const CmsCompRelationDao = sequelize.define('cms_comp_relation', {
  comp_code: STRING,
  comp_name: STRING,
  i_e_type: STRING,
  relation_type: STRING,
  tenant_id: INTEGER,
  status: INTEGER,
  created_date: {
    type: DATE,
    defaultValue: NOW,
  },
});
