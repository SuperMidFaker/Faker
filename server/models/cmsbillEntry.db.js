import sequelize from './sequelize';
import { STRING, INTEGER, DATE, NOW, DECIMAL as decimal } from 'sequelize';
import { Delegation } from './cmsDelegation.db';

export const BillHeadDao = sequelize.define('cms_delegation_bill_head', {
  bill_no: STRING,
  delg_no: STRING,
  delg_type: INTEGER,
  pre_entry_id: STRING,
  category: STRING,
  invoice_no: STRING,
  master_customs: STRING,
  entry_id: STRING,
  i_e_port: STRING,
  ems_no: STRING,
  i_e_date: DATE,
  d_date: DATE,
  trade_co: STRING,
  trade_name: STRING,
  trans_mode: STRING,
  trans_spec: STRING,
  bl_wb_no: STRING,
  trade_mode: STRING,
  rm_mode: STRING,
  soe_mode: STRING,
  license_no: STRING,
  trade_country: STRING,
  depart_country: STRING,
  dest_port: STRING,
  district_code: STRING,
  appr_no: STRING,
  trx_mode: STRING,
  fee_curr: STRING,
  fee_rate: decimal(9, 5),
  fee_mark: STRING,
  insur_curr: STRING,
  insur_rate: decimal(9, 5),
  insur_mark: STRING,
  other_curr: STRING,
  other_rate: decimal(9, 5),
  other_mark: STRING,
  contract_no: STRING,
  pack_count: decimal(5, 5),
  pack_type: STRING,
  gross_wt: decimal(9, 5),
  net_wt: decimal(9, 5),
  tax_ratio: decimal(9, 5),
  container_no: STRING,
  cert_mark: STRING,
  usage: STRING,
  note: STRING,
  voyage_no: STRING,
  library_no: STRING,
  yard_code: STRING,
  storeno: STRING,
  ref_entry_no: STRING,
  ref_record_no: STRING,
  trade_term: STRING,
  cont_40: decimal(9, 5),
  cont_20: decimal(9, 5),
  cont_lcl: decimal(9, 5),
  jzx_type: STRING,
  mawb_no: STRING,
  hawb_no: STRING,
  forwarder_name: STRING,
  forwarder_code: STRING,
  owner_code: STRING,
  owner_name: STRING,
  agent_code: STRING,
  agent_name: STRING,
  creater_login_id: INTEGER,
  created_date: {
    type: DATE,
    defaultValue: NOW,
  },
}, {
  classMethods: {
    genBillNo(serialNo, ietype) {
      const code = ietype === 'import' ? 'IL' : 'EL';
      const year = String(new Date().getFullYear()).slice(-2);
      const serial = String(parseInt(serialNo, 10) + 1);
      const buf = new Buffer(10);
      buf.fill('0');
      buf.write(code);
      buf.write(year, 2);
      buf.write(serial, 10 - serial.length);
      return buf.toString();
    },
  },
});

export const BillBodyDao = sequelize.define('cms_delegation_bill_list', {
  bill_no: STRING,
  ems_no: STRING,
  list_g_no: INTEGER,
  em_g_no: INTEGER,
  cop_g_no: STRING,
  code_t: STRING,
  code_s: STRING,
  g_name: STRING,
  g_model: STRING,
  country_code: STRING,
  element: STRING,
  qty: decimal(18, 5),
  unit: STRING,
  factor_1: decimal(18, 5),
  unit_1: STRING,
  factor_2: decimal(18, 5),
  unit_2: STRING,
  dec_total: decimal(18, 5),
  dec_price: decimal(18, 5),
  curr: STRING,
  gross_wt: decimal(18, 5),
  wet_wt: decimal(18, 5),
  usage: STRING,
  rm_mode: STRING,
  reg_code: STRING,
  bom_version: STRING,
  invoice_no: STRING,
  order_no: STRING,
  note: STRING,
  ent_seq_no: STRING,
  ent_g_no: decimal(5, 0),
  org_seq_no: STRING,
  org_g_no: decimal(5, 0),
  special_hscode: INTEGER,
  custom_control: INTEGER,
  creater_login_id: INTEGER,
  created_date: {
    type: DATE,
    defaultValue: NOW,
  },
});

export const EntryHeadDao = sequelize.define('cms_delegation_entry_head', {
  comp_entry_id: STRING,
  entry_id: STRING,
  bill_no: STRING,
  delg_no: STRING,
  pre_entry_id: STRING,
  category: STRING,
  invoice_no: STRING,
  master_customs: STRING,
  i_e_port: STRING,
  ems_no: STRING,
  i_e_date: DATE,
  d_date: DATE,
  trade_co: STRING,
  trade_name: STRING,
  trans_mode: STRING,
  trans_spec: STRING,
  bl_wb_no: STRING,
  trade_mode: STRING,
  rm_mode: STRING,
  soe_mode: STRING,
  license_no: STRING,
  trade_country: STRING,
  depart_country: STRING,
  dest_port: STRING,
  district_code: STRING,
  appr_no: STRING,
  trx_mode: STRING,
  fee_curr: STRING,
  fee_rate: decimal(9, 5),
  fee_mark: STRING,
  insur_curr: STRING,
  insur_rate: decimal(9, 5),
  insur_mark: STRING,
  other_curr: STRING,
  other_rate: decimal(9, 5),
  other_mark: STRING,
  contract_no: STRING,
  pack_count: decimal(5, 5),
  pack_type: STRING,
  gross_wt: decimal(9, 5),
  net_wt: decimal(9, 5),
  tax_ratio: decimal(9, 5),
  container_no: STRING,
  cert_mark: STRING,
  usage: STRING,
  note: STRING,
  voyage_no: STRING,
  library_no: STRING,
  yard_code: STRING,
  storeno: STRING,
  ref_entry_no: STRING,
  ref_record_no: STRING,
  trade_term: STRING,
  cont_40: decimal(9, 5),
  cont_20: decimal(9, 5),
  cont_lcl: decimal(9, 5),
  jzx_type: STRING,
  mawb_no: STRING,
  hawb_no: STRING,
  forwarder_name: STRING,
  forwarder_code: STRING,
  owner_code: STRING,
  owner_name: STRING,
  agent_code: STRING,
  agent_name: STRING,
  creater_login_id: INTEGER,
  created_date: {
    type: DATE,
    defaultValue: NOW,
  },
});

export const EntryBodyDao = sequelize.define('cms_delegation_entry_list', {
  head_id: INTEGER,
  list_g_no: INTEGER,
  em_g_no: INTEGER,
  cop_g_no: STRING,
  code_t: STRING,
  code_s: STRING,
  g_name: STRING,
  g_model: STRING,
  country_code: STRING,
  element: STRING,
  qty: decimal(18, 5),
  unit: STRING,
  factor_1: decimal(18, 5),
  unit_1: STRING,
  factor_2: decimal(18, 5),
  unit_2: STRING,
  dec_total: decimal(18, 5),
  dec_price: decimal(18, 5),
  curr: STRING,
  gross_wt: decimal(18, 5),
  wet_wt: decimal(18, 5),
  usage: STRING,
  rm_mode: STRING,
  reg_code: STRING,
  bom_version: STRING,
  note: STRING,
  creater_login_id: INTEGER,
  created_date: {
    type: DATE,
    defaultValue: NOW,
  },
});

Delegation.hasMany(BillHeadDao, { foreignKey: 'delg_no', constraints: false });
BillHeadDao.hasMany(EntryHeadDao, { foreignKey: 'bill_no', constraints: false });
