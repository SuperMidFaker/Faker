/**
 *
 * if updateInfo is array, execute multi update one time, such as below:
 *
 * UPDATE categories
 *  SET
 *    display_order = CASE id
 *      WHEN 1 THEN 3
 *      WHEN 2 THEN 4
 *      WHEN 3 THEN 5
 *    END,
 *    title = CASE id
 *    WHEN 1 THEN 'New Title 1'
 *    WHEN 2 THEN 'New Title 2'
 *    WHEN 3 THEN 'New Title 3'
 *    END
 *  WHERE id IN (1,2,3)
 *
 * else excute normal UPDATE
 *
 * @param {updateInfo, columns}
 * @return {String} update statement
 *
 */
export function generateUpdateClauseWithInfo(updateInfo, columns) {
  if(Array.isArray(updateInfo)) {
    return columns.filter(key => updateInfo.some(info => info[key] !== null)).map(key => {
        return `${key} = CASE id\n` + updateInfo.map(info => info[key] ? `WHEN ${info.id} THEN '${info[key]}'\n` : '').join("");
      }).join("END,\n") + 'END\n';
  }else {
    return columns.filter(key => updateInfo[key] !== null && updateInfo[key] !== undefined).map(key => `${key} = '${updateInfo[key]}'`).join(', ');
  }
}

/**
 * Generate delete clause by ids, like below:
 *
 * `id = ids[1] OR id = ids[2] OR id = ids[3] ...`
 *
 * @param {ids} Array
 * @return {String} delete where clause
 *
 */
export function generateDeleteClauseWithIds(ids) {
  if(ids.length == 1) {
    return `id = ${ids[0]}`
  }else {
    return ids.map(id => `id = ${id}`).join(' OR ');
  }
}
