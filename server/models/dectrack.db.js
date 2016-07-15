import db from '../util/mysql';


export default {
  getTrackByExternalNo(no, tenantId) {
    return db.query('select b.urgent_mark, b.depart_date, b.pre_arrival_date, b.arrival_date, b.transit_date, b.notice_date, b.eta_date, b.ata_date, b.presentation_date, b.dec_rec_date, b.pre_release_date, b.trans_rec_date, b.transit_use_time, b.dec_use_time, b.all_use_time, b.des_use_time, b.cancel_mark, b.cancel_content, b.cancel_note, b.delay_mark, b.delay_note, b.dec_note from g_dec_bill_head a left join g_dec_track b on b.del_no = a.del_no where a.external_no = ? and a.tenant_id = ?', [no, tenantId]);
  },
};
