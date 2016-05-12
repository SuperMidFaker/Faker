import mysql from '../../reusable/db-util/mysql';

function packShipmentArgsByLSP(shipmt, args) {
  const columns = [
    `ref_external_no`, `ref_waybill_no`, `ref_entry_no`, 'transport_mode_code',
    'consigner_name', `consigner_province`, `consigner_city`, `consigner_district`,
    `consigner_addr`, `consigner_email`,
    `consigner_contact`, `consigner_mobile`, `consignee_name`, `consignee_province`,
    `consignee_city`, `consignee_district`, `consignee_addr`, `consignee_email`,
    `consignee_contact`, `consignee_mobile`, `pickup_est_date`, `transit_time`,
    `deliver_est_date`, `transport_mode`, `vehicle_type`, `vehicle_length`,
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

export default {
  *genShipmtNoAsync(tenantId) {
    // 3位企业tms代号 + 2位年份 + 6位序号(前面补0)
    const buf = new Buffer(3+2+6);
    buf.fill('0');
    const tenantTmsPrefix = 'NLO'; // todo get by tenantid
    const year = String(new Date().getFullYear()).substr(2);
    const shipmtSumSql = 'select count(shipmt_no) as sum from tms_shipments where tenant_id = ? and parent_no is null';
    const args = [tenantId];
    const counts = yield mysql.query(shipmtSumSql, args);
    const sumStr = String(counts[0].sum + 1);
    buf.write(tenantTmsPrefix);
    buf.write(year, tenantTmsPrefix.length);
    buf.write(sumStr, 11 - sumStr.length);
    return buf.toString();
  },
  getCountByType(tenantId, shipmtType, shipmtNo) {
    const args = [tenantId, shipmtType];
    let shipmtNoWhere = '';
    if (shipmtNo) {
      shipmtNoWhere = 'and shipmt_no like ?';
      args.push(shipmtNoWhere);
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
      shipmtNoWhere = 'and shipmt_no like ?';
      args.push(shipmtNoWhere);
    }
    const sql = `select shipmt_no as \`key\`, shipmt_no, customer_name as sr_name, consigner_name,
      consigner_province, consigner_city, consigner_district, consigner_addr, consignee_name,
      consignee_province, effective, consignee_city, consignee_district, consignee_addr,
      pickup_est_date, transit_time, deliver_est_date, transport_mode, total_count, total_weight,
      total_volume, created_date from tms_shipments where tenant_id = ? and effective = ?
      ${shipmtNoWhere} order by ${sortField} ${sortOrder} limit ?, ?`;
    args.push((current - 1) * pageSize, pageSize);
    return mysql.query(sql, args);
  },
  getConsignLocations(tenantId, type) {
    let sql = 'select node_id, name, province, city, district, addr, contact, email, mobile, postcode from tms_node_locations where tenant_id = ?';
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
  createByLSP(shipmtNo, shipmt, spTenantId, spName, spLoginId, effective, trans) {
    const sql = `insert into tms_shipments (shipmt_no, lsp_tenant_id, lsp_name,
      customer_tenant_id, customer_name,
      ref_external_no, ref_waybill_no, ref_entry_no, transport_mode_code, consigner_name,
      consigner_province, consigner_city, consigner_district, consigner_addr, consigner_email,
      consigner_contact, consigner_mobile, consignee_name, consignee_province, consignee_city,
      consignee_district, consignee_addr, consignee_email, consignee_contact, consignee_mobile,
      pickup_est_date, transit_time, deliver_est_date, transport_mode, vehicle_type, vehicle_length,
      package, goods_type, insure_value, total_count, total_weight, total_volume, remark, effective,
      tenant_id, creater_login_id, created_date) values (?, NOW())`;
    const args = [shipmtNo, spTenantId, spName, shipmt.client_id, shipmt.client];
    packShipmentArgsByLSP(shipmt, args);
    args.push(effective, spTenantId, spLoginId);
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
  createGoods(goods, shipmtNo, tenantId, loginId, trans) {
    const sql = `insert into tms_shipment_manifest(name, goods_no, package,
      length, width, height, amount, weight, volume, remark, shipmt_no, tenant_id,
      creater_login_id, created_date) values (?, NOW())`;
    const args = packGoodsArgs(goods);
    args.push(shipmtNo, tenantId, loginId);
    return mysql.insert(sql, [args], trans);
  },
};
