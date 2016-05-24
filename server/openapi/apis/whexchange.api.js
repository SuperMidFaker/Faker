import cobody from 'co-body';
import mysql from '../../util/mysql';
import whDao from '../../models/warehouse.db';
import whComposeDao from '../../models/wh-exchange.db';
import customerDao from '../../models/customer.db';
import Result from '../../util/response-result';

export default [
  ['post', '/whexchange/customers', customersP],
  ['post', '/whexchange/supplies', suppliesP],
  ['post', '/whexchange/warehouses', warehousesP],
  ['post', '/whexchange/products', productsP],
  ['post', '/whexchange/inbound', inboundP],
  ['post', '/whexchange/outbound', outboundP],
  ['post', '/whexchange/inventory', inventoryP],
  ['post', '/whexchange/fees', feesP]
]

function *customersP() {
  const body = yield cobody(this);
  const whCustomers = [];
  body.forEach((customer) => {
    whCustomers.push({
      whno: customer.wh_no,
      customerno: customer.customer_no
    });
  });
  let trans;
  try {
    trans = yield mysql.beginTransaction();
    yield whDao.batchGrantWhAuth(whCustomers, trans);
    const accountIds = yield customerDao.insertAccounts(body, trans);
    yield customerDao.batchInsert(body, accountIds, this.app.corpId, this.app.tenantId, trans);
    yield mysql.commit(trans);
    return Result.OK(this);
  } catch (e) {
    console.error(e);
    console.error(e && e.stack);
    yield mysql.rollback(trans);
    return Result.InternalServerError(this, e.message);
  }
}

function *suppliesP() {
  const body = yield cobody(this);
  try {
    yield customerDao.batchInsertSuppliers(body, this.app.corpId, this.app.tenantId);
    return Result.OK(this);
  } catch (e) {
    console.log('exception', e && e.stack);
    return Result.InternalServerError(this, e.message);
  }
}

function *warehousesP() {
  const body = yield cobody(this);
  try {
    yield whDao.batchInsert(body, this.app.corpId, this.app.tenantId);
    return Result.OK(this);
  } catch (e) {
    console.log('exception', e && e.stack);
    return Result.InternalServerError(this, e.message);
  }
}

function *productsP() {
  const body = yield cobody(this);
  try {
    yield whComposeDao.batchInsertProducts(body, this.app.corpId, this.app.tenantId);
    return Result.OK(this);
  } catch (e) {
    console.log('exception', e && e.stack);
    return Result.InternalServerError(this, e.message);
  }
}

function *inboundP() {
  const body = yield cobody(this);
  try {
    yield whComposeDao.batchInsertInbound(body, this.app.corpId, this.app.tenantId);
    return Result.OK(this);
  } catch (e) {
    console.log('exception', e && e.stack);
    return Result.InternalServerError(this, e.message);
  }
}

function *outboundP() {
  const body = yield cobody(this);
  try {
    yield whComposeDao.batchInsertOutbound(body, this.app.corpId, this.app.tenantId);
    return Result.OK(this);
  } catch (e) {
    console.log('exception', e && e.stack);
    return Result.InternalServerError(this, e.message);
  }
}

function *inventoryP() {
  const body = yield cobody(this);
  try {
    yield whComposeDao.batchInsertInventory(body, this.app.corpId, this.app.tenantId);
    return Result.OK(this);
  } catch (e) {
    console.log('exception', e && e.stack);
    return Result.InternalServerError(this, e.message);
  }
}

function *feesP() {
  const body = yield cobody(this);
  try {
    yield whComposeDao.batchInsertFee(body, this.app.corpId, this.app.tenantId);
    return Result.OK(this);
  } catch (e) {
    console.log('exception', e && e.stack);
    return Result.InternalServerError(this, e.message);
  }
}
