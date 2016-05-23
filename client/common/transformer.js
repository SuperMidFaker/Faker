export function toNonNullProperties(obj) {
  const retObj = {};
  for (let key in obj) {
    if (obj[key]) {
      retObj[key] = obj[key];
    }
  }
  return retObj;
}

export function toNumber(v) {
  if (!v || (v.trim && !v.trim())) {
    return undefined;
  }
  var num = Number(v);
  // num === ' '
  if (!isNaN(num)) {
    num = parseInt(v);
  }
  return isNaN(num) ? v : num;
}
