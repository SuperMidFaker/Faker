import mysql from '../../reusable/db-util/mysql';
import Orm from '../../reusable/db-util/orm';

const dispCols = [
  'id/a',
  'shipmt_no/v',
  'parent_id/i',
  'sr_login_id/i',
  'sr_login_name/v',
  'sr_tenant_id/i',
  'sr_name/v',
  'source/i',
  'sp_tenant_id/i',
  'sp_name/v',
  'sp_acpt_login_id/i',
  'sp_acpt_login_name/v',
  'sp_disp_login_id/i',
  'sp_disp_login_name/v',
  'disp_time/dtt',
  'acpt_time/dtt',
  'pickup_act_date/dtt',
  'deliver_act_date/dtt',
  'pod_recv_date/dt',
  'pod_acpt_date/dt',
  'log_last_action/v',
  'log_last_date/dt',
  'excp_level/v',
  'excp_last_event/v',
  'pod_status/v',
  'task_id/i',
  'task_vehicle/v',
  'disp_status/i',
  'status/i',
  'freight_charge/f',
  'surcharge/f',
  'special_charge/f',
  'fine/f',
  'oper_remark/v'
];

const dispOrm = new Orm(dispCols, 'tms_shipment_dispatch');

function getShipmtClause(shipmtDispType, shipmtNo, aliasS, aliasSD, args) {
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
  return `${disp} ${shno}`;
}

function genDispFilters(filter) {
  const arr = [];
  if (filter.status === 'waiting') {
    arr.push(' SD.sp_tenant_id = ? and SD.status = 2 and SD.disp_status = 1 ');
  } else if (filter.status === 'dispatching') {
    arr.push('SD.sr_tenant_id = ? and SD.status = 1 and SD.disp_status = 0 ');
  } else if (filter.status === 'dispatched') {
    arr.push('SD.sr_tenant_id = ? and SD.disp_status = 1 ');
  }
  return arr.join('');
}

export default {
  getFilteredTotalCount(tenantId, shipmtDispType, shipmtNo, dispSt) {
    const args = [tenantId, dispSt];
    const clause = getShipmtClause(shipmtDispType, shipmtNo, 'S', 'SD', args);
    const sql = `select count(S.shipmt_no) as count from tms_shipments as S
      inner join tms_shipment_dispatch as SD on S.shipmt_no = SD.shipmt_no
      where SD.sp_tenant_id = ? and disp_status = ? ${clause}`;
    return mysql.query(sql, args);
  },
  getFilteredShipments(
    tenantId, shipmtDispType, shipmtNo, order, dispSt, pageSize, current
  ) {
    const args = [tenantId, dispSt];
    const clause = getShipmtClause(shipmtDispType, shipmtNo, 'S', 'SD', args);
    let orderClause = '';
    if (order === 'created') {
      orderClause = 'order by S.created_date desc';
    } else if (order === 'accepted') {
      orderClause = 'order by acpt_time desc';
    }
    const sql = `select SD.id as \`key\`, S.shipmt_no as shipmt_no, sr_name,
      pickup_est_date, transit_time, deliver_est_date, consigner_name,
      consigner_province, consigner_city, consigner_district, consigner_addr,
      consignee_name, consignee_province, consignee_city, consignee_district,
      consignee_addr, transport_mode, total_count, total_weight, total_volume,
      SD.source as source, S.created_date as created_date, acpt_time,
      effective from tms_shipments as S inner join tms_shipment_dispatch as SD
      on S.shipmt_no = SD.shipmt_no where SD.sp_tenant_id = ? and disp_status = ?
      ${clause} ${orderClause} limit ?, ?`;
    args.push((current - 1) * pageSize, pageSize);
    return mysql.query(sql, args);
  },
  getDispatchShipmts(tenantId, filter, offset, pageSize) {
    const args = [tenantId];
    const awhere = genDispFilters(filter, args);
    args.push(offset, pageSize);
    const sql = `select SD.id as \`key\`, S.shipmt_no, sr_name,
      pickup_est_date, transit_time, deliver_est_date, consigner_name,
      consigner_province, consigner_city, consigner_district, consigner_addr,
      consignee_name, consignee_province, consignee_city, consignee_district,
      consignee_addr, transport_mode, total_count, total_weight, total_volume,
      SD.source, S.created_date, acpt_time,
      effective from tms_shipments as S
      right join tms_shipment_dispatch as SD on S.shipmt_no = SD.shipmt_no
      where ${awhere} limit ?, ?`;
    return mysql.query(sql, args);
  },
  getDispatchShipmtsCount(tenantId, filter) {
    const args = [tenantId];
    const awhere = genDispFilters(filter, args);
    const sql = `select count(S.shipmt_no) as count from tms_shipments as S
      right join tms_shipment_dispatch as SD on S.shipmt_no = SD.shipmt_no
      where ${awhere}`;
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
  },
  addDisp(disp, trans) {
    return dispOrm.insertObj(disp, trans);
  },
  updateDisp(disp, trans) {
    return dispOrm.updateObj(disp, trans);
  }
};
