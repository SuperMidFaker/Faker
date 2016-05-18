import mysql from '../../reusable/db-util/mysql';
import { generateUpdateClauseWithInfo } from './utils';

const driverColumns = [
  'name', 'phone', 'remark', 'vehicle_id', 'tenant_id', 'created_date'
];

const carColumns = [
  'vehicle_id', 'plate_number', 'trailer_number', 'type', 'length', 'load_weight', 'load_volume', 'vproperty', 'driver_id'
];

function generateValuesWithInfoAndColumns({columns, info}) {
  return columns.map(col => {
    if (info[col] === undefined) {
      return "NULL";
    } else {
      return `'${info[col]}'`;
    }
  });
}

export function addDriverWithInfo(driverInfo) {
  const values = generateValuesWithInfoAndColumns({info: driverInfo, columns: driverColumns});
  const sql = `INSERT INTO tms_drivers(${driverColumns.join(', ')}) VALUES (${values.join(', ')});`;
  return mysql.insert(sql);
}

export function getDriverList() {
  const sql = `SELECT driver_id, name, phone, remark FROM tms_drivers;`;
  return mysql.query(sql);
}

export function updateDriverWithInfo({driverInfo, driverId}) {
  const updateClause = generateUpdateClauseWithInfo(driverInfo, driverColumns);
  const sql = `UPDATE tms_drivers SET ${updateClause} WHERE driver_id = ${driverId};`;
  return mysql.update(sql);
}

export function addCarWithInfo(carInfo) {
  const values = generateValuesWithInfoAndColumns({info: carInfo, columns: carColumns});
  const sql = `INSERT INTO tms_vehicles(${carColumns}) VALUES (${values.join(', ')});`;
  return mysql.insert(sql);
}

export function getCarList() {
  const sql = `
    SELECT plate_number, trailer_number, type, length, load_weight, load_volume, vproperty, v.driver_id,  v.vehicle_id, d.name AS driver_name
    FROM tms_vehicles AS v 
    INNER JOIN tms_drivers AS d ON v.driver_id = d.driver_id;
  `;
  console.log(sql);
  return mysql.query(sql);
}

export function updateCarWithInfo({carInfo, carId}) {
  const updateClause = generateUpdateClauseWithInfo(carInfo, carColumns);
  const sql = `UPDATE tms_vehicles SET ${updateClause} WHERE vehicle_id = ${carId}`;
  console.log(sql);
  return mysql.query(sql);
}
