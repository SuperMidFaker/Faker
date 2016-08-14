/* eslint import/prefer-default-export: 0 */
/**
 * 给数组每个成员增加一个唯一的key,主要是因为react生成列表时需要唯一key
 * @param {arr<Array>}
 * @return {Array}
 */
export function addUniqueKeys(arr) {
  return arr.map((item, index) => {
    return { ...item, key: index };
  });
}
