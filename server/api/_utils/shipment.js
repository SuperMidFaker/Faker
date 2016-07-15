exports.makePublicUrlKey = (shipmtNo, createdDate) => {
  const crypto = require('crypto');
  const dateStr = createdDate.getTime().toString();
  const md5 = crypto.createHash('md5');
  md5.update(`${shipmtNo}${dateStr}`);
  return md5.digest('hex');
};
