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
  } else if (f.name === 'short_name' && f.value !== `''`) {
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
  return sqlClause === ' and ' ? '' : sqlClause;
}
export default {
  getIdTotalCount(currentStatus, filters, tenantId) { //获取满足条件的总记录数
      const args = [tenantId];
      let statusClause = "";

      if (currentStatus != -1) {
        statusClause = " and \`status\`= ?";
        args.push(currentStatus);
      }

      const filterClause = concatFilterSql(filters, args);
      const sql = `select count(del_no) as count from g_bus_delegate where tenant_id= ? ${statusClause} ${filterClause}`;
      console.log(sql, args);
      return mysql.query(sql, args);
    },
    getPagedIdsByCorp(current, pageSize, filters, sortField, sortOrder, currentStatus, tenantId) { //分页显示数据
      const args = [tenantId];

      let statusClause = "";
      console.log(currentStatus);
      if (currentStatus != -1) {
        statusClause = " and \`status\`= ?";
        args.push(currentStatus);
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
    getStatusCount(tenantId, status, filters) {
      const args = [tenantId, status];
      const filterClause = concatFilterSql(filters, args);
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
      const sql = `SELECT t.name as short_name,t.partner_tenant_id as \`key\`  FROM sso_partners as t
                    inner join sso_partnerships as t1 on t.partner_tenant_id=t1.partner_tenant_id and t.tenant_id=t1.tenant_id
                    where t1.type=1 and t.tenant_id= ? order by t.partner_tenant_id`;
      console.log(sql, args);
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
    getShortName() {
      const args = [];
      const sql = `SELECT tenant_id as \`value\`,CONCAT(tenant_id,' | ',short_name) as \'text'\ FROM sso_tenants `;
      return mysql.query(sql, args);
    },
    * insertImportAccept(entity, trans) {
      let insertClause = [];
      let args = [];
      let varlueClause = [];

      for (var el in entity) {
        insertClause.push(el);
        args.push(entity[el]);
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
    editImportAccept(entity, key, trans) {
      let updateClause = [];
      let args = [];

      for (var el in entity) {
        if (el !== 'category') {
          updateClause.push(`${el}=?`);
          args.push(entity[el]);
        }
      }
      args.push(key);
      const sql = `UPDATE g_bus_delegate SET ${updateClause.join(",")}, update_date=now() where del_id=?`;
      console.log(sql);
      return mysql.update(sql, args, trans);
    },
    getDeclareFileList(tenantId, delId) {
      const args = [tenantId, delId];
      const sql = `SELECT id, url,doc_name,category, 1 as fileflag FROM g_bus_delegate_files where tenant_id=? and del_id=?`;
      return mysql.query(sql, args);
    },
    getDeclareCategoryList(tenantId) {
      const args = [tenantId];
      const sql = `SELECT distinct category FROM g_bus_delegate_files where tenant_id=?`;
      return mysql.query(sql, args);
    },
    * saveFileInfo(files, tenantId, delId, delno, trans) {
      for (var i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.fileflag === 0) {
          const args = [file.category, file.url, file.doc_name, file.doc_name.substr(file.doc_name.lastIndexOf('.')), delId, delno, tenantId];
          const sql = ` INSERT INTO g_bus_delegate_files (category, url, doc_name, format, del_id, del_no, tenant_id)
                      VALUES (?, ?, ?, ?, ?, ?, ?)`;
          yield mysql.query(sql, args, trans);
        } else if (file.id !== -1 && file.fileflag === -1) {
          const args = [file.id];
          const sql = `DELETE FROM g_bus_delegate_files where id=?`;
          yield mysql.query(sql, args, trans);
        }

      }
    },
    sendAccept(tenantId, sendlist, customsBroker, status) {
      if (status === '0') {
        const args = [tenantId, customsBroker];
        const sql = `UPDATE g_bus_delegate set send_tenant_id=?,rec_tenant_id=?,status=1 where del_id in (${sendlist instanceof Array?sendlist.join(","):sendlist})`;
        return mysql.query(sql, args);
      } else {
        const args = [];
        const sql = `UPDATE g_bus_delegate set status=0 where del_id in (${sendlist instanceof Array?sendlist.join(","):sendlist})`;
        return mysql.query(sql, args);
      }
    },
    invalidAccept(tenantId, loginId, username, acceptId, reason, trans) {
      const args = [reason, tenantId, loginId, acceptId];
      const sql = `UPDATE g_bus_delegate set status=3,remark=? where tenant_id=? and creater_login_id=? and del_id=?`;

      return mysql.query(sql, args, trans);
    },
    getLogsCount(acceptId) { //获取满足条件的总记录数
      const args = [acceptId];
      const sql = `SELECT count(rel_id) as count FROM g_bus_delegate_logs where rel_id=? `;
      console.log(sql, args);
      return mysql.query(sql, args);
    },
    getLogs(current, pageSize, acceptId) { //分页显示数据
      const args = [acceptId];

      const sql = `SELECT id as \`key\`, rel_id, oper_id, oper_name, oper_note, result, DATE_FORMAT(oper_date,'%Y-%m-%d %H:%i') oper_date FROM g_bus_delegate_logs where rel_id=? limit ?, ?`;
      args.push((current - 1) * pageSize, pageSize);
      console.log(sql, args);
      return mysql.query(sql, args);
    },
    writeLog(acceptId, oper_id, oper_name, oper_note, trans) {
      const args = [acceptId, oper_id, oper_name, oper_note];
      const sql = `INSERT INTO g_bus_delegate_logs(rel_id, oper_id, oper_name, oper_note, result,oper_date)
                 VALUES(?,?,?,?,'SUCCEED',now())`;
      return mysql.insert(sql, args, trans);
    },
    insertUser(del_id, del_no, status, creater_login_id, trans) {
      const args = [del_id, del_no, status, creater_login_id, creater_login_id];
      const sql = `INSERT INTO g_bus_delegate_users(del_id, del_no, status, creater_login_id, oper_login_id) VALUES(?,?,?,?,?)`;
      return mysql.insert(sql, args, trans);
    }


}
