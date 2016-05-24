import mysql from '../util/mysql';
function prepareAllParameter(item) {
  const args = [];
  const columns = [`title`, `subject`, `body`];
  columns.forEach((column) => {
    if (column in item) {
      args.push(item[column]);
    } else {
      args.push(null);
    }
  });
  return args;
}
export default {
  getTotalCount(corpId) {
    const args = [corpId];
    const sql = `select count(id) as count from wms_notices where corp_id = ?`;
    return mysql.query(sql, args);
  },
  getPagedItemsByCorp(current, pageSize, corpId) {
    const args = [corpId];
    const sql = `select id as \`key\`, title, subject, body, created_date from wms_notices where corp_id = ?
      limit ?, ?`;
    args.push((current - 1) * pageSize, pageSize);
    return mysql.query(sql, args);
  },
  insert(item, createdDate, corpId, tenantId) {
    const sql = `insert into wms_notices(title, subject, body, corp_id, tenant_id, created_date) values (?)`;
    const args = prepareAllParameter(item);
    args.push(corpId, tenantId, createdDate);
    return mysql.insert(sql, [args]);
  },
  update(item) {
    const sql = `update wms_notices set title = ?, subject = ?, body = ? where id = ?`;
    const args = prepareAllParameter(item);
    args.push(item.key);
    return mysql.update(sql, args);
  },
  deleteItem(key) {
    const sql = 'delete from wms_notices where id = ?';
    const args = [key];
    return mysql.delete(sql, args);
  }
}

