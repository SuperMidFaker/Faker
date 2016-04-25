import mysql from '../../reusable/db-util/mysql';

function putInComposition(f, args) {
  let sql = '';
  if (f.name === 'del_no') {
    sql = 'geh.del_no like ?';
    args.push('%' + f.value + '%');
  } else if (f.name === 'bill_no') {
    sql = 'geh.bill_no like ?';
    args.push('%' + f.value + '%');
  } else if (f.name === 'entry_id') {
    sql = 'geh.entry_id like ?';
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
  return sqlClause === ' and ' ? '' : sqlClause;
}
export default {
  getIdTotalCount(filters, tenantId) { //获取满足条件的总记录数
      const args = [tenantId, tenantId, tenantId];
      const filterClause = concatFilterSql(filters, args);
      const sql = `select count(*) as count
      from g_entry_head geh inner join g_entry_log gel on geh.entry_id = gel.entry_id
      inner join g_bus_delegate gbd on geh.del_no = gbd.del_no
      where (gbd.tenant_id= ? or gbd.send_tenant_id= ? or gbd.tenant_id =? ) and gbd.delegate_type= 0  ${filterClause}`;
      console.log(sql, args);
      return mysql.query(sql, args);
    },
    getPagedIdsByCorp(current, pageSize, filters, sortField, sortOrder, tenantId) { //分页显示数据
      const args = [tenantId, tenantId, tenantId];

      const filterClause = concatFilterSql(filters, args);
      let sortColumn = sortField || 'entry_id';
      const sortClause = ` order by ${sortColumn} ${sortOrder === 'descend' ? 'desc' : 'asc'} `;
      
      const sql = `select gel.entry_id,gel.process_name,
      DATE_FORMAT(gel.process_date,'%Y-%m-%d %H:%i') process_date,
      gel.id as \`key\`,geh.del_no,geh.pre_entry_id,
      gbd.bill_no,gbd.rec_tenant_name,gbd.send_tenant_name,gbd.send_tenant_id,gbd.rec_tenant_id,gbd.tenant_id
      from g_entry_head geh inner join g_entry_log gel on geh.entry_id = gel.entry_id
      inner join g_bus_delegate gbd on geh.del_no = gbd.del_no
      where (gbd.tenant_id= ? or gbd.send_tenant_id= ? or gbd.tenant_id =? ) and gbd.delegate_type= 0  ${filterClause} ${sortClause}  limit ?, ?`;
      args.push((current - 1) * pageSize, pageSize);
      console.log(sql, args);
      return mysql.query(sql, args);
    },
    getcustomsBrokers(tenantId) {
      const args = [tenantId, tenantId];
      const sql = `SELECT t.name as short_name,t.partner_tenant_id as \`key\`  FROM sso_partners as t
                    inner join sso_partnerships as t1 on t.partner_tenant_id=t1.partner_tenant_id and (t.tenant_id=t1.tenant_id or t.send_tenant_id=t1.send_tenant_id)
                    where t1.type=1 and (t.tenant_id= ? or t.send_tenant_id= ?) order by t.partner_tenant_id`;
      console.log(sql, args);
      return mysql.query(sql, args);
    },
}
