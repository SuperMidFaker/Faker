import mysql from '../../reusable/db-util/mysql';

function getShipmtClause(shipmtEff, shipmtDispType, shipmtNo, aliasS, aliasSD, args) {
  let eff = '';
  if (shipmtEff !== undefined && shipmtEff !== null) {
    eff = `and ${aliasS}.effective = ?`;
    args.push(shipmtEff);
  }
  let disp = '';
  if (shipmtDispType !== undefined && shipmtDispType !== null) {
    disp = `and ${aliasSD}.status = ?`;
    args.push(shipmtDispType);
  }
  let shno = '';
  if (shipmtNo) {
    shno = `and ${aliasS}.shipmt_no like ?`;
    args.push(`%${shipmtNo}%`);
  }
  return `${eff} ${disp} ${shno}`;
}
export default {
  getFilteredTotalCount(tenantId, shipmtEff, shipmtDispType, shipmtNo, dispSt) {
    const args = [tenantId, dispSt];
    const clause = getShipmtClause(
      shipmtEff, shipmtDispType, shipmtNo,
      'S', 'SD', args
    );
    const sql = `select count(S.shipmt_no) as count from tms_shipments as S
      inner join tms_shipment_dispatch as SD on S.shipmt_no = SD.shipmt_no
      where SD.sp_tenant_id = ? and disp_status = ? ${clause}`;
    return mysql.query(sql, args);
  },
  getFilteredShipments(tenantId, shipmtEff, shipmtDispType, shipmtNo, dispSt, pageSize, current) {
    const args = [tenantId, dispSt];
    const clause = getShipmtClause(
      shipmtEff, shipmtDispType, shipmtNo,
      'S', 'SD', args
    );
    const sql = `select SD.id as \`key\`, S.shipmt_no as shipmt_no, sr_name,
      pickup_est_date, transit_time, deliver_est_date, consigner_name,
      consigner_province, consigner_city, consigner_district, consigner_addr,
      consignee_name, consignee_province, consignee_city, consignee_district,
      consignee_addr, transport_mode, total_count, total_weight, total_volume,
      SD.source as source, S.created_date as created_date, acpt_time,
      effective from tms_shipments as S
      inner join tms_shipment_dispatch as SD on S.shipmt_no = SD.shipmt_no
      where SD.sp_tenant_id = ? and disp_status = ? ${clause} limit ?, ?`;
    args.push((current - 1) * pageSize, pageSize);
    return mysql.query(sql, args);
  },
  createAndAcceptByLSP(
    shipmtNo, clientId, client, source, tenantId, tenantName,
    loginId, loginName, confirmSt, dispSt, freightCharge, acpTime,
    trans
  ) {
    const sql = `insert into tms_shipment_dispatch (shipmt_no, sr_tenant_id, sr_name, source,
      sp_tenant_id, sp_name, sp_acpt_login_id, sp_acpt_login_name, sp_disp_login_id, sp_disp_login_name,
      acpt_time, disp_status, status, freight_charge) values (?)`;
    const args = [
      shipmtNo, clientId, client, source, tenantId, tenantName,
      loginId, loginName, loginId, loginName, acpTime, confirmSt,
      dispSt, freightCharge || 0.0
    ];
    return mysql.insert(sql, [args], trans);
  },
  updateAcptDisperInfo(dispId, acpterId, acpterName, disperId, disperName, dispSt, status, trans) {
    const sql = `update tms_shipment_dispatch set sp_acpt_login_id = ?, sp_acpt_login_name = ?,
      sp_disp_login_id = ?, sp_disp_login_name = ?, acpt_time = NOW(), disp_status = ?,
      status = ? where id = ?`;
    const args = [acpterId, acpterName, disperId, disperName, dispSt, status, dispId];
    return mysql.update(sql, args, trans);
  }
};
