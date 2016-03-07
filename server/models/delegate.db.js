import mysql from '../../reusable/db-util/mysql';
function putInCompositions(f, args) {
  let sql = '';
  if (f.name === 'del_no') {
    sql = 'del_no like ?';
    args.push('%' + f.value + '%');
  }else if (f.name === 'invoice_no') {
    sql = 'invoice_no like ?';
    args.push('%' + f.value + '%');
  } else if (f.name === 'bill_no') {
    sql = 'bill_no like ?';
    args.push('%' + f.value + '%');
}
  return sql;
}
function concatFilterSqls(filters, args) {
  let sqlClause = '';
  for (let i = 0, len = filters.length; i < len; i++) {
    sqlClause += ' and '; // 第一层级与关系
    const f = filters[i];
    if (f.length > 0) { // 第二层级为或关系
      sqlClause += '(';
      for (let j = 0, lenf = f.length; j < lenf; j++) {
        sqlClause += putInCompositions(f[j], args);
        sqlClause += ' or ';
      }
      sqlClause = sqlClause.slice(0, -3);
      sqlClause += ')';
    } else {
      sqlClause += putInCompositions(f, args);
    }
  }
  return sqlClause;
}



export default {
    getTenantdelegateCount(tenantId, filters,currentStatus) {
    const args = [tenantId];
      let statusClause = "";
      if (currentStatus != -1) {
        statusClause = " and \`status\`= ?";
        args.push(currentStatus);
      }
    const filterClause = concatFilterSqls(filters, args); //" where tenant_id = ?";
    const sql = `SELECT count(del_id) as num from g_bus_delegate where tenant_id = ? ${statusClause} ${filterClause}`;
    console.log(sql, args);
    return mysql.query(sql, args); //getTenantdelegateCount_test
   },
    getPageddelegateInCorp(tenantId, current, pageSize, filters, sortField, sortOrder,currentStatus) {
    const args = [tenantId];
    let statusClause = "";
    console.log(currentStatus);
      if (currentStatus != -1) {
        statusClause = " and \`status\`= ?";
        args.push(currentStatus);
      }
    const filterClause = concatFilterSqls(filters, args);
    let sortColumn = sortField || 'del_id';
    let sortClause = '';
    if (sortColumn === 'del_no') {
      sortColumn = 'del_no';
    }
    sortClause = ` order by ${sortColumn} ${sortOrder === 'descend' ? 'desc' : 'asc'} `;
    const sql = `select T1.short_name, del_id as \`key\`,del_no,\`status\`,customs_status,DATE_FORMAT(del_date,'%Y-%m-%d %H:%i') del_date,invoice_no,bill_no,send_tenant_id,rec_tenant_id,creater_login_id,rec_login_id,DATE_FORMAT(rec_del_date,'%Y-%m-%d %H:%i') rec_del_date,master_customs,declare_way_no, usebook,ems_no,trade_mode, urgent,delegate_type,other_note from g_bus_delegate as T LEFT JOIN sso_partners AS T1 ON T.tenant_id=T1.tenant_id AND T.rec_tenant_id=T1.partner_tenant_id
      where T.tenant_id= ? ${statusClause}  ${filterClause} ${sortClause}
      limit ?, ?`;
    args.push((current - 1) * pageSize, pageSize);
    console.log(sql, args);
    return mysql.query(sql, args);
  },
    getdelegateUnsent(tenantId, current, pageSize, filters, sortField, sortOrder) {
    const args = [tenantId];
    const filterClause = concatFilterSqls(filters, args);
    let sortColumn = sortField;
    let sortClause = '';
    if (sortColumn === 'del_no') {
      sortColumn = 'del_no';
      sortClause = ` order by ${sortColumn} ${sortOrder === 'descend' ? 'desc' : 'asc'} `;
    }
    const sql = `SELECT del_id as \`key\`,del_no,STATUS,invoice_no,del_date,created_date,master_customs,declare_way_no,bill_no,usebook,trade_mode,urgent,other_note from g_bus_delegate where tenant_id = ? and status=2  ${filterClause} ${sortClause}
      limit ?, ?`;
    args.push((current - 1) * pageSize, pageSize);
    console.log(sql, args);
    return mysql.query(sql, args);
  },
  updateStatus(id, status, trans) {
    const sql = `update g_bus_delegate set status = ? where del_id = ?`;
    const args = [status, id];
    return mysql.update(sql, args, trans);
  },
  deletedelegate(pid, trans) {
    const sql = 'delete from g_bus_delegate where del_id = ?';
    const args = [pid];
    return mysql.delete(sql, args, trans);
  },
  updatedelegate(del_no, invoice_no,master_customs,declare_way_no,bill_no,usebook,trade_mode,urgent,other_note,key,trans) {
    const sql = 'update g_bus_delegate set del_no = ?,invoice_no = ?,master_customs=?,declare_way_no=?,bill_no=?,usebook=?,trade_mode=?,urgent=?,other_note=?  where del_id = ?';
    const args = [del_no, invoice_no,master_customs,declare_way_no,bill_no,usebook,trade_mode,urgent,other_note,key,trans];
    return mysql.update(sql, args, trans);
  },*
  insertdelegate(delegates, trans) {
      let insertClause = [];
      let args = [];
      let varlueClause = [];

      for (var el in delegates) {
        insertClause.push(el);
        args.push(delegates[el]);
        varlueClause.push('?');
      }

      const result = yield mysql.query(`SELECT REPLACE(uuid(),'-','') as uid`, [], trans);
      const uuid = result[0].uid;
      insertClause.push('del_no');
      args.push(uuid);
      varlueClause.push('?');
      console.log(uuid);

      let sql = `insert into g_bus_delegate(${insertClause.join(",")},created_date,del_date)
               values(${varlueClause.join(",")},NOW(),NOW())`;
      yield mysql.insert(sql, args, trans);

      sql = `select T1.short_name, del_id as \`key\`,del_no,\`status\`,customs_status,DATE_FORMAT(del_date,'%Y-%m-%d %H:%i') del_date,invoice_no,bill_no,send_tenant_id,rec_tenant_id,creater_login_id,rec_login_id,DATE_FORMAT(rec_del_date,'%Y-%m-%d %H:%i') rec_del_date,master_customs,declare_way_no,usebook,ems_no,trade_mode, urgent,delegate_type,other_note from g_bus_delegate as T LEFT JOIN sso_partners AS T1 ON T.tenant_id=T1.tenant_id AND T.rec_tenant_id=T1.partner_tenant_id
          where T.del_no= ? `
      console.log(sql);
      return yield mysql.query(sql, [uuid], trans);
  },
  getAttachedTenants(tenantId) {
    const sql = `select tenant_id as \`key\`, name, parent_tenant_id as parentId from sso_tenants where status = 'normal'
      and (tenant_id = ? or parent_tenant_id = ?)`;
    const args = [tenantId, tenantId];
    return mysql.query(sql, args);
  },
  getAttachedcustoms_code() {
    const sql = `select id as \`key\`,customs_code as code,customs_name as name from PARA_CUSTOMS_REL`;
    const args = '';
    return mysql.query(sql, args);
  },
  getCustomsInfo() {
      const args = [];
      const sql = `SELECT id as \`key\`,customs_code as \`value\`,CONCAT(customs_code,' | ',customs_name) as \`text\` FROM para_customs_rel`;
      return mysql.query(sql, args);
    },
    getDeclareWay() {
      const args = [];
      const sql = `SELECT distinct declare_way_no as \`value\`,CONCAT(declare_way_no,' | ',declare_way_name) as \`text\` FROM g_cop_declare_way`;
      return mysql.query(sql, args);
    },
    getTradeMode() {
      const args = [];
      const sql = `SELECT TRADE_MODE as \`value\`,CONCAT(TRADE_MODE,' | ',ABBR_TRADE) as \`text\` from para_trade`;
      return mysql.query(sql, args);
    },
    getStatusCount(tenantId, status, filters) {
      const args = [tenantId, status];
      const filterClause = concatFilterSqls(filters, args);
      const sql = `select count(status) as count from g_bus_delegate where tenant_id=? and status=? ${filterClause}`;
      console.log(sql, args);
      return mysql.query(sql, args);
    }
}
