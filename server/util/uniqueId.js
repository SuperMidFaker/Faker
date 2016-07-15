/**
* Copyright (c) 2012-2014 Qeemo Ltd. All Rights Reserved.
*/
/**
* User: Kurten
* Date: 2014-03-11
* Time: 10:50:57
* File: uniqueId.js
* Version: 1.0
* Description:
*/
'use strict';

var uniqueId = module.exports;
var twepoch = 1288834974657;
var workerIdBits = 5;
var dataCenterIdBits = 5;
var maxWrokerId = -1 ^ (-1 << workerIdBits);
var maxDataCenterId = -1 ^ (-1 << dataCenterIdBits);
var sequenceBits = 12;
var workerIdShift = sequenceBits;
var dataCenterIdShift = sequenceBits + workerIdBits;
var timestampLeftShift = sequenceBits + workerIdBits + dataCenterIdBits;
var sequenceMask = -1 ^ (-1 << sequenceBits);
var lastTimestamp = -1;
var BigInteger = require('./jsbn');
// 设置默认值,从环境变量取
var c_workerId = 1;
var c_dataCenterId = 1;
var c_sequence = 0;
/**
 * 初始化workerId,dataCenterId,sequence
 * @param  {Object} config
 */
uniqueId.init = function (unidcfg) {
  if (!!unidcfg) {
    c_workerId = unidcfg.worker_id || 1;
    c_dataCenterId = unidcfg.data_center_id || 1;
    c_sequence = unidcfg.sequence || 0;
  }
};
/**
 * 生成全库唯一id
 * @param  {Number} workerId     worker id
 * @param  {Number} dataCenterId data center id
 * @param  {Number} sequence     sequence
 * @return {Number}              unique id
 */
uniqueId.nextId = function (workerId, dataCenterId, sequence) {
  workerId = workerId || c_workerId;
  dataCenterId = dataCenterId || c_dataCenterId;
  sequence = sequence || c_sequence;

  if (workerId > maxWrokerId || workerId < 0) {
    return 0;
  }
  if (dataCenterId > maxDataCenterId || dataCenterId < 0) {
    return 0;
  }

  var timestamp = timeGen();
  if (lastTimestamp === timestamp) {
    sequence = (sequence + 1) & sequenceMask;
    if (sequence === 0) {
      timestamp = tilNextMillis(lastTimestamp);
    }
  } else {
    sequence = 0;
  }
  if (timestamp < lastTimestamp) {
    return 0;
  }

  lastTimestamp = timestamp;
  var shiftNum = (dataCenterId << dataCenterIdShift) |
        (workerId << workerIdShift) | sequence;
  var nfirst = new BigInteger(String(timestamp - twepoch), 10);
  nfirst = nfirst.shiftLeft(timestampLeftShift);
  var nnextId = nfirst.or(new BigInteger(String(shiftNum), 10));
  var nextId = nnextId.toRadix(10);
  return String(nextId);
};

function tilNextMillis(lastTimestamp) {
  var timestamp = timeGen();
  while (timestamp <= lastTimestamp) {
    timestamp = timeGen();
  }
  return timestamp;
}

function timeGen() {
  return Date.now();
}
