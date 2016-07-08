import mysql from '../util/mysql';
import Orm from '../util/orm';
import { shipmentOrm } from './shipment.db';
import { SHIPMENT_TRACK_STATUS, SHIPMENT_POD_STATUS } from 'common/constants';

const dispCols = [
  'id/a',
  'shipmt_no/v',
  'parent_id/i',
  'sr_login_id/i',
  'sr_login_name/v',
  'sr_partner_id/i',
  'sr_tenant_id/i',
  'sr_name/v',
  'source/i',
  'sp_partner_id/i',
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
  'pod_id/i',
  'pod_type/v',
  'auditor/v',
  'audit_date/dtt',
  'pod_status/v',
  'task_id/i',
  'task_vehicle/v',
  'vehicle_connect_type/i',
  'task_driver_id/i',
  'task_driver_name/v',
  'disp_status/i',
  'child_send_status/i',
  'status/i',
  'freight_charge/f',
  'surcharge/f',
  'special_charge/f',
  'fine/f',
  'task_remark/v'
];

// note:child_send_status only used in dispatch.api.js with doDispatch api

const dispOrm = new Orm(dispCols, 'tms_shipment_dispatch');
dispOrm.asalias = 'SD';

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
    disp = `and parent_no is NULL and ${aliasSD}.status != ?`;
    args.push(unacceptSt);
  } else {
    disp = `and ${aliasSD}.status = ?`;
    args.push(unacceptSt);
  }
  let shno = '';
  if (shipmtNo) {
    shno = `and (${aliasS}.shipmt_no like ? or ref_external_no like ?)`;
    args.push(`%${shipmtNo}%`, `%${shipmtNo}%`);
  }
  return `${disp} ${shno}`;
}

function genDispFilters(filter, tenantId) {
  const wheres = {};
  if (filter.status === 'waiting') {
    wheres[' SD.child_send_status = 0 and SD.status = 2 and SD.disp_status = 1 and SD.sp_tenant_id '] = tenantId;
  } else if (filter.status === 'dispatching') {
    wheres[' SD.disp_status = 0 and SD.sr_tenant_id '] = tenantId;
  } else if (filter.status === 'dispatched') {
    wheres[' SD.disp_status > 0 and SD.sr_tenant_id '] = tenantId;
  }
  if (filter.origin) {
    wheres[' S.segmented '] = 1; // parent_no is null
  } else {
    Object.keys(filter).forEach(key => {
      if (['status', 'origin', 'type', 'consignerStep', 'consigneeStep'].indexOf(key) === -1) {
        wheres[key] = filter[key];
      }
    });
  }

  return wheres;
}

function getTrackingShipmtClause(filters, aliasS, aliasSD, args) {
  let clause = 'and effective = 1 and (disp_status = 1 or disp_status = 2)';
  for (let i = 0; i < filters.length; i++) {
    const flt = filters[i];
    if (flt.name === 'shipmt_no') {
      clause = `${clause} and ${aliasS}.shipmt_no like ?`;
      args.push(flt.value);
    }
    if (flt.name === 'type' && flt.value !== 'all') {
      clause = `${clause} and ${aliasSD}.status = ?`;
      const targetVal = flt.value;
      if (targetVal === 'pending') {
        args.push(SHIPMENT_TRACK_STATUS.unaccepted);
      } else if (targetVal === 'accepted') {
        args.push(SHIPMENT_TRACK_STATUS.undispatched);
      } else if (targetVal === 'dispatched') {
        args.push(SHIPMENT_TRACK_STATUS.undelivered);
      } else if (targetVal === 'intransit') {
        args.push(SHIPMENT_TRACK_STATUS.intransit);
      } else {
        args.push(SHIPMENT_TRACK_STATUS.delivered);
      }
    }
  }
  return clause;
}

function getTrackingPodClause(filters, aliasS, aliasSD, args) {
  let clause = '';
  for (let i = 0; i < filters.length; i++) {
    const flt = filters[i];
    if (flt.name === 'type') {
      const targetVal = flt.value;
      if (targetVal === 'uploaded') {
        clause = `and (pod_status = ? or pod_status = ?)`;
        args.push(SHIPMENT_POD_STATUS.pending);
        args.push(SHIPMENT_POD_STATUS.rejectByUs);
      } else if (targetVal === 'submitted') {
        clause = `and (pod_status = ? or pod_status = ?)`;
        args.push(SHIPMENT_POD_STATUS.acceptByUs);
        args.push(SHIPMENT_POD_STATUS.rejectByClient);
      } else if (targetVal === 'passed') {
        clause = `and pod_status = ?`;
        args.push(SHIPMENT_POD_STATUS.acceptByClient);
      } else {
        clause = '';
      }
    }
  }
  return `and pod_type != 'none' ${clause}`;
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
  if (Array.isArray(updateInfo)) {
    return columns.filter(key => updateInfo.some(
      info => info[key] !== null
    )).map(key => {
      return `${key} = CASE id\n` + updateInfo.map(info => `WHEN ${info.id} THEN '${info[key]}'\n`)
      .join('');
    }).join('END,\n') + 'END\n';
  } else {
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
  if (ids.length === 1) {
    return `id = ${ids[0]}`;
  } else {
    return ids.map(id => `id = ${id}`).join(' OR ');
  }
}

function genGroupBy(filter) {
  let strGroup;
  const { type } = filter;
  let { consignerStep, consigneeStep } = filter;
  if (type === 'consigner') {
    consigneeStep = -1;
  } else if (type === 'consignee') {
    consignerStep = -1;
  }
  switch (consignerStep) {
    case -1:
      strGroup = '';
      break;
    case 20:
      strGroup = 'consigner_city';
      break;
    case 40:
      strGroup = 'consigner_district';
      break;
    case 60:
      strGroup = 'consigner_addr';
      break;
    case 80:
      strGroup = 'consigner_addr,consigner_name';
      break;
    default:
      strGroup = 'consigner_province';
      break;
  }

  switch (consigneeStep) {
    case -1:
      strGroup += '';
      break;
    case 20:
      strGroup += ',consignee_city';
      break;
    case 40:
      strGroup += ',consignee_district';
      break;
    case 60:
      strGroup += ',consignee_addr';
      break;
    case 80:
      strGroup += ',consignee_addr,consignee_name';
      break;
    default:
      strGroup += ',consignee_province';
      break;
  }
  if (strGroup && strGroup.substr(0, 1) === ',') {
    strGroup = strGroup.substr(1);
  }
  return strGroup;
}

export default {
  orm: dispOrm,
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
      SD.source as source, S.created_date as created_date, acpt_time, ref_external_no,
      effective from tms_shipments as S inner join tms_shipment_dispatch as SD
      on S.shipmt_no = SD.shipmt_no where SD.sp_tenant_id = ? and disp_status = ?
      ${clause} order by ${sorterFd} ${sortOrder} limit ?, ?`;
    args.push((current - 1) * pageSize, pageSize);
    return mysql.query(sql, args);
  },
  getDispatchShipmts(tenantId, filter, offset, pageSize) {
    const awhere = genDispFilters(filter, tenantId);
    let order = 'acpt_time desc';
    if (filter.status !== 'waiting') {
      order = 'disp_time desc';
    }

    const obj = {
      fields: `SD.id as \`key\`, S.shipmt_no, sr_name,
      pickup_est_date, transit_time, deliver_est_date, customer_tenant_id, lsp_tenant_id, consigner_name,
      consigner_province, consigner_city, consigner_district, consigner_addr, status,
      consignee_name, consignee_province, consignee_city, consignee_district,
      consignee_addr, transport_mode, total_count, total_weight, total_volume,
      SD.source, S.created_date, acpt_time, disp_time,pod_type, freight_charge,
      SD.sr_tenant_id, SD.sp_tenant_id,
      effective, SD.sp_tenant_id, SD.sp_name, SD.parent_id,segmented, SD.task_id, SD.task_vehicle, SD.disp_status`,
      ons1: 'S.shipmt_no = SD.shipmt_no',
      _orders: order,
      wheres: awhere,
      _limits: {min: offset, max: pageSize}
    };

    return dispOrm.leftJoin(shipmentOrm, obj);
  },
  getDispatchShipmtsCount(tenantId, filter) {
    const awhere = genDispFilters(filter, tenantId);
    const obj = {
      fields: `count(S.shipmt_no) as count`,
      ons1: 'S.shipmt_no = SD.shipmt_no',
      wheres: awhere
    };

    return dispOrm.leftJoin(shipmentOrm, obj);
  },
  createAndAcceptByLSP(
    shipmtNo, clientId, client, srPartnerId, source, tenantId, tenantName,
    spPartnerId, loginId, loginName, podType, confirmSt, dispSt, freightCharge,
    acpTime, trans
  ) {
    const sql = `insert into tms_shipment_dispatch (shipmt_no, sr_tenant_id, sr_name,
      sr_partner_id, source, sp_tenant_id, sp_name, sp_partner_id, sp_acpt_login_id,
      sp_acpt_login_name, sp_disp_login_id, sp_disp_login_name, pod_type,
      acpt_time, disp_status, status, freight_charge) values (?)`;
    const args = [
      shipmtNo, clientId, client, srPartnerId, source, tenantId, tenantName,
      spPartnerId, loginId, loginName, loginId, loginName, podType, acpTime,
      confirmSt, dispSt, freightCharge || 0.0,
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
  copyDisp(disp) {
    return dispOrm.copyWithObj(disp);
  },
  getSegmentShipmtStatus(tenantId, shipmtNo) {
    const obj = {
      fields: 'S.shipmt_no, SD.id, SD.status',
      ons1: 'SD.shipmt_no = S.shipmt_no',
      wheres: {'S.parent_no': shipmtNo}
    };
    return shipmentOrm.leftJoin(dispOrm, obj);
  },
  getShipmtWithNo(shipmtNo) {
    const sql = `SELECT tms_shipments.*, tms_shipment_dispatch.sr_name FROM tms_shipments, tms_shipment_dispatch
     WHERE tms_shipments.shipmt_no= ?`;
    const args = [shipmtNo];
    return mysql.query(sql, args);
  },
  getShipmtDispWithShipmtNo(shipmtNo) {
    const args = [shipmtNo];
    const sql = `select sd.status, sd.pickup_act_date, sd.deliver_act_date
    from tms_shipment_dispatch sd where sd.shipmt_no = ? and parent_id is NULL`;
    return mysql.query(sql, args);
  },
  getShipmtDispInfo(shipmtNo, tenantId, sourceType) {
    const args = [shipmtNo];
    let tenantClause = '';
    if (tenantId && sourceType) {
      if (sourceType === 'sr') {
        tenantClause = 'and sr_tenant_id = ?';
      } else if (sourceType === 'sp') {
        tenantClause = 'and sp_tenant_id = ?';
      }
      args.push(tenantId);
    }
    const sql = `select status, sr_name, sp_name, sp_tenant_id, disp_time, acpt_time, pickup_act_date,
      deliver_act_date, pod_recv_date, disp_status, task_vehicle, vehicle_connect_type, freight_charge
      from tms_shipment_dispatch where shipmt_no = ? ${tenantClause}`;
    return mysql.query(sql, args);
  },
  getShipmtDispWithNo(id) {
    const args = [id];
    const sql = `select sd.id, sd.parent_id, sd.shipmt_no, sd.status, sd.sr_name, sd.sr_tenant_id, sd.sr_login_id, sd.sp_name, sd.sp_tenant_id,
    s.consigner_province, s.consigner_city, s.consigner_district, s.consignee_province, s.consignee_city, s.consignee_district
    from tms_shipment_dispatch sd
    inner join tms_shipments s on s.shipmt_no=sd.shipmt_no where sd.id = ?`;
    return mysql.query(sql, args);
  },
  getTrackingCount(tenantId, filters) {
    const args = [ tenantId ];
    const whereCond = getTrackingShipmtClause(filters, 'S', 'SD', args);
    const sql = `select count(id) as count from tms_shipment_dispatch as SD inner join
      tms_shipments as S on SD.shipmt_no = S.shipmt_no where sr_tenant_id = ?
      ${whereCond}`;
    return mysql.query(sql, args);
  },
  getTrackingShipments(tenantId, filters, pageSize, current) {
    const args = [ tenantId ];
    const whereCond = getTrackingShipmtClause(filters, 'S', 'SD', args);
    const sql = `select S.shipmt_no as \`key\`, S.shipmt_no, customer_tenant_id,
      customer_partner_id, customer_name, lsp_tenant_id, lsp_partner_id, lsp_name,
      consigner_province, consigner_city, consignee_province, consignee_city,
      pickup_est_date, deliver_est_date, transit_time, transport_mode, total_count,
      total_weight, total_volume, sp_tenant_id, sp_partner_id, sp_name,
      disp_time, acpt_time, parent_no, consignee_district, consigner_district,
      pickup_act_date, deliver_act_date, pod_recv_date, pod_acpt_date, excp_level,
      excp_last_event, pod_id, pod_type, pod_status, task_vehicle, vehicle_connect_type,
      disp_status, status, id as disp_id, parent_id from tms_shipment_dispatch as SD
      inner join tms_shipments as S on SD.shipmt_no = S.shipmt_no where sr_tenant_id = ?
      ${whereCond} order by disp_time desc limit ?, ?`;
    args.push((current - 1) * pageSize, pageSize);
    return mysql.query(sql, args);
  },
  getTrackingPodCount(tenantId, filters) {
    const args = [ tenantId ];
    const whereCond = getTrackingPodClause(filters, 'S', 'SD', args);
    const sql = `select count(id) as count from tms_shipment_dispatch as SD inner join
      tms_shipments as S on SD.shipmt_no = S.shipmt_no where sr_tenant_id = ?
      and effective = 1 and disp_status = 1 ${whereCond}`;
    return mysql.query(sql, args);
  },
  getTrackingPodShipments(tenantId, filters, pageSize, current) {
    const args = [ tenantId ];
    const whereCond = getTrackingPodClause(filters, 'S', 'SD', args);
    const sql = `select S.shipmt_no as \`key\`, S.shipmt_no, customer_tenant_id,
      parent_id, customer_name, lsp_tenant_id, lsp_partner_id, lsp_name,
      consigner_province, consigner_city, consignee_province, consignee_city,
      consigner_district, consignee_district,
      pickup_est_date, deliver_est_date, transport_mode, total_count, total_weight,
      total_volume, sp_tenant_id, sp_partner_id, sp_name, disp_time, acpt_time,
      pickup_act_date, deliver_act_date, pod_recv_date, pod_acpt_date, excp_level,
      excp_last_event, pod_id, pod_type, pod_status, task_vehicle, vehicle_connect_type,
      disp_status, status, id as disp_id from tms_shipment_dispatch as SD inner join
      tms_shipments as S on SD.shipmt_no = S.shipmt_no where sr_tenant_id = ? and effective = 1
      and disp_status = 1 ${whereCond} order by pod_recv_date desc limit ?, ?`;
    args.push((current - 1) * pageSize, pageSize);
    return mysql.query(sql, args);
  },
  updateDispInfo(dispId, dispFieldValues, trans) {
    const args = [];
    const setClause = [];
    Object.keys(dispFieldValues).forEach(column => {
      setClause.push(`${column} = ?`);
      args.push(dispFieldValues[column]);
    });
    if (setClause.length > 0) {
      const sql = `update tms_shipment_dispatch set ${setClause.join(',')} where id = ?`;
      args.push(dispId);
      return mysql.update(sql, args, trans);
    }
  },
  updateDispByParentId(parentDispId, dispFieldValues, trans) {
    const args = [];
    const setClause = [];
    Object.keys(dispFieldValues).forEach(column => {
      setClause.push(`${column} = ?`);
      args.push(dispFieldValues[column]);
    });
    if (setClause.length > 0) {
      const sql = `update tms_shipment_dispatch set ${setClause.join(',')} where parent_id = ?`;
      args.push(parentDispId);
      return mysql.update(sql, args, trans);
    }
  },
  updateDispByShipmtNo(shipmtNo, dispFieldValues, trans) {
    const args = [];
    const setClause = [];
    Object.keys(dispFieldValues).forEach(column => {
      setClause.push(`${column} = ?`);
      args.push(dispFieldValues[column]);
    });
    if (setClause.length > 0) {
      const sql = `update tms_shipment_dispatch set ${setClause.join(',')} where shipmt_no = ?`;
      args.push(shipmtNo);
      return mysql.update(sql, args, trans);
    }
  },
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
    const sql = `DELETE FROM tms_shipment_manifest WHERE ${removeClause}`;
    return mysql.delete(sql);
  },
  getShipmtsGrouped(tenantId, filter) {
    const awhere = {
      'S.segmented = 0 and SD.status = 2 and SD.disp_status = 1 and SD.sp_tenant_id': tenantId
    };
    const strGroup = genGroupBy(filter);
    const obj = {
      fields: `SD.id as \`key\`, count(S.shipmt_no) as count, consigner_name,
      consigner_province, consigner_city, consigner_district, consigner_addr,
      consignee_name, consignee_province, consignee_city, consignee_district,
      consignee_addr, sum(total_count) as total_count, sum(total_weight) as total_weight, sum(total_volume) as total_volume`,
      ons1: 'S.shipmt_no = SD.shipmt_no',
      _orders: 'acpt_time desc',
      _groups: strGroup,
      wheres: awhere
    };

    return dispOrm.leftJoin(shipmentOrm, obj);
  }
};
