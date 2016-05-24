import mysql from '../util/mysql';

function prepareParam(item, columns) {
  const args = [];
  columns.forEach((column) => {
    if (column in item) {
      args.push(item[column]);
    } else {
      args.push(null);
    }
  });
  return args;
}
function prepProductParam(item) {
  const columns = [`customer_no`, `wh_no`, `goods_no`, `goods_mode`, `goods_name`,
    `goods_short_name`, `goods_desc`, `price_cost`, `price_wholesale`, `price_retail`,
    `curr`, `billing_mode`, `facture`, `country`, `brand`, `spec`, `texture`, `remark`];
  return prepareParam(item, columns);
}

function prepInboundParam(item) {
  const columns = [`wh_no`, `customer_no`, `trans_no`, `trans_mode`, `trans_company`, `trans_date`,
    `goods_no`, `goods_name`, `spec`, `qty`, `measure`, `amount`, `currency`, `remark`];
  return prepareParam(item, columns);
}

function prepOutboundParam(item) {
  const columns = [`wh_no`, `customer_no`, `wh_name`, `trans_no`, `trans_mode`, `trans_company`,
    `trans_date`, `goods_no`, `goods_name`, `spec`, `qty`, `measure`, `amount`, `currency`, `remark`];
  return prepareParam(item, columns);
}

function prepInventoryParam(item) {
  const columns = [`wh_no`, `customer_no`, `wh_name`, `trans_date`, `goods_no`,
    `goods_name`, `spec`, `qty`, `measure`, `amount`, `currency`, `remark`];
  return prepareParam(item, columns);
}

function prepFeeParam(item) {
  const columns = [`wh_no`, `customer_no`, `wh_name`, `trans_date`, `fee_name`,
    `amount`, `currency`, `remark`];
  return prepareParam(item, columns);
}

export default {
  batchInsertProducts(products, corpId, tenantId, trans) {
    const sql = `insert into wms_products(customer_no, wh_no, goods_no, goods_mode, goods_name,
      goods_short_name, goods_desc, price_cost, price_wholesale, price_retail, curr, billing_mode,
      facture, country, brand, spec, texture, remark, corp_id, tenant_id, created_date) values ?`;
    const args = [];
    products.forEach((item, idx) => {
      const singleArgs = prepProductParam(item);
      singleArgs.push(corpId, tenantId, new Date());
      args.push(singleArgs);
    });
    return mysql.insert(sql, [args], trans);
  },
  batchInsertInbound(inbounds, corpId, tenantId, trans) {
    const sql = `insert into wms_inbound(wh_no, customer_no, trans_no, trans_mode, trans_company,
      trans_date, goods_no, goods_name, spec, qty, measure, amount, currency, remark, corp_id,
      tenant_id, created_date) values ?`;
    const args = [];
    inbounds.forEach((item, idx) => {
      const singleArgs = prepInboundParam(item);
      singleArgs.push(corpId, tenantId, new Date());
      args.push(singleArgs);
    });
    return mysql.insert(sql, [args], trans);
  },
  batchInsertOutbound(outbounds, corpId, tenantId, trans) {
    const sql = `insert into wms_outbound(wh_no, customer_no, wh_name, trans_no,
      trans_mode, trans_company, trans_date, goods_no, goods_name, spec, qty,
      measure, amount, currency, remark, corp_id, tenant_id, created_date) values ?`;
    const args = [];
    outbounds.forEach((item, idx) => {
      const singleArgs = prepOutboundParam(item);
      singleArgs.push(corpId, tenantId, new Date());
      args.push(singleArgs);
    });
    return mysql.insert(sql, [args], trans);
  },
  batchInsertInventory(invs, corpId, tenantId, trans) {
    const sql = `insert into wms_inventory(wh_no, customer_no, wh_name, trans_date,
      goods_no, goods_name, spec, qty, measure, amount, currency, remark, corp_id,
      tenant_id, created_date) values ?`;
    const args = [];
    invs.forEach((item, idx) => {
      const singleArgs = prepInventoryParam(item);
      singleArgs.push(corpId, tenantId, new Date());
      args.push(singleArgs);
    });
    return mysql.insert(sql, [args], trans);
  },
  batchInsertFee(fees, corpId, tenantId, trans) {
    const sql = `insert into wms_fee(wh_no, customer_no, wh_name, trans_date,
      fee_name, amount, currency, remark, corp_id, tenant_id, created_date) values ?`;
    const args = [];
    fees.forEach((item, idx) => {
      const singleArgs = prepFeeParam(item);
      singleArgs.push(corpId, tenantId, new Date());
      args.push(singleArgs);
    });
    return mysql.insert(sql, [args], trans);
  }
}
