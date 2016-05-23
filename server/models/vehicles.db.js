/**
 * Copyright (c) 2012-2016 Qeemo Ltd. All Rights Reserved.
 */
/**
 * User: Kurten
 * Date: 2016-05-10
 * Time: 15:53
 * Version: 1.0
 * Description:
 */
import mysql from '../../reusable/db-util/mysql';

export default {
  getVehicles(tenantId, offset, size) {
    const args = [tenantId, offset, size];
    const sql = 'select v.vehicle_id, v.plate_number, v.connect_type, v.trailer_number, v.type, v.load_weight, v.load_volume, v.length, v.vproperty, v.tenant_id, v.device_id, v.driver_id, v.created_date, d.name, d.phone, d.remark from tms_vehicles v left join tms_drivers d on d.driver_id = v.driver_id where v.tenant_id = ? limit ?,?';
    return mysql.query(sql, args);
  },
  getVehiclesCount(tenantId) {
    return mysql.query('select count(vehicle_id) as count from tms_vehicles where tenant_id = ?', [tenantId]);
  }
};
