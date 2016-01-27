import mysql from '../../reusable/db-util/mysql';

export default {
  getIdTotalCount(tenantId) {
    const sql = `select count(del_no) as count from g_bus_delegate`;
    return mysql.query(sql);
  },
  getPagedIdsByCorp(current, pageSize, tenantId) {
    const sql = `select * from g_bus_delegate 
      limit ?, ?`;
    const args = [(current - 1) * pageSize, pageSize];
    return mysql.query(sql,args);
  }
}
