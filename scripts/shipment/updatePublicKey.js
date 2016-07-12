const co = require('koa/node_modules/co');
const mysql = require('../../server/util/mysql');
const shipmentDao = require('../../server/models/shipment.db');
const makePublicUrlKey = require('../../server/api/_utils/shipment');

//  NODE_ENV=home ./node_modules/.bin/babel-node scripts/shipment/updatePublicKey.js
co(function *run() {
  const shipmts = yield mysql.query('select shipmt_no, created_date from tms_shipments');
  const dbUps = [];
  shipmts.forEach(shipmt => {
    const publicKey = makePublicUrlKey(shipmt.shipmt_no, shipmt.created_date);
    dbUps.push(shipmentDao.updateShipmtWithInfo({
      shipmt_no: shipmt.shipmt_no,
      public_key: publicKey,
    }));
  });
  yield dbUps;
});
