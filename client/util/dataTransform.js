/* eslint import/prefer-default-export: 0 */
import moment from 'moment';

/**
 * 给数组每个成员增加一个唯一的key,主要是因为react生成列表时需要唯一key
 * @param {arr<Array>}
 * @return {Array}
 */
export function addUniqueKeys(arr) {
  return arr.map((item, index) => ({ ...item, key: index }));
}

export function createFilename(prefix) {
  const timeStr = moment(new Date()).format('YYYY-MM-DD');
  const timestamp = Date.now().toString().substr(-6);
  return `${prefix}_${timeStr}_${timestamp}`;
}

export function string2Bytes(str) {
  if (typeof ArrayBuffer !== 'undefined') {
    const buf = new ArrayBuffer(str.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i !== str.length; ++i) {
      view[i] = str.charCodeAt(i) & 0xFF;
    }
    return buf;
  } else {
    const buf = new Array(str.length);
    for (let i = 0; i !== str.length; ++i) {
      buf[i] = str.charCodeAt(i) & 0xFF;
    }
    return buf;
  }
}
