import mysql from '../util/mysql';
function prepareAllParameter(wh) {
  const args = [];
  const whColumns = [`wh_no`, `wh_mode`, `wh_name`, `wh_short_name`, `open_date`, `acreage`, `day_rent`,
    `rent_term`, `wh_desc`, `service_man_qty`, `service_time`, `week_days`, `rest_man_qty`, `vacation_day`, `service_mode`,
  `country`, `province`, `city`, `district`, `address`, `longitude`, `latitude`, `zip_code`, `linkman`, `mobile`,
  `telephone`, `fax`, `email`, `qq`, `url`, `remark`];
  whColumns.forEach((column) => {
    if (column in wh) {
      if (column === 'open_date') {
        args.push(new Date(wh[column]));
      } else {
        args.push(wh[column]);
      }
    } else {
      args.push(null);
    }
  });
  return args;
}

function packSlicedCondition(opts, args) {
  let TRANS_DATE = '';
  if (opts.date) {
      TRANS_DATE += 'and trans_date = ?';
      args.push(opts.date);
  } else {
    if (opts.date_start) {
      TRANS_DATE += 'and trans_date >= ?';
      args.push(opts.date_start);
    }
    if (opts.date_end) {
      TRANS_DATE += ' and trans_date < ?';
      args.push(opts.date_end);
    }
  }
  let WH_NO = '';
  if (opts.wh_no) {
    WH_NO += 'and wh_no = ?';
    args.push(opts.wh_no);
  }
  let GOODS_NO = '';
  if (opts.goods_no) {
    GOODS_NO += 'and goods_no = ?';
    args.push(opts.goods_no);
  }
  let GOODS_NAME = '';
  if (opts.goods_name) {
    GOODS_NAME += 'and goods_name like ?';
    args.push('%' + opts.goods_name + '%');
  }
  let SPEC = '';
  if (opts.spec) {
    SPEC += 'and spec = ?';
    args.push(opts.spec);
  }
  let LIMIT = '';
  if (opts.since_id && opts.max_id) {
    LIMIT = 'and id >= ? and id < ? order by id desc';
    args.push(parseInt(opts.since_id, 10));
    args.push(parseInt(opts.max_id, 10));
  } else {
    if (opts.since_id) {
      LIMIT = 'and id >= ? order by id asc limit ?';
      args.push(parseInt(opts.since_id, 10));
    } else if (opts.max_id) {
      LIMIT = 'and id < ? order by id desc limit ?';
      args.push(parseInt(opts.max_id));
    } else {
      LIMIT = 'order by id desc limit ?';
    }
    var page = opts.page || 1;
    var count = opts.count || 20;
    count = count > 100 ? 100 : count;
    var maxcnt = page * count;
    args.push(maxcnt);
  }
  return { TRANS_DATE, WH_NO, GOODS_NO, GOODS_NAME, SPEC, LIMIT };
}
export default {
  getWhTotalCount(corpId) {
    const sql = `select count(id) as count from wms_warehouses where corp_id = ?`;
    const args = [corpId];
    return mysql.query(sql, args);
  },
  getPagedWhsByCorp(current, pageSize, corpId) {
    const sql = `select id as \`key\`, wh_no, wh_mode, wh_name, wh_short_name, open_date,
      acreage, day_rent, rent_term, wh_desc, service_man_qty, service_time, week_days, rest_man_qty,
      vacation_day, service_mode, country, province, city, district, address, longitude, latitude,
      zip_code, linkman, mobile, telephone, fax, email, qq, url, remark from wms_warehouses where corp_id = ?
      limit ?, ?`;
    const args = [corpId, (current - 1) * pageSize, pageSize];
    return mysql.query(sql, args);
  },
  insertWh(warehouse, corpId, tenantId) {
    const sql = `insert into wms_warehouses(wh_no, wh_mode, wh_name, wh_short_name, open_date,
      acreage, day_rent, rent_term, wh_desc, service_man_qty, service_time, week_days, rest_man_qty,
      vacation_day, service_mode, country, province, city, district, address, longitude, latitude,
      zip_code, linkman, mobile, telephone, fax, email, qq, url, remark, corp_id, tenant_id, created_date)
      values (?)`; // single insert need the parentheses
    const args = prepareAllParameter(warehouse);
    args.push(corpId, tenantId, new Date());
    return mysql.insert(sql, [args]);
  },
  updateWh(wh) {
    const sql = `update wms_warehouses set wh_no = ?, wh_mode = ?, wh_name = ?, wh_short_name = ?, open_date = ?,
      acreage = ?, day_rent = ?, rent_term = ?, wh_desc = ?, service_man_qty = ?, service_time = ?, week_days = ?, rest_man_qty = ?,
      vacation_day = ?, service_mode = ?, country = ?, province = ?, city = ?, district = ?, address = ?, longitude = ?, latitude = ?,
      zip_code = ?, linkman = ?, mobile = ?, telephone = ?, fax = ?, email = ?, qq = ?, url = ?, remark = ? where id = ?`;
    const args = prepareAllParameter(wh);
    args.push(wh.key);
    return mysql.update(sql, args);
  },
  deleteWh(whkey) {
    const sql = 'delete from wms_warehouses where id = ?';
    const args = [whkey];
    return mysql.delete(sql, args);
  },
  batchGrantWhAuth(whCustomers, trans) {
    const sql = 'insert into wms_wh_auth (wh_no, customer_no) values ?';
    const args = [];
    whCustomers.forEach((whcus) => {
      args.push([whcus.whno, whcus.customerno]);
    });
    return mysql.insert(sql, [args], trans);
  },
  batchInsert(warehouses, corpId, tenantId, trans) {
    const sql = `insert into wms_warehouses(wh_no, wh_mode, wh_name, wh_short_name, open_date,
      acreage, day_rent, rent_term, wh_desc, service_man_qty, service_time, week_days, rest_man_qty,
      vacation_day, service_mode, country, province, city, district, address, longitude, latitude,
      zip_code, linkman, mobile, telephone, fax, email, qq, url, remark, corp_id, tenant_id, created_date)
      values ?`;
    const args = [];
    warehouses.forEach((item, idx) => {
      const singleArgs = prepareAllParameter(item);
      singleArgs.push(corpId, tenantId, new Date());
      args.push(singleArgs);
    });
    return mysql.insert(sql, [args], trans);
  },
  getSlicedInbound(opts, accountId) {
    const args = [accountId];
    const { TRANS_DATE, WH_NO, GOODS_NO, GOODS_NAME, SPEC, LIMIT } = packSlicedCondition(opts, args);
    var sql = `select id, wh_no, trans_no, trans_mode, trans_company, trans_date,
      goods_no, goods_name, spec, qty, measure, amount from wms_inbound AS INB inner join
      (select customer_no from wms_customers where account_id = ?) AS C on C.customer_no = INB.customer_no
       where 1=1 ${TRANS_DATE} ${WH_NO} ${GOODS_NO} ${GOODS_NAME} ${SPEC} ${LIMIT}`;
    console.log(sql);
    console.log('args', args);
    return mysql.query(sql, args);
  },
  getSlicedOutbound(opts, accountId) {
    const args = [accountId];
    const { TRANS_DATE, WH_NO, GOODS_NO, GOODS_NAME, SPEC, LIMIT } = packSlicedCondition(opts, args);
    const sql = `select id, wh_no, wh_name, trans_no, trans_mode, trans_company, trans_date,
      goods_no, goods_name, spec, qty, measure, amount from wms_outbound AS OUTB inner join
      (select customer_no from wms_customers where account_id = ?) AS C on C.customer_no = OUTB.customer_no
      where 1=1 ${TRANS_DATE} ${WH_NO} ${GOODS_NO} ${GOODS_NAME} ${SPEC} ${LIMIT}`;
    return mysql.query(sql, args);
  },

  getSlicedInventory(opts, accountId) {
    const args = [accountId];
    const { TRANS_DATE, WH_NO, GOODS_NO, GOODS_NAME, SPEC, LIMIT } = packSlicedCondition(opts, args);
    const sql = `select id, wh_no, wh_name, trans_date,goods_no, goods_name,
      spec, qty, measure, amount from wms_inventory AS INV inner join
      (select customer_no from wms_customers where account_id = ?) AS C on C.customer_no = INV.customer_no
      where 1=1 ${TRANS_DATE} ${WH_NO} ${GOODS_NO} ${GOODS_NAME} ${SPEC} ${LIMIT}`;
    return mysql.query(sql, args);
  },

  getSlicedFee(opts, accountId) {
    const args = [accountId];
    const { TRANS_DATE, WH_NO, LIMIT } = packSlicedCondition(opts, args);
    const sql = `select id, wh_no, wh_name, trans_date, fee_name,remark, amount from wms_fee AS FEE inner join
      (select customer_no from wms_customers where account_id = ?) AS C on C.customer_no = FEE.customer_no
      where 1=1 ${TRANS_DATE} ${WH_NO} ${LIMIT}`;
    return mysql.query(sql, args);
  },

  getSlicedWarehouses(opts, accountId) {
    const args = [accountId];
    const { LIMIT } = packSlicedCondition(opts, args);
    const sql = `select id, WH.wh_no as wh_no, wh_name, wh_mode, wh_short_name, wh_desc,
      country, city, address, linkman, mobile, url from wms_warehouses AS WH inner join
      (select wh_no from wms_wh_auth AS WHA inner join wms_customers AS C on WHA.customer_no
      = C.customer_no where C.account_id = ?) AS AUTH on WH.wh_no = AUTH.wh_no where 1=1 ${LIMIT}`;
    console.log('args', args, 'sql', sql);
    return mysql.query(sql, args);
  }
}
