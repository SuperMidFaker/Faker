import { STRING, INTEGER, DATE, TEXT, NOW } from 'sequelize';
import sequelize from './sequelize';
import mysql from '../util/mysql';

export const DispEventRelation = sequelize.define('tms_disp_event_relations', {
  id: {
    type: INTEGER,
    primaryKey: true
  },
  disp_id: INTEGER,
  event_id: INTEGER,
}, {
    freezeTableName: true
});
