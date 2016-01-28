import mysql from '../../reusable/db-util/mysql';
import sqlFormat from '../../reusable/db-util/sqlFormat';

export default {
  getIdTotalCount(tenantId,filters ) {
    const args = [];
    const filterClause =sqlFormat.concatFilterSql(filters, args);
    const sql = `select count(del_no) as count from g_bus_delegate where 1=1 ${filterClause}`;
    console.log ( sql, args );
    return mysql.query(sql, args);
  },
  getPagedIdsByCorp(current, pageSize, filters, sortField, sortOrder, tenantId) {
    const args = [];
    const filterClause = sqlFormat.concatFilterSql(filters, args);
    let sortColumn = sortField || 'del_id';
    const sortClause = ` order by ${sortColumn} ${sortOrder === 'descend' ? 'desc' : 'asc'} `;
    const sql = `select del_id as \`key\`,del_no,\`status\`,customs_status,del_date,invoice_no,bill_no,send_tenant_id,rec_tenant_id,creater_login_id,rec_login_id,rec_del_date,master_customs,declare_way_no,usebook,ems_no,trade_mode,urgent,delegate_type,tenant_id,other_note,created_date,update_date from g_bus_delegate where 1=1 ${filterClause} ${sortClause}  limit ?, ?`;
    args.push((current - 1) * pageSize, pageSize);
    console.log(sql, args);
    return mysql.query(sql,args);
  },
  getStatusCount(tenantId,status,filters) {
    const args = [status];
    const filterClause =sqlFormat.concatFilterSql(filters, args);
    const sql = `select count(status) as count from g_bus_delegate where status=? ${filterClause}`;
    console.log(sql, args);
    return mysql.query(sql, args);
  }
}
