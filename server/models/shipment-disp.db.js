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
  'pod_type/v',
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

function packGoodsArgs(goods) {
  const columns = [
    `name`, `goods_no`, `package`, `length`, `width`, `height`, `amount`, `weight`, `volume`, `remark`
  ];
  const args = [];
  columns.forEach(col => {
    if (col in goods) {
      args.push(goods[col]);
    } else {
      args.push(null);
    }
  });
  return args;
}

function getShipmtClause(shipmtDispType, unacceptSt, shipmtNo, aliasS, aliasSD, args) {
  let disp = '';
  if (shipmtDispType === false) {
    disp = `and ${aliasSD}.status != ?`;
    args.push(unacceptSt);
  } else {
    disp = `and ${aliasSD}.status = ?`;
    args.push(unacceptSt);
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

function getTrackingShipmtClause(filters, aliasS, aliasSD, args) {
  let clause = '';
  for (let i = 0; i < filters.length; i++) {
    const flt = filters[i];
    if (flt.name === 'shipmt_no') {
      clause = `${clause} and ${aliasS}.shipmt_no like ?`;
      args.push(flt.value);
    }
  }
  return clause;
}

/**
 *
 * if updateInfo is array, execute multi update one time, such as below:
 *
 * UPDATE categories
 *  SET
 *    display_order = CASE id
 *      WHEN 1 THEN 3
 *      WHEN 2 THEN 4
 *      WHEN 3 THEN 5
 *    END,
 *    title = CASE id
 *    WHEN 1 THEN 'New Title 1'
 *    WHEN 2 THEN 'New Title 2'
 *    WHEN 3 THEN 'New Title 3'
 *    END
 *  WHERE id IN (1,2,3)
 *
 * else excute normal UPDATE
 *
 * @param {updateInfo, columns}
 * @return {String} update statement
 *
 */
function generateUpdateClauseWithInfo(updateInfo, columns) {
  if(Array.isArray(updateInfo)) {
    return columns.filter(key => updateInfo.some(info => info[key] !== null)).map(key => {
      return `${key} = CASE id\n` + updateInfo.map(info => info[key] ? `WHEN ${info.id} THEN '${info[key]}'\n` : '').join("");
    }).join("END,\n") + 'END\n';
  }else {
    return columns.filter(key => updateInfo[key] !== null).map(key => `${key} = '${updateInfo[key]}'`).join(', ');
  }
}

/**
 * Generate delete clause by ids, like below:
 *
 * `id = ids[1] OR id = ids[2] OR id = ids[3] ...`
 *
 * @param {ids} Array
 * @return {String} delete where clause
 *
 */
function generateDeleteClauseWithIds(ids) {
  if(ids.length == 1) {
    return `id = ${ids[0]}`
  }else {
    return ids.map(id => `id = ${id}`).join(' OR ');
  }
}

export default {
  getFilteredTotalCount(tenantId, shipmtDispType, shipmtNo, dispSt, unacceptSt) {
    const args = [tenantId, dispSt];
    const clause = getShipmtClause(shipmtDispType, unacceptSt, shipmtNo, 'S', 'SD', args);
    const sql = `select count(S.shipmt_no) as count from tms_shipments as S
      inner join tms_shipment_dispatch as SD on S.shipmt_no = SD.shipmt_no
      where SD.sp_tenant_id = ? and disp_status = ? ${clause}`;
    return mysql.query(sql, args);
  },
  getFilteredShipments(
    tenantId, shipmtDispType, shipmtNo, dispSt, pageSize, current,
    sortField, sortOrder, unacceptSt
  ) {
    const args = [tenantId, dispSt];
    const clause = getShipmtClause(shipmtDispType, unacceptSt, shipmtNo, 'S', 'SD', args);
    const sorterFd = sortField === 'created_date' ? 'S.created_date' : 'acpt_time';
    const sql = `select SD.id as \`key\`, S.shipmt_no as shipmt_no, sr_name,
      pickup_est_date, transit_time, deliver_est_date, consigner_name,
      consigner_province, consigner_city, consigner_district, consigner_addr,
      consignee_name, consignee_province, consignee_city, consignee_district,
      consignee_addr, transport_mode, total_count, total_weight, total_volume,
      SD.source as source, S.created_date as created_date, acpt_time,
      effective from tms_shipments as S inner join tms_shipment_dispatch as SD
      on S.shipmt_no = SD.shipmt_no where SD.sp_tenant_id = ? and disp_status = ?
      ${clause} order by ${sorterFd} ${sortOrder} limit ?, ?`;
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
      SD.source, S.created_date, acpt_time, disp_time,pod_type, freight_charge,
      effective, SD.sp_tenant_id, SD.sp_name, SD.parent_id from tms_shipments as S
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
  updateLogAction(action, dispId, trans) {
    const sql = `update tms_shipment_dispatch set log_last_action = ?, log_last_date = NOW()
      where id = ?`;
    const args = [action, dispId];
    return mysql.update(sql, args, trans);
  },
  updateRejectStatus(dispSt, dispId, trans) {
    const sql = 'update tms_shipment_dispatch set disp_status = ? where id = ?';
    const args = [dispSt, dispId];
    return mysql.update(sql, args, trans);
  },
  addDisp(disp, trans) {
    return dispOrm.insertObj(disp, trans);
  },
  updateDisp(disp, trans) {
    return dispOrm.updateObj(disp, trans);
  },
  deleteDisp(disp, trans) {
    return dispOrm.deleteObj(disp, trans);
  },
  getShipmtWithNo(shipmtNo) {
    const sql = `SELECT tms_shipments.*, tms_shipment_dispatch.sr_name FROM tms_shipments, tms_shipment_dispatch
     WHERE tms_shipments.shipmt_no= ?`;
    const args = [shipmtNo];
    return mysql.query(sql, args);
  },
  getShipmtDispInfo(shipmtNo) {
    const sql = 'select source, status from tms_shipment_dispatch where shipmt_no = ?';
    const args = [shipmtNo];
    return mysql.query(sql, args);
  },
  updateShipmtWithInfo(shipmtInfo, trans) {
    const columns = [
      `ref_external_no`, `ref_waybill_no`, `ref_entry_no`, 'transport_mode_code',
      'consigner_name', `consigner_province`, `consigner_city`, `consigner_district`,
      `consigner_addr`, `consigner_email`,
      `consigner_contact`, `consigner_mobile`, `consignee_name`, `consignee_province`,
      `consignee_city`, `consignee_district`, `consignee_addr`, `consignee_email`,
      `consignee_contact`, `consignee_mobile`, `transit_time`,
      `transport_mode`, `vehicle_type`, `vehicle_length`,
      `package`, `goods_type`, `insure_value`, `total_count`, `total_weight`,
      `total_volume`, `remark`
    ];
    const updateClause = generateUpdateClauseWithInfo(shipmtInfo, columns);
    const sql = `UPDATE tms_shipments SET ${updateClause} WHERE shipmt_no = ?`;
    const args = [shipmtInfo.shipmt_no];
    return mysql.update(sql, args, trans);
  },
  getTrackingCount(tenantId, filters) {
    const args = [ tenantId ];
    const filters = getTrackingShipmtClause(filters, 'S', 'SD', args);
    const sql = `select count(id) as count from tms_shipment_dispatch as SD inner join
      tms_shipments as S on SD.shipmt_no = S.shipmt_no where sr_tenant_id = ?`;
    return mysql.query(sql, args);
  },
  // getTrackingShipments
  createGoods(goodslist, shipmtNo, tenantId, loginId, trans) {
    const sql = `insert into tms_shipment_manifest(name, goods_no, package,
      length, width, height, amount, weight, volume, remark, shipmt_no, tenant_id,
      creater_login_id, created_date) values ?`;
    const argargs = [];
    const createdDt = new Date();
    for (let i = 0; i < goodslist.length; i++) {
      const goods = goodslist[i];
      const args = packGoodsArgs(goods);
      args.push(shipmtNo, tenantId, loginId, createdDt);
      argargs.push(args);
    }
    return mysql.insert(sql, [argargs], trans);
  },
  updateGoodsWithInfo(goodsInfo) {
    const columns = [
      `name`, `goods_no`, `package`, `length`, `width`, `height`, `amount`, `weight`, `volume`, `remark`
    ];
    const updateClause = generateUpdateClauseWithInfo(goodsInfo, columns);
    const sql = `UPDATE tms_shipment_manifest SET ${updateClause} WHERE id IN (${goodsInfo.map(info => info.id).join(',')})`;
    return mysql.update(sql);
  },

  getShipmtGoodsWithNo(shipmtNo) {
    const sql = `SELECT id as \`key\`, id, name, goods_no, package, length, width,
      height, amount, weight, volume, remark FROM tms_shipment_manifest WHERE shipmt_no = ?`;
    const args = [shipmtNo];
    return mysql.query(sql, args);
  },

  removeGoodsWithIds(ids) {
    const removeClause = generateDeleteClauseWithIds(ids);
    const sql = `DELETE FROM tms_shipment_manifest WHERE ${removeClause}`
    return mysql.delete(sql);
  }
};
