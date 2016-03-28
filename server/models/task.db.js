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
      const sql = `select count(del_id) as count from g_bus_delegate where rec_tenant_id = ? ${statusClause} ${filterClause}`;

      return mysql.query(sql, args);
    },

    * getTasks(current, currentStatus, loginId, filters, pageSize, tenantId, sortField, sortOrder) {
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

      const sql = `select T1.name as short_name, del_id as \`key\`,del_no,customs_status,invoice_no,bill_no,rec_tenant_id,T2.name as rec_login_id,DATE_FORMAT(rec_del_date,'%Y-%m-%d %H:%i') rec_del_date,DATE_FORMAT(T.created_date,'%Y-%m-%d %H:%i') created_date,master_customs,declare_way_no, usebook,ems_no,trade_mode, urgent,delegate_type,other_note from g_bus_delegate as T LEFT JOIN sso_partners AS T1 ON T.tenant_id=T1.tenant_id AND T.rec_tenant_id=T1.partner_tenant_id
      left join sso_tenant_users T2 on t2.tenant_id=T.rec_tenant_id and T2.login_id=T.rec_login_id
      where T.rec_tenant_id= ? ${statusClause} ${filterClause} ${sortClause}  limit ?, ?`;

      args.push((current - 1) * pageSize, pageSize);
      let tasklist = yield mysql.query(sql, args);
      tasklist = yield this.getDecBillHead(tasklist, tenantId);
      return tasklist;
    },
    getStatusCount(loginId, tenantId, status, filters) {
      const args = [loginId, tenantId, status];
      const filterClause = concatFilterSql(filters, args);
      const sql = `select count(customs_status) as count from g_bus_delegate where rec_login_id=? and rec_tenant_id=? and customs_status=? ${filterClause}`;
      return mysql.query(sql, args);
    }, * getDecBillHead(tasklist, tenantId) {
      const key = [0];
      const args = [tenantId];

      for (var i = 0; i < tasklist.length; i++) {
        key.push(tasklist[i].key);
      }
      const sql = `select seq_no , del_id from g_dec_bill_head where tenant_id = ? and del_id in (${key.join(',')})`;
      let decBillList = yield mysql.query(sql, args);
      decBillList = yield this.getDecHead(decBillList, tenantId);
      console.log("decBillList", decBillList);
      if (decBillList.length > 0) {
        for (var i = 0; i < tasklist.length; i++) {
          for (var j = 0; j < decBillList.length; j++) {
            if (tasklist[i].key === decBillList[j].del_id) {
              if (tasklist[i].children === undefined) {
                tasklist[i].children = [];
              }
              tasklist[i].children.push({
                key: decBillList[j].seq_no,
                del_no: decBillList[j].seq_no,
                send_tenant_id: '报关清单',
                children:decBillList[j].children
              });
            }
          }
        }
      }
      return tasklist;
    }, * getDecHead(decBillList) {
      const key = [0];
      const args = [];

      for (var i = 0; i < decBillList.length; i++) {
        key.push(decBillList[i].del_id);
      }
      const sql = `select id as \`key\`, entry_id , del_id from entry_head where del_id in (${key.join(',')})`;
      const decList = yield mysql.query(sql, args);
      if (decList.length > 0) {
        for (var i = 0; i < decBillList.length; i++) {
          for (var j = 0; j < decList.length; j++) {
            if (decBillList[i].del_id === decList[j].del_id) {
              if (decBillList[i].children === undefined) {
                decBillList[i].children = [];
              }
              decBillList[i].children.push({
                key:'dec_'+decList[j].key,
                del_no: decList[j].entry_id,
                send_tenant_id: '报关单'
              });
            }
          }
        }
      }
      return decBillList;
    }

}
