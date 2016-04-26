/**
 * Copyright (c) 2012-2016 Qeemo Ltd. All Rights Reserved.
 */
/**
 * User: Kurten
 * Date: 2016-03-29
 * Time: 17:32
 * Version: 1.0
 * Description:
 */
import { isArray } from 'util';
import Orm from '../../reusable/db-util/orm';

const colsHead = ['entry_id/v', 'pre_entry_id/v', 'del_id/i', 'del_no/v', 'id_chk/v', 'i_e_flag/v', 'i_e_port/v', 'i_e_date/dt', 'd_date/dt', 'destination_port/v', 'traf_name/v', 'voyage_no/v', 'traf_mode/v', 'trade_co/v', 'trade_name/v', 'district_code/v', 'owner_code/v', 'owner_name/v', 'agent_code/v', 'agent_name/v', 'contr_no/v', 'in_ratio/e', 'bill_no/v', 'trade_country/v', 'trade_mode/v', 'cut_mode/v', 'trans_mode/v', 'container_no/e', 'pay_way/v', 'fee_mark/v', 'fee_curr/v', 'fee_rate/e', 'insur_mark/v', 'insur_curr/v', 'insur_rate/e', 'other_mark/v', 'other_curr/v', 'other_rate/e', 'pack_no/e', 'gross_wt/e', 'net_wt/e', 'wrap_type/v', 'manual_no/v', 'license_no/v', 'appr_no/v', 'note_s/v', 'decl_port/v', 'co_owner/v', 'taxy_rg_no/v', 'mnl_jgf_flag/v', 'service_fee/e', 'service_rate/e', 'relative_id/v', 'bonded_no/v', 'bp_no/v', 'typist_no/v', 'input_no/v', 'p_date/dt', 'cta_chk_result/v', 'modi_no/e', 'edi_id/v', 'status_result/v', 'declare_no/v', 'jou_event/v', 'jou_flag/v', 'edi_remark/v', 'partner_id/v', 'customs_field/v', 'entry_type/v', 'relative_manual_no/v', 'price_range/e', 'special_flag/v', 'delay_days/e', 'delay_account/e', 'hash_sign/v', 'creater_login_id/i', 'tenant_id/i', 'create_tenant_id/i', 'status/i'];

const entryHead = new Orm(colsHead, 'g_entry_head');

const colsLog = ['id/a', 'entry_id/v', 'process_name/v', 'process_date/dtt'];

const entryLog = new Orm(colsLog, 'g_entry_log');

export default {
  insertHead(head) {
    console.log(entryHead.replaceObjs, entryHead.replaceObj);
    if (isArray(head)) {
      return entryHead.replaceObjs(head);
    }
    return entryHead.replaceObj(head);
  },
  getEntryLogs(ids) {
    return entryLog.selectObjs({entry_id: ids});
  }
};
