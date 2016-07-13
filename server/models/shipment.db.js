import mysql from '../util/mysql';
import Orm from '../util/orm';

const cols = ['shipmt_no/v',
  'parent_no/v',
  'disp_id/i',
  'ref_external_no/v',
  'ref_waybill_no/v',
  'ref_entry_no/v',
  'customer_partner_id/i',
  'customer_tenant_id/i',
  'customer_name/v',
  'lsp_partner_id/i',
  'lsp_tenant_id/i',
  'lsp_name/v',
  'consigner_name/v',
  'consigner_province/v',
  'consigner_city/v',
  'consigner_district/v',
  'consigner_addr/v',
  'consigner_email/v',
  'consigner_contact/v',
  'consigner_mobile/v',
  'consignee_name/v',
  'consignee_province/v',
  'consignee_city/v',
  'consignee_district/v',
  'consignee_addr/v',
  'consignee_email/v',
  'consignee_contact/v',
  'consignee_mobile/v',
  'pickup_est_date/dtt',
  'transit_time/i',
  'deliver_est_date/dtt',
  'transport_mode_code/v',
  'transport_mode/v',
  'bol_no/v',
  'container_no/v',
  'vehicle_type/i',
  'vehicle_length/i',
  'package/v',
  'goods_type/i',
  'insure_value/e',
  'total_count/f',
  'total_weight/f',
  'total_volume/f',
  'remark/v',
  'source/v',
  'segmented/i',
  'merged/i',
  'effective/i',
  'public_key/v',
  'tenant_id/i',
  'creater_login_id/i',
  'created_date/dtt'];

const shipmtOrm = new Orm(cols, 'tms_shipments');
shipmtOrm.asalias = 'S';

function packShipmentArgsByLSP(shipmt, args) {
  const columns = [
    `ref_external_no`, `ref_waybill_no`, `ref_entry_no`, 'transport_mode_code',
    'consigner_name', `consigner_province`, `consigner_city`, `consigner_district`,
    `consigner_addr`, `consigner_email`,
    `consigner_contact`, `consigner_mobile`, `consignee_name`, `consignee_province`,
    `consignee_city`, `consignee_district`, `consignee_addr`, `consignee_email`,
    `consignee_contact`, `consignee_mobile`, `pickup_est_date`, `transit_time`,
    `deliver_est_date`, `transport_mode`, 'container_no', `vehicle_type`, `vehicle_length`,
    `package`, `goods_type`, `insure_value`, `total_count`, `total_weight`,
    `total_volume`, `remark`
  ];
  columns.forEach(col => {
    if (col in shipmt) {
      if (col === 'pickup_est_date' || col === 'deliver_est_date') {
        args.push(new Date(shipmt[col]));
      } else if (col === 'transit_time') {
        args.push(shipmt[col] || 0);
      } else {
        args.push(shipmt[col]);
      }
    } else {
      args.push(null);
    }
  });
}

export default {
  shipmentOrm: shipmtOrm,
  *genShipmtNoAsync(tenantId) {
    const subdomainSql = 'select subdomain from sso_tenants where tenant_id = ?';
    const subs = yield mysql.query(subdomainSql, [ tenantId ]);
    const tenantTmsPrefix = subs[0].subdomain.length <= 16 ? subs[0].subdomain
      : subs[0].subdomain.substr(16);
    // 最长16位企业tms代号(目前用企业子域名) + 2位年份 + 6位序号(前面补0)
    const totalLen = tenantTmsPrefix.length + 2 + 6;
    const buf = new Buffer(totalLen);
    buf.fill('0');
    const year = String(new Date().getFullYear()).substr(2);
    const shipmtnoSql = `
      select shipmt_no from tms_shipments where tenant_id = ? and parent_no is null
      order by shipmt_no desc limit 1
    `;
    const args = [ tenantId ];
    const shipmtnos = yield mysql.query(shipmtnoSql, args);
    let newnoStr = '1';
    if (shipmtnos.length === 1) {
      const biggestNo = shipmtnos[0].shipmt_no;
      newnoStr = biggestNo.substr(biggestNo.length - 1 - 6);
      newnoStr = String(parseInt(newnoStr, 10) + 1);
    }
    buf.write(tenantTmsPrefix.toUpperCase());
    buf.write(year, tenantTmsPrefix.length);
    buf.write(newnoStr, totalLen - newnoStr.length);
    return buf.toString();
  },
  getCountByType(tenantId, shipmtType, shipmtNo) {
    const args = [tenantId, shipmtType];
    let shipmtNoWhere = '';
    if (shipmtNo) {
      shipmtNoWhere = 'and (shipmt_no like ? or ref_external_no like ?)';
      args.push(`%${shipmtNo}%`, `%${shipmtNo}%`);
    }
    const sql = `select count(shipmt_no) as count from tms_shipments
      where tenant_id = ? and effective = ? ${shipmtNoWhere}`;
    return mysql.query(sql, args);
  },
  getShipmentsByType(
    tenantId, shipmtType, shipmtNo, pageSize, current,
    sortField, sortOrder
  ) {
    const args = [tenantId, shipmtType];
    let shipmtNoWhere = '';
    if (shipmtNo) {
      shipmtNoWhere = 'and (shipmt_no like ? or ref_external_no like ?)';
      args.push(`%${shipmtNo}%`, `%${shipmtNo}%`);
    }
    const sql = `select shipmt_no as \`key\`, shipmt_no, customer_name as sr_name, consigner_name,
      consigner_province, consigner_city, consigner_district, consigner_addr, consignee_name,
      consignee_province, effective, consignee_city, consignee_district, consignee_addr, ref_external_no,
      pickup_est_date, transit_time, deliver_est_date, transport_mode, total_count, total_weight,
      public_key, total_volume, created_date from tms_shipments where tenant_id = ? and effective = ?
      ${shipmtNoWhere} order by ${sortField} ${sortOrder} limit ?, ?`;
    args.push((current - 1) * pageSize, pageSize);
    return mysql.query(sql, args);
  },
  getConsignLocations(tenantId, type) {
    let sql = 'select node_id, name, node_code, province, city, district, addr, contact, email, mobile, geo_longitude, geo_latitude, geo_radius from tms_node_locations where tenant_id = ?';
    const args = [tenantId];
    if (type !== -1) {
      sql += ' and type = ?';
      args.push(type);
    }
    return mysql.query(sql, args);
  },
  getTransitModes(tenantId) {
    const sql = `select id, mode_code, mode_name from tms_param_trans_modes
      where tenant_id = ? and enabled = 1`;
    const args = [tenantId];
    return mysql.query(sql, args);
  },
  getPackagings(tenantId) {
    const sql = `select package_code, package_name from tms_param_packages
      where tenant_id = ? and enabled = 1`;
    const args = [tenantId];
    return mysql.query(sql, args);
  },
  createByLSP(shipmtNo, shipmt, spTenantId, spName, spLoginId, effective, publicKey, nowDT, trans) {
    const sql = `insert into tms_shipments (shipmt_no, lsp_tenant_id, lsp_partner_id,
      lsp_name, customer_tenant_id, customer_partner_id, customer_name,
      ref_external_no, ref_waybill_no, ref_entry_no, transport_mode_code, consigner_name,
      consigner_province, consigner_city, consigner_district, consigner_addr, consigner_email,
      consigner_contact, consigner_mobile, consignee_name, consignee_province, consignee_city,
      consignee_district, consignee_addr, consignee_email, consignee_contact, consignee_mobile,
      pickup_est_date, transit_time, deliver_est_date, transport_mode, container_no,
      vehicle_type, vehicle_length, package, goods_type, insure_value, total_count,
      total_weight, total_volume, remark, effective,
      tenant_id, creater_login_id, public_key, created_date) values (?)`;
    const args = [
      shipmtNo, spTenantId, null, spName, shipmt.customer_tenant_id,
      shipmt.customer_partner_id, shipmt.customer_name
    ];
    packShipmentArgsByLSP(shipmt, args);
    args.push(effective, spTenantId, spLoginId, publicKey, nowDT);
    return mysql.insert(sql, [args], trans);
  },
  updateDispId(shipmtNo, dispId, trans) {
    const sql = 'update tms_shipments set disp_id = ? where shipmt_no = ?';
    const args = [dispId, shipmtNo];
    return mysql.update(sql, args, trans);
  },
  updateEffective(dispId, eff, trans) {
    const sql = 'update tms_shipments set effective = ? where disp_id = ?';
    const args = [eff, dispId];
    return mysql.update(sql, args, trans);
  },
  updateDispIdEffective(shipmtNo, dispId, eff, trans) {
    const sql = 'update tms_shipments set effective = ?, disp_id = ? where shipmt_no = ?';
    const args = [eff, dispId, shipmtNo];
    return mysql.update(sql, args, trans);
  },
  upsertLocation(
    id, name, province, city, district, addr,
    email, contact, mobile, tenantId, type, trans
  ) {
    const sql = `insert into tms_node_locations(node_id, name, type, province, city, district,
      addr, contact, email, mobile, tenant_id, created_date) values (?, NOW()) on duplicate key
      update name = ?, province = ?, city = ?, district = ?, addr = ?, contact = ?, email = ?,
      mobile = ?`;
    const args = [
      [
        id, name, type, province, city, district, addr,
        contact, email, mobile, tenantId
      ],
      name, province, city,
      district, addr, contact, email, mobile
    ];
    return mysql.insert(sql, args, trans);
  },
  getShipmtInfo(shipmtNo) {
    const sql = `select shipmt_no, customer_name, customer_tenant_id, lsp_name, lsp_tenant_id,
      consigner_name, consigner_province, consigner_city, consigner_district, consigner_addr,
      consigner_contact, consigner_mobile, total_count, total_weight, total_volume, public_key,
      consignee_name, consignee_province, consignee_city, consignee_district, consignee_addr,
      consignee_contact, consignee_mobile, pickup_est_date, transit_time, deliver_est_date,
      transport_mode, transport_mode_code, vehicle_type, vehicle_length, container_no, package,
      goods_type, effective, remark, tenant_id, created_date from tms_shipments where shipmt_no = ?`;
    const args = [shipmtNo];
    return mysql.query(sql, args);
  },
  getDraftShipmt(shipmtno) {
    const sql = `select shipmt_no, ref_external_no, ref_waybill_no, ref_entry_no,
      customer_name, customer_tenant_id, customer_partner_id, lsp_tenant_id, lsp_partner_id,
      lsp_name, consigner_name, consigner_province, consigner_city, consigner_district,
      consigner_addr, consigner_email, consigner_contact, consigner_mobile, consignee_name,
      consignee_province, consignee_city, consignee_district, consignee_addr, consignee_email,
      consignee_contact, consignee_mobile, pickup_est_date, transit_time, deliver_est_date,
      transport_mode_code, transport_mode, vehicle_type, vehicle_length, container_no,
      package, goods_type, insure_value, total_count, total_weight, total_volume, remark
      from tms_shipments where shipmt_no = ?`;
    const args = [shipmtno];
    return mysql.query(sql, args);
  },
  delDraft(shipmtNo, trans) {
    const sql = 'delete from tms_shipments where shipmt_no = ?';
    const args = [shipmtNo];
    return mysql.delete(sql, args, trans);
  },
  copyShipmt(shipmt) {
    return shipmtOrm.copyWithObj(shipmt);
  },
  updateShipmt(shipmt) {
    return shipmtOrm.updateObj(shipmt);
  },
  deleteShipmt(shipmt) {
    return shipmtOrm.deleteObj(shipmt);
  },
  updateShipmtWithInfo(shipmtInfo, trans) {
    const shipmt = {};
    Object.keys(shipmtInfo).filter(key => key !== 'shipmt_no')
      .forEach(key => shipmt[key] = shipmtInfo[key]);
    shipmt.wheres = { 'shipmt_no': shipmtInfo.shipmt_no };
    return shipmtOrm.updateObj(shipmt, trans);
  },
  shipmentStatistics(tenantId) {
    const sql = `select consigner_province, consigner_city, consignee_province, consignee_city, count(*) as value
    from tms_shipments where (shipmt_no in (select shipmt_no from tms_shipment_dispatch where status=4 and (sr_tenant_id=? or sp_tenant_id=?)))
    and consigner_province is not null and consigner_city is not null and consignee_province is not null and consignee_city is not null
    group by consigner_province, consigner_city, consignee_province, consignee_city order by created_date desc limit 0,50`;
    const args = [tenantId, tenantId];
    return mysql.query(sql, args);
  },
};
