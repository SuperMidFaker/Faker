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
  getTaskTotalCount(loginId, tenantId, currentStatus, filters) {
      const args = [tenantId];
      let statusClause = "";
      if (currentStatus != -1) {
        statusClause = " and customs_status= ?";
        args.push(currentStatus);
      }
      if (loginId != -1) {
        statusClause += " and rec_login_id= ?";
        args.push(loginId);
      }
      const filterClause = concatFilterSql(filters, args);
      console.log(filters,args);
      const sql = `select count(del_id) as count from g_bus_delegate where tenant_id = ? ${statusClause} ${filterClause}`;

      return mysql.query(sql, args);
    },

    getTasks(current, currentStatus, loginId, filters, pageSize, tenantId, sortField, sortOrder) {
      const args = [tenantId];
      let statusClause = "";
      if (currentStatus != -1) {
        statusClause = " and customs_status= ?";
        args.push(currentStatus);
      }
      if (loginId != -1) {
        statusClause += " and rec_login_id= ?";
        args.push(loginId);
      }
      const filterClause = concatFilterSql(filters, args);

      let sortColumn = sortField || 'del_id';
      const sortClause = ` order by ${sortColumn} ${sortOrder === 'descend' ? 'desc' : 'asc'} `;

      const sql = `select T1.name as short_name, del_id as \`key\`,del_no,\`status\`,customs_status,DATE_FORMAT(del_date,'%Y-%m-%d %H:%i') del_date,invoice_no,bill_no,send_tenant_id,rec_tenant_id,creater_login_id,rec_login_id,DATE_FORMAT(rec_del_date,'%Y-%m-%d %H:%i') rec_del_date,DATE_FORMAT(T.created_date,'%Y-%m-%d %H:%i') created_date,master_customs,declare_way_no, usebook,ems_no,trade_mode, urgent,delegate_type,other_note from g_bus_delegate as T LEFT JOIN sso_partners AS T1 ON T.tenant_id=T1.tenant_id AND T.rec_tenant_id=T1.partner_tenant_id
      where T.tenant_id= ? ${statusClause} ${filterClause} ${sortClause}  limit ?, ?`;

      args.push((current - 1) * pageSize, pageSize);
      console.log(sql, args);
      return mysql.query(sql, args);
    },
    getStatusCount(loginId, tenantId, status, filters) {
      const args = [loginId, tenantId, status];
      const filterClause = concatFilterSql(filters, args);
      const sql = `select count(customs_status) as count from g_bus_delegate where rec_login_id=? and tenant_id=? and customs_status=? ${filterClause}`;
      console.log(sql, args);
      return mysql.query(sql, args);
    }
}
