import Orm from '../../reusable/db-util/orm';

const colsHead = ['del_id/i', 'external_no/v', 'creater_login_id/i/def_0', 'customer_id/v/nn', 'templat_no/v', 'year/i', 'month/i', 'week/i', 'dec_mode/v', 'tenant_id/i/nn', 'create_tenant_id/i/nn', 'del_no/v', 'delegate_type/i', 'pre_entry_id/v', 'category/v', 'declare_way_no/v', 'seq_no/v', 'input_date/dtt', 'customer_name/v', 's_bus_no/v', 'invoice_no/v', 'master_customs/v', 'entry_id/v', 'i_e_port/v', 'ems_no/v', 'i_e_date/dt', 'd_date/dt', 'trade_co/v', 'trade_name/v', 'traf_mode/v', 'traf_name/v', 'bill_no/v', 'owner_code/v', 'owner_name/v', 'trade_mode/v', 'cut_mode/v', 'pay_mode/v', 'license_no/v', 'trade_country/v', 'distinate_port/v', 'district_code/v', 'appr_no/v', 'trans_mode/v', 'fee_curr/v', 'fee_rate/e', 'fee_mark/v', 'insur_curr/v', 'insur_rate/e', 'insur_mark/v', 'other_curr/v', 'other_rate/e', 'other_mark/v', 'contr_no/v', 'pack_no/e', 'wrap_type/v', 'gross_wt/e', 'net_wt/e', 'jzxsl/v', 'cert_mark/v', 'use_to/v', 'note/v', 'voyage_no/v', 'agent_tenant_id/i', 'agent_code/v', 'agent_name/v', 'library_no/v', 'prdtid/v', 'storeno/v', 'ramanualno/v', 'radeclno/v', 'trade_term/v', 'forwarder/v', 'cont_40/e', 'cont_20/e', 'cont_lcl/e', 'partner_id/v', 'jzx_type/v', 'order_date/dtt', 'mawb_no/v', 'hawb_no/v'];

const decBillHead = new Orm(colsHead, 'g_dec_bill_head');

const colsList = ['del_no/v', 'ems_no/v', 'list_g_no/i', 'em_g_no/i', 'cop_g_no/v', 'code_t/v', 'code_s/v', 'g_name/v', 'g_model/v', 'country_code/v', 'element/v', 'qty/e', 'unit/v', 'factor_1/e', 'unit_1/v', 'factor_2/e', 'unit_2/v', 'dec_total/e', 'dec_price/e', 'curr/v', 'gross_wt/e', 'wet_wt/e', 'use_type/v', 'duty_mode/v', 'control_ma/v', 'bom_version/v', 'invoice_no/v', 'order_no/v', 'note/v', 'ent_seq_no/v', 'ent_g_no/e', 'org_seq_no/v', 'org_g_no/e', 'id/a', 'del_id/i', 'tenant_id/i', 'create_tenant_id/i'];

const decBillList = new Orm(colsList, 'g_dec_bill_list');

export default {
  insertHead(head) {
    return decBillHead.insertObj(head);
  },
  insertLists(lists) {
    return decBillList.insertObjs(lists);
  },
  getHeadByExternalNo(externalNo) {
    return decBillHead.selectObjs({wheres: {external_no: externalNo, _limits: {min: 1}}});
  }
};
