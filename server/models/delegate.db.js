import mysql from '../../reusable/db-util/mysql';
import { prng } from 'crypto';

function putInCompositions(f, args) {
  let sql = '';
  if (f.name === 'del_no') {
    sql = 'del_no like ?';
    args.push('%' + f.value + '%');
  } else if (f.name === 'invoice_no') {
    sql = 'invoice_no like ?';
    args.push('%' + f.value + '%');
  } else if (f.name === 'bill_no') {
    sql = 'bill_no like ?';
    args.push('%' + f.value + '%');
  } else if (f.name === 'short_name' && f.value !== `''`) {
    sql = `rec_tenant_id in (${f.value})`;
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
  /**
业务委托受理表g_bus_delegate
主键为del_id，业务单号字段为del_no。因此不同公司业务单号可以相同。
对于收费和试用用户是否可分别对待，试用用户随机数32位。
收费用户，规则：公司代码（可不要，如有限定5位）＋业务模块首字母缩写（是否可由企业自己设定，限定三位）＋年后两位＋两位月＋两位日期（可不要）＋五位流水（有两位日期可三位流水）
实现：表设定或代码控制，是我决定还是海峰决定。没有公司代码的业务单号，不同公司的业务单号有可能相同，但流水要按公司生成，有日期按日计流水，无日期按月计流水。
   * @param  {string} prefix only limit 3 words
   * @param  {int} tenantId
   */
  * genDelNo(code, prefix, tenantId) {
    const res = yield mysql.query('select count(del_id) as sum from g_bus_delegate where tenant_id = ?', [tenantId]);
    let sum = String(res[0].sum);
    const dt = new Date();
    const nos = [];
    if (code) {
      let s = code.substr(0, 5);
      let l = 5 - s.length;
      while (l > 0) {
        s = `0${s}`;
        --l;
      }
      nos.push(s);
    } else {
      nos.push(prng(10).toString('hex').substr(0, 5));
    }
    if (prefix) {
      nos.push(prefix);
    } else {
      nos.push(prng(10).toString('hex').substr(0, 3));
    }
    nos.push(String(dt.getFullYear()).substr(2));
    let m = String(dt.getMonth() + 1);
    if (m.length === 1) {
      m += '0';
    }
    nos.push(m);
    m = String(dt.getDate());
    if (m.length === 1) {
      m += '0';
    }
    nos.push(m);
    let len = 3 - sum.length;
    while (len > 0) {
      sum = `0${sum}`;
      --len;
    }
    nos.push(sum);
    return {del_no: nos.join('')};
  },
    getTenantdelegateCount(tenantId, filters,currentStatus) {
    const args = [tenantId];
      let statusClause = "";
      if (currentStatus != -1) {
        statusClause = " and \`status\`= ?";
        args.push(currentStatus);
      }
    const filterClause = concatFilterSqls(filters, args); //" where tenant_id = ?";
    const sql = `SELECT count(del_id) as num from g_bus_delegate where tenant_id = ? ${statusClause} ${filterClause}`;
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
    const sql = `select T1.name as short_name, del_id as \`key\`,del_no,\`status\`,customs_status,DATE_FORMAT(del_date,'%Y-%m-%d %H:%i') del_date,invoice_no,bill_no,send_tenant_id,rec_tenant_id,creater_login_id,rec_login_id,DATE_FORMAT(rec_del_date,'%Y-%m-%d %H:%i') rec_del_date,DATE_FORMAT(T.created_date,'%Y-%m-%d %H:%i') created_date,master_customs,declare_way_no, usebook,ems_no,trade_mode, urgent,delegate_type,other_note from g_bus_delegate as T LEFT JOIN sso_partners AS T1 ON T.tenant_id=T1.tenant_id AND T.rec_tenant_id=T1.partner_tenant_id
      where T.tenant_id= ? and delegate_type=1 ${statusClause}  ${filterClause} ${sortClause}
      limit ?, ?`;
    args.push((current - 1) * pageSize, pageSize);
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
  updatedelegate(entity, key, trans) {
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
  * insertdelegate(delegates, trans) {
      let insertClause = [];
      let args = [];
      let varlueClause = [];

      for (var el in delegates) {
        if (el !== 'category') {
            insertClause.push(el);
            args.push(delegates[el]);
            varlueClause.push('?');
        }
      }

      const result = yield mysql.query(`SELECT REPLACE(uuid(),'-','') as uid`, [], trans);
      const uuid = result[0].uid;
      insertClause.push('del_no');
      args.push(uuid);
      varlueClause.push('?');

      let sql = `insert into g_bus_delegate(${insertClause.join(",")},created_date,del_date)
               values(${varlueClause.join(",")},NOW(),NOW())`;
      yield mysql.insert(sql, args, trans);
      sql = `select T1.name as short_name, del_id as \`key\`,del_no,\`status\`,customs_status,DATE_FORMAT(del_date,'%Y-%m-%d %H:%i') del_date,invoice_no,bill_no,send_tenant_id,rec_tenant_id,creater_login_id,rec_login_id,DATE_FORMAT(rec_del_date,'%Y-%m-%d %H:%i') rec_del_date,master_customs,declare_way_no,usebook,ems_no,trade_mode, urgent,delegate_type,other_note from g_bus_delegate as T LEFT JOIN sso_partners AS T1 ON T.tenant_id=T1.tenant_id AND T.rec_tenant_id=T1.partner_tenant_id
          where T.del_no= ? `
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
      const sql = `select count(status) as count from g_bus_delegate where tenant_id=? and status=? and delegate_type=1 ${filterClause}`;
      return mysql.query(sql, args);
    }, * saveFileInfo(files, tenantId, delId, delno, trans) {
      for (var i = 0; i < files.length; i++) {
        const file = files[i];
         console.log(file);
        if (file.fileflag === 0) {
          const args = [file.category, file.url, file.doc_name, file.doc_name.substr(file.doc_name.lastIndexOf('.')), delId, delno, tenantId];
          console.log(sql);
          const sql = ` INSERT INTO g_bus_delegate_files (category, url, doc_name, format, del_id, del_no, tenant_id)
                      VALUES (?, ?, ?, ?, ?, ?, ?)`;
          yield mysql.query(sql, args, trans);
        } else if(file.id !== -1 && file.fileflag === -1) {
          const args = [file.id];
          const sql=`DELETE FROM g_bus_delegate_files where id=?`;
          yield mysql.query(sql, args, trans);
        }
      }
    },
    sendDelegate(tenantId, sendlist, customsBroker, status) {
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
    getcustomsBrokers(tenantId) {
      const args = [tenantId];
      const sql = `SELECT t.name as short_name,t.partner_tenant_id as \`key\`  FROM sso_partners as t
                    inner join sso_partnerships as t1 on t.partner_tenant_id=t1.partner_tenant_id and t.tenant_id=t1.tenant_id
                    where t1.type=1 and t.tenant_id= ? order by t.partner_tenant_id`;
      return mysql.query(sql, args);
    },
    getLogsCount(delegateId) { //获取满足条件的总记录数
      const args = [delegateId];
      const sql = `SELECT count(rel_id) as count FROM g_bus_delegate_logs where rel_id=? `;
      return mysql.query(sql, args);
    },
    getLogs(current, pageSize, delegateId) { //分页显示数据
      const args = [delegateId];

      const sql = `SELECT id as \`key\`, rel_id, oper_id, oper_name, oper_note, result, DATE_FORMAT(oper_date,'%Y-%m-%d %H:%i') oper_date FROM g_bus_delegate_logs where rel_id=? limit ?, ?`;
      args.push((current - 1) * pageSize, pageSize);
      return mysql.query(sql, args);
    },
    invalidDelegate(tenantId, loginId, username, delegateId, reason, trans) {
      const args = [reason, tenantId, loginId, delegateId];
      const sql = `UPDATE g_bus_delegate set status=3,remark=? where tenant_id=? and creater_login_id=? and del_id=?`;

      return mysql.query(sql, args, trans);
    },
    writeLog(delegateId, oper_id, oper_name, oper_note, trans) {
      const args = [delegateId, oper_id, oper_name, oper_note];
      const sql = `INSERT INTO g_bus_delegate_logs(rel_id, oper_id, oper_name, oper_note, result,oper_date)
                 VALUES(?,?,?,?,'SUCCEED',now())`;
      return mysql.insert(sql, args, trans);
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
    insertUser(del_id, del_no, status, creater_login_id, trans) {
      const args = [del_id, del_no, status, creater_login_id, creater_login_id];
      console.log(sql, args);
      const sql = `INSERT INTO g_bus_delegate_users(del_id, del_no, status, creater_login_id, oper_login_id) VALUES(?,?,?,?,?)`;
      return mysql.insert(sql, args, trans);
    }
}
