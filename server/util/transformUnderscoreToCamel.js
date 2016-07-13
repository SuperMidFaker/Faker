/**
 * 将_形式的key转化成驼峰形式,如driver_id => driverId
 * @param {obj}             待转化key的对象字面量
 * @param {exclude<Array>}  指定哪些建不被转化
 * @return {obj}
 *
 */
export default function transformUnderscoreToCamel(obj, exclude) {
  return Object.keys(obj).reduce((ret, key) => {
    if (exclude && exclude.includes(key)) {
      ret[key] = obj[key];
    } else {
      ret[transform(key)] = obj[key];
    }
    return ret;
  }, {});
}

function transform(str) {
  const strparts = str.split('_');
  if (strparts.length > 1) {
    let camelStr = strparts[0];
    strparts.shift();
    strparts.forEach(part => {
      camelStr += part[0].toUpperCase() + part.slice(1);
    });
    return camelStr;
  } else {
    return str;
  }
}
