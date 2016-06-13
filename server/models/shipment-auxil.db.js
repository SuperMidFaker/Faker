import mysql from '../util/mysql';

export default {
  createLog(name, remark, trans) {
    const sql = `insert into tms_shipment_logs(op_name, remark, created_date)
      values (?, NOW())`;
    const args = [name, remark];
    return mysql.insert(sql, [args], trans);
  },
  createDispLogRel(logId, dispId, trans) {
    const sql = 'insert into tms_disp_log_relations(disp_id, log_id) values (?)';
    const args = [dispId, logId];
    return mysql.insert(sql, [args], trans);
  },
  getPod(podId) {
    const sql = 'select sign_status, sign_remark, photos, submitter from tms_shipment_pods where id = ?';
    const args = [podId];
    return mysql.query(sql, args);
  },
  createPod(type, signStatus, signRemark, photos, submitter, trans) {
    const sql = `insert into tms_shipment_pods(type, sign_status, sign_remark,
      photos, submitter, submit_date, created_date) values (?, NOW(), NOW())`;
    const args = [ type, signStatus, signRemark, photos, submitter ];
    return mysql.insert(sql, [args], trans);
  },
  createPoint(point, tenantId, trans) {
    const sql = `insert into tms_tracking_points(\`from\`, province,
      city, district, address, location_time, tenant_id, created_date)
      values (?, NOW())`;
    const args = [
      point.from, point.province, point.city, point.district,
      point.address, new Date(point.location_time), tenantId,
    ];
    return mysql.insert(sql, [ args ], trans);
  },
  createShipmentPointRel(shipmtNo, pointId, trans) {
    const sql = `insert into tms_shipment_point_relation(shipmt_no, point_id)
      values (?)`;
    const args = [ shipmtNo, pointId ];
    return mysql.insert(sql, [ args ], trans);
  },
  getShipmentPoints(shipmtNo) {
    const sql = `select P.* from tms_tracking_points P inner join tms_shipment_point_relation PR
      on PR.point_id = P.id where PR.shipmt_no = ?`;
    const args = [ shipmtNo ];
    return mysql.query(sql, args);
  },
};
