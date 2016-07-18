exports.makePublicUrlKey = (shipmtNo, createdDate) => {
  const crypto = require('crypto');
  const dateStr = createdDate.getTime().toString();
  const md5 = crypto.createHash('md5');
  md5.update(`${shipmtNo}${dateStr}`);
  return md5.digest('hex');
};

const alphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
exports.genShipmtNo = (tenantTmsPrefix, currShipmtno) => {
    // 最长16位企业tms代号(目前用企业子域名) + 2位年份 + 6位序号(前面补0) + 2位随机字母
    const totalLen = tenantTmsPrefix.length + 2 + 6 + 2;
    const buf = new Buffer(totalLen);
    buf.fill('0');
    const year = String(new Date().getFullYear()).substr(2);
    let newnoStr = '1';
    if (currShipmtno) {
      const biggestNo = currShipmtno;
      newnoStr = biggestNo.substr(biggestNo.length - 1 - 6);
      newnoStr = String(parseInt(newnoStr, 10) + 1);
    }
    // http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
    const random1 = alphabets.charAt(Math.floor(Math.random() * alphabets.length));
    const random2 = alphabets.charAt(Math.floor(Math.random() * alphabets.length));
    buf.write(tenantTmsPrefix.toUpperCase());
    buf.write(year, tenantTmsPrefix.length);
    buf.write(newnoStr, totalLen - newnoStr.length - 2);
    buf.write(random1, totalLen - 2);
    buf.write(random2, totalLen - 1);
    return buf.toString();
};
