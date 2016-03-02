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
    const sql = `SELECT del_id as \`key\`,del_no,\`status\`,invoice_no,DATE_FORMAT(del_date,'%Y-%m-%d %H:%i') del_date,DATE_FORMAT(created_date,'%Y-%m-%d %H:%i') created_date,master_customs,declare_way_no,bill_no,usebook,trade_mode,urgent,other_note from g_bus_delegate where tenant_id = ? ${statusClause}  ${filterClause} ${sortClause}
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
  },
  insertdelegate(creator,tenantId, trans) {
    
    
    const sql = `INSERT into g_bus_delegate(del_no,STATUS,invoice_no,del_date,created_date,master_customs,declare_way_no,bill_no,usebook,trade_mode,urgent,other_note,tenant_id) values (?, 0, ?,NOW(),NOW(),?,?,?,?,?,?,?,?)`;
    const args = [1,creator.invoice_no,creator.master_customs,creator.declare_way_no,creator.bill_no,creator.usebook,creator.trade_mode,creator.urgent,creator.other_note,tenantId];
    return mysql.insert(sql, args, trans);
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
