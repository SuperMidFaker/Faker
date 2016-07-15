import { STRING, INTEGER, DATE, TEXT, NOW } from 'sequelize';
import sequelize from './sequelize';
import mysql from '../util/mysql';

export const ShipmentEvent = sequelize.define('tms_shipment_events', {
  id: {
    type: INTEGER,
    primaryKey: true,
  },
  tenant_id: INTEGER,
  login_id: INTEGER,
  login_name: STRING,
  type: STRING,    // accepted, sent, pickedup, delivered, completed
  content: STRING,
  created_date: DATE,
}, {
    freezeTableName: true,
});
