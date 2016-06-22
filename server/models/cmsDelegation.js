import moment from 'moment';
import sequelize from './sequelize';
import { STRING, INTEGER, DATE, NOW } from 'sequelize';

function fillZero(num) {
  let str = '';
  let zeroCount = 5 - num.toString().length;
  for (let i = 0; i<zeroCount; i++) {
    str += '0';
  }
  str += num;
  return str;
}

export const Delegation = sequelize.define('cms_delegations', {
  delg_no: {
    type: STRING,
    primaryKey: true
  },
  delg_type: INTEGER,
  invoice_no: STRING,
  contract_no: STRING,
  bl_wb_no: STRING,
  pieces: STRING,
  weight: FLOAT,
  trans_node: STRING,
  voyage_no: STRING,
  devl_way_code: STRING,
  ems_no: STRING,
  trade_mode: STRING,
  remark: STRING,
  customer_tenant_id: INTEGER,
  customer_partner_id: INTEGER,
  customer_name: STRING,
  ccb_tenant_id: INTEGER,
  ccb_partner_id: INTEGER,
  ccb_name: STRING,
  tenant_id: INTEGER,
  creater_login_id: INTEGER,
  created_date: {
    type: DATE,
    defaultValue: NOW
  }
}, {
  classMethods: {
    generateDelgNo(code, delgType, lastDelgNo) {
      let result = '';
      const serialNo = lastDelgNo.slice(-5);
      result += code;
      result += 'C';
      result += delgType === 0 ? 'I' : 'E';
      result += moment().format('YYMMDD');
      result += fillZero(parseInt(serialNo, 10) + 1);
      return result;
    }
  }
});