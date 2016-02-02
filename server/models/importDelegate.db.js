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
  } else if (f.name === 'short_name') {
    sql = `rec_tenant_id in (${f.value})`;
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
  getIdTotalCount(currentStatus,filters,tenantId ) {//获取满足条件的总记录数
    const args = [tenantId];
     let statusClause="";
    
    if(currentStatus!=-1)
    {
       statusClause = " and \`status\`= ?";
       args.push(currentStatus);
    }
    
    const filterClause =concatFilterSql(filters, args);
    const sql = `select count(del_no) as count from g_bus_delegate where tenant_id= ? ${statusClause} ${filterClause}`;
    console.log ( sql, args );
    return mysql.query(sql, args);
  },
  getPagedIdsByCorp(current, pageSize, filters, sortField, sortOrder, currentStatus,tenantId) {//分页显示数据
    const args = [tenantId];
    
     let statusClause="";
    console.log(currentStatus);
    if(currentStatus!=-1)
    {
       statusClause = " and \`status\`= ?";
       args.push(currentStatus);
    }
    
    const filterClause = concatFilterSql(filters, args);
    let sortColumn = sortField || 'del_id';
    
    const sortClause = ` order by ${sortColumn} ${sortOrder === 'descend' ? 'desc' : 'asc'} `;
    const sql = `select T1.short_name, del_id as \`key\`,del_no,\`status\`,customs_status,DATE_FORMAT(del_date,'%Y-%m-%d %H:%i') del_date,invoice_no,bill_no,send_tenant_id,rec_tenant_id,creater_login_id,rec_login_id,DATE_FORMAT(rec_del_date,'%Y-%m-%d %H:%i') rec_del_date,master_customs,declare_way_no,usebook,ems_no,trade_mode,urgent,delegate_type,other_note from g_bus_delegate as T LEFT JOIN sso_partners AS T1 ON T.tenant_id=T1.tenant_id AND T.rec_tenant_id=T1.partner_tenant_id
    where T.tenant_id= ? ${statusClause} ${filterClause} ${sortClause}  limit ?, ?`;
    args.push((current - 1) * pageSize, pageSize);
    console.log(sql, args);
    return mysql.query(sql,args);
  },
  getStatusCount(tenantId,status,filters) {
    const args = [tenantId,status];
    const filterClause =concatFilterSql(filters, args);
    const sql = `select count(status) as count from g_bus_delegate where tenant_id=? and status=? ${filterClause}`;
    console.log(sql, args);
    return mysql.query(sql, args);
  },
  deleteId(idkey) {
      const args = [idkey];
      const sql = `delete from g_bus_delegate where del_id= ?`;
      console.log(sql, args);
      return mysql.query(sql, args);
  },
  getcustomsBrokers(tenantId) {
         const args = [tenantId];
         const sql=`SELECT t.short_name,t.partner_tenant_id as \`key\`  FROM sso_partners as t
                    inner join sso_partner_types as t1 on t.partner_tenant_id=t1.partner_tenant_id and t.tenant_id=t1.tenant_id 
                    where t1.type=1 and t.tenant_id= ? order by t.partner_tenant_id`
        console.log(sql, args);
        return mysql.query(sql, args);
  }
}
