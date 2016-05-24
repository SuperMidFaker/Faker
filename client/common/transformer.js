export function toNonNullProperties(obj) {
  const retObj = {};
  for (const key in obj) {
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
  let num = Number(v);
  // num === ' '
  if (!isNaN(num)) {
    num = parseInt(v, 10);
  }
  return isNaN(num) ? v : num;
}
