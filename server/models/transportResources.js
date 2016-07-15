import mysql from '../util/mysql';
import { generateUpdateClauseWithInfo } from './utils';

const driverColumns = [
  'name', 'phone', 'remark', 'vehicle_id', 'tenant_id', 'status',
];

const carColumns = [
  'vehicle_id', 'plate_number', 'trailer_number', 'type', 'length',
  'load_weight', 'load_volume', 'vproperty', 'driver_id',
  'tenant_id',
];

const nodeColumns = [
  'name', 'node_code', 'type', 'province', 'city',
  'district', 'addr', 'contact', 'email', 'mobile', 'remark',
  'tenant_id',
];

function generateValuesWithInfoAndColumns({ columns, info }) {
  return columns.map(col => {
    if (info[col] === undefined) {
      return 'NULL';
    } else {
      return `'${info[col]}'`;
    }
  });
}

export function addDriverWithInfo(driverInfo) {
  const values = generateValuesWithInfoAndColumns({ info: driverInfo, columns: driverColumns });
  const sql = `INSERT INTO tms_drivers(${driverColumns.join(', ')}, created_date) VALUES (${values.join(', ')}, NOW());`;
  return mysql.insert(sql);
}

export function getDriverList(tenantId) {
  const sql = `
    SELECT d.driver_id, name, phone, d.remark, d.status, d.vehicle_id, plate_number
    FROM tms_drivers AS d
    LEFT JOIN tms_vehicles AS v ON d.vehicle_id = v.vehicle_id
    WHERE d.tenant_id = ${tenantId};
    `;
  return mysql.query(sql);
}

export function updateDriverWithInfo({ driverInfo, driverId }) {
  const updateClause = generateUpdateClauseWithInfo(driverInfo, driverColumns);
  const sql = `UPDATE tms_drivers SET ${updateClause} WHERE driver_id = ${driverId};`;
  return mysql.update(sql);
}

export function addCarWithInfo(carInfo) {
  const values = generateValuesWithInfoAndColumns({ info: carInfo, columns: carColumns });
  const sql = `INSERT INTO tms_vehicles(${carColumns}, status, created_date) VALUES (${values.join(', ')}, 0, NOW());`;
  return mysql.insert(sql);
}

export function getCarList(tenantId) {
  const sql = `
    SELECT plate_number, trailer_number, type, length, load_weight, load_volume, vproperty, v.status, v.driver_id,  v.vehicle_id, d.name AS driver_name
    FROM tms_vehicles AS v
    LEFT JOIN tms_drivers AS d ON v.driver_id = d.driver_id
    WHERE v.tenant_id = ${tenantId};
  `;
  return mysql.query(sql);
}

export function updateCarWithInfo({ carInfo, carId }) {
  const updateClause = generateUpdateClauseWithInfo(carInfo, [...carColumns, 'status']);
  const sql = `UPDATE tms_vehicles SET ${updateClause} WHERE vehicle_id = ${carId}`;
  return mysql.query(sql);
}

export function getNodeList(tenantId) {
  const sql = `
    SELECT node_id, name, node_code, ref_partner_id, ref_partner_name, type, CONCAT_WS('/', province, city, district) AS region,
    province, city, district, addr, geo_longitude, contact, email, mobile, remark
    FROM tms_node_locations
    WHERE tenant_id = ${tenantId};
  `;
  return mysql.query(sql);
}

export function addNode(nodeInfo) {
  const values = generateValuesWithInfoAndColumns({ columns: nodeColumns, info: nodeInfo });
  const sql = `INSERT INTO tms_node_locations(${nodeColumns.join(' ,')}, created_date) VALUES(${values.join(', ')}, NOW());`;
  return mysql.insert(sql);
}

export function updateNodeWithInfo({ nodeInfo, nodeId }) {
  const updateClause = generateUpdateClauseWithInfo(nodeInfo, nodeColumns);
  const sql = `UPDATE tms_node_locations SET ${updateClause} WHERE node_id = ${nodeId}`;
  return mysql.update(sql);
}

export function removeNodeWithId(nodeId) {
  const sql = `DELETE FROM tms_node_locations WHERE node_id = ${nodeId};`;
  return mysql.delete(sql);
}

export function searchVehicleWithNumber(tenantId, vehicleNumber) {
  const sql = `SELECT * FROM tms_vehicles WHERE tenant_id = ${tenantId} AND plate_number = '${vehicleNumber}'`;
  return mysql.query(sql);
}
