/* eslint no-console: 0 */
const co = require('koa/node_modules/co');
const mysql = require('../../server/util/mysql');
const shipmentDao = require('../../server/models/shipment.db');
const shipmentUtil = require('../../server/api/_utils/shipment');

//  NODE_ENV=home ./node_modules/.bin/babel-node scripts/shipment/updatePublicKey.js
co(function *run() {
  const shipmts = yield mysql.query('select shipmt_no, created_date from tms_shipments');
  const dbUpdates = [];
  shipmts.forEach(shipmt => {
    const publicKey = shipmentUtil.makePublicUrlKey(shipmt.shipmt_no, shipmt.created_date);
    dbUpdates.push(shipmentDao.updateShipmtWithInfo({
      shipmt_no: shipmt.shipmt_no,
      public_key: publicKey,
    }));
  });
  console.log('end');
  return yield dbUpdates;
}).then((result) => {
  console.log('finished', result.length);
}).catch(err => {
  console.log(err);
});
