import mysql from '../../reusable/db-util/mysql';

function putInComposition(f, args) {
  let sql = '';
  if (f.name === 'del_no') {
    sql = 'del_no like ?';
    args.push('%' + f.value + '%');
  } else if (f.name === 'bill_no') {
    sql = 'bill_no like ?';
    args.push('%' + f.value + '%');
  } else if (f.name === 'invoice_no') {
    sql = 'invoice_no like ?';
    args.push('%' + f.value + '%');
  } 
  return sql;
}

function concatFilterSql(filters, args) {
  let sqlClause = '';
  for (let i = 0, len = filters.length; i < len; i++) {
    sqlClause += ' and '; // 第一层级与关系
    const f = filters[i];
    if (f.length > 0) { // 第二层级为或关系
      sqlClause += '(';
      for (let j = 0, lenf = f.length; j < lenf; j++) {
        sqlClause += putInComposition(f[j], args);
        sqlClause += ' or ';
      }
      sqlClause = sqlClause.slice(0, -3);
      sqlClause += ')';
    } else {
      sqlClause += putInComposition(f, args);
    }
  }
  return sqlClause;
}
export default {
  getIdTotalCount(currentStatus,filters ) {//获取满足条件的总记录数
    const args = [];
     let statusClause="";
    
    if(currentStatus!=-1)
    {
       statusClause = " and \`status\`= ?";
       args.push(currentStatus);
    }
    
    const filterClause =concatFilterSql(filters, args);
    const sql = `select count(del_no) as count from g_bus_delegate where 1=1 ${statusClause} ${filterClause}`;
    console.log ( sql, args );
    return mysql.query(sql, args);
  },
  getPagedIdsByCorp(current, pageSize, filters, sortField, sortOrder, currentStatus) {//分页显示数据
    const args = [];
    
     let statusClause="";
    
    if(currentStatus!=-1)
    {
       statusClause = " and \`status\`= ?";
       args.push(currentStatus);
    }
    
    const filterClause = concatFilterSql(filters, args);
    let sortColumn = sortField || 'del_id';
    
    const sortClause = ` order by ${sortColumn} ${sortOrder === 'descend' ? 'desc' : 'asc'} `;
    const sql = `select del_id as \`key\`,del_no,\`status\`,customs_status,DATE_FORMAT(del_date,'%Y-%m-%d %H:%i') del_date,invoice_no,bill_no,send_tenant_id,rec_tenant_id,creater_login_id,rec_login_id,DATE_FORMAT(rec_del_date,'%Y-%m-%d %H:%i') rec_del_date,master_customs,declare_way_no,usebook,ems_no,trade_mode,urgent,delegate_type,tenant_id,other_note,created_date,update_date from g_bus_delegate where 1=1 ${statusClause} ${filterClause} ${sortClause}  limit ?, ?`;
    args.push((current - 1) * pageSize, pageSize);
    console.log(sql, args);
    return mysql.query(sql,args);
  },
  getStatusCount(tenantId,status,filters) {
    const args = [status];
    const filterClause =concatFilterSql(filters, args);
    const sql = `select count(status) as count from g_bus_delegate where status=? ${filterClause}`;
    console.log(sql, args);
    return mysql.query(sql, args);
  },
  deleteId(idkey) {
      const args = [idkey];
      const sql = `delete from g_bus_delegate where del_id=?`;
      console.log(sql, args);
      return mysql.query(sql, args);
  }
}
