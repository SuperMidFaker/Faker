import moment from 'moment';
import sequelize from './sequelize';
import { STRING, INTEGER, FLOAT, DATE, NOW } from 'sequelize';

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
  trans_mode: STRING,
  voyage_no: STRING,
  decl_way_code: STRING,
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
    generateDelgNo(code, delgType, serialNo) {
      let result = '';
      result += code;
      result += 'C';
      result += delgType === 0 ? 'I' : 'E';
      result += moment().format('YYMMDD');
      result += fillZero(parseInt(serialNo, 10) + 1);
      return result;
    }
  }
});

export const Dispatch = sequelize.define('cms_delegation_dispatch', {
  delg_no: STRING,
  parent_id: INTEGER,
  ref_delg_external_no: STRING,
  ref_recv_external_no: STRING,
  send_login_id: INTEGER,
  send_login_name: STRING,
  send_tenant_id: INTEGER,
  send_partner_id: INTEGER,
  send_name: STRING,
  recv_login_id: INTEGER,
  recv_login_name: STRING,
  recv_tenant_id: INTEGER,
  recv_partner_id: INTEGER,
  recv_name: STRING,
  delg_time: {
    type: DATE,
    defaultValue: NOW
  },
  acpt_tiem: DATE,
  decl_tiem: DATE,
  clea_time: DATE,
  send_auditor: STRING,
  send_audit_date: DATE,
  bill_status: {
    type: INTEGER,
    defaultValue: 0
  },
  bill_no: STRING,
  entry_id: STRING,
  comp_entry_id: STRING
});