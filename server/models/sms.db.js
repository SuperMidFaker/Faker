import mysql from '../../reusable/db-util/mysql';
export default {
  getSmsById(smsId) {
    var sql = 'select code from sso_sms where id = ?';
    var args = [smsId];
    return mysql.query(sql, args);
  },
  insertSms(phone, code, type) {
    var sql = 'insert into sso_sms(phone, code, created_date, type) values(?, ?, NOW(), ?)';
    var args = [phone, code, type];
    return mysql.insert(sql, args);
  }
}

