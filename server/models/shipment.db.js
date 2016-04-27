import mysql from '../../reusable/db-util/mysql';

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
  }
};
