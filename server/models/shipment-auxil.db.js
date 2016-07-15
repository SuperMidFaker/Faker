import mysql from '../util/mysql';
import sequelize from './sequelize';
import { STRING, INTEGER, BOOLEAN } from 'sequelize';

export const TmsParamPackage = sequelize.define('tms_param_packages', {
  tenant_id: INTEGER,
  package_code: STRING,
  package_name: STRING,
  enabled: {
    type: BOOLEAN,
    defaultValue: true,
  },
});

export const TmsParamTransMode = sequelize.define('tms_param_trans_modes', {
  tenant_id: INTEGER,
  mode_code: STRING,
  mode_name: STRING,
  enabled: {
    type: BOOLEAN,
    defaultValue: true,
  },
});

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
    const args = [type, signStatus, signRemark, photos, submitter];
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
    return mysql.insert(sql, [args], trans);
  },
  createShipmentPointRel(shipmtNo, pointId, trans) {
    const sql = `insert into tms_shipment_point_relation(shipmt_no, point_id)
      values (?)`;
    const args = [shipmtNo, pointId];
    return mysql.insert(sql, [args], trans);
  },
  getShipmentPoints(shipmtNo) {
    const sql = `select P.* from tms_tracking_points P inner join tms_shipment_point_relation PR
      on PR.point_id = P.id where PR.shipmt_no = ? order by P.location_time desc`;
    const args = [shipmtNo];
    return mysql.query(sql, args);
  },
  getLastPoint(shipmtNo) {
    const sql = `select P.location_time from tms_tracking_points P inner join tms_shipment_point_relation PR
      on PR.point_id = P.id where PR.shipmt_no = ? order by P.location_time desc limit 1`;
    const args = [shipmtNo];
    return mysql.query(sql, args);
  },
  presetTmsPackages(tenantId) {
    const packages = [
      ['BULK', '散装'],
      ['WBOX', '木箱'],
      ['PBOX', '纸箱'],
      ['PALLET', '托盘'],
      ['BOTTLE', '桶装'],
      ['PARCEL', '包裹'],
      ['OTHER', '其它'],
    ];
    const promises = [];
    packages.forEach(pck => {
      promises.push(TmsParamPackage.create({
        tenant_id: tenantId,
        package_code: pck[0],
        package_name: pck[1],
      }));
    });
    return Promise.all(promises);
  },
  presetTmsModes(tenantId) {
    const modes = [
      ['FTL', '整车'],
      ['LTL', '零担'],
      ['AIR', '空运'],
      ['EXP', '快递'],
      ['CTN', '集装箱'],
    ];
    const promises = [];
    modes.forEach(md => {
      promises.push(TmsParamTransMode.create({
        tenant_id: tenantId,
        mode_code: md[0],
        mode_name: md[1],
      }));
    });
    return Promise.all(promises);
  },
};
