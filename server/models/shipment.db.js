import mysql from '../../reusable/db-util/mysql';

function packShipmentArgsByLSP(shipmt, args) {
  const columns = [
    `ref_external_no`, `ref_waybill_no`, `ref_entry_no`, 'consigner_name',
    `consigner_province`, `consigner_city`, `consigner_district`, `consigner_addr`,
    `consigner_email`,
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
  getConsignLocations(tenantId, type) {
    const sql = `select node_id, name, province, city, district, addr, contact, email, mobile,
      postcode from tms_node_locations where tenant_id = ? and type = ?`;
    const args = [tenantId, type];
    return mysql.query(sql, args);
  },
  getTransitModes(tenantId) {
    const sql = `select mode_code, mode_name from tms_param_trans_modes
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
  createByLSP(shipmtNo, shipmt, spTenantId, spName, spLoginId, effecive, trans) {
    const sql = `insert into tms_shipments (shipmt_no, lsp_tenant_id, lsp_name,
      customer_tenant_id, customer_name,
      ref_external_no, ref_waybill_no, ref_entry_no, consigner_name,
      consigner_province, consigner_city, consigner_district, consigner_addr, consigner_email,
      consigner_contact, consigner_mobile, consignee_name, consignee_province, consignee_city,
      consignee_district, consignee_addr, consignee_email, consignee_contact, consignee_mobile,
      pickup_est_date, transit_time, deliver_est_date, transport_mode, vehicle_type, vehicle_length,
      package, goods_type, insure_value, total_count, total_weight, total_volume, remark, effective,
      tenant_id, creater_login_id, created_date) values (?, NOW())`;
    const args = [shipmtNo, spTenantId, spName, shipmt.client_id, shipmt.client];
    packShipmentArgsByLSP(shipmt, args);
    args.push(effecive, spTenantId, spLoginId);
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
