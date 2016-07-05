import moment from 'moment';
import sequelize from './sequelize';
import { STRING, INTEGER, FLOAT, DATE, NOW } from 'sequelize';

function fillZero(num) {
  let str = '';
  const zeroCount = 5 - num.toString().length;
  for (let i = 0; i < zeroCount; i++) {
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
    },
    getDelgBillEntryCount(billStatus, tenantId, delgWhere) {
      return sequelize.query(`select count(D.delg_no) as count from
        (select * from cms_delegations ${delgWhere}) as D inner join
        cms_delegation_dispatch DD on D.delg_no = DD.delg_no and DD.recv_tenant_id = ?
        and DD.bill_status = ? left outer join cms_delegation_bill_head BH
        on D.delg_no = BH.delg_no left outer join cms_delegation_entry_head EH
        on BH.bill_no = EH.bill_no`, {
          replacements: [ tenantId, billStatus ], type: sequelize.QueryTypes.SELECT
        });
    },
    getPagedDelgBillEntry(billStatus, tenantId, delgWhere, offset, limit) {
      return sequelize.query(`select
        D.delg_no, customer_name, D.contract_no, D.invoice_no, D.bl_wb_no, D.voyage_no, pieces,
        weight, ref_delg_external_no, ref_recv_external_no, source, BH.bill_no,
        EH.id as entry_head_id, EH.entry_id, EH.comp_entry_id from
        (select * from cms_delegations ${delgWhere}) D inner join
        cms_delegation_dispatch DD on D.delg_no = DD.delg_no and DD.recv_tenant_id = ?
        and DD.bill_status = ? left outer join cms_delegation_bill_head BH
        on D.delg_no = BH.delg_no left outer join cms_delegation_entry_head EH
        on BH.bill_no = EH.bill_no limit ?, ?`, {
          replacements: [ tenantId, billStatus, offset, limit ], type: sequelize.QueryTypes.SELECT
      });
    },
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

Delegation.hasMany(Dispatch, { foreignKey: 'delg_no', constraints: false });
