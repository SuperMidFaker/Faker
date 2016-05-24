import mysql from '../util/mysql';
import userDao from './user.db';
import bcrypt from '../util/BCryptUtil';
import { __DEFAULT_PASSWORD__, CUSTOMER } from 'common/constants';

function prepareParam(item, columns) {
  const args = [];
  columns.forEach((col) => {
    if (col in item) {
      args.push(item[col]);
    } else {
      args.push(null);
    }
  });
  return args;
}

function prepCustomerParam(item) {
  const columns = [`customer_no`, `name`, `short_name`, `english_name`, `country`,
    `province`, `city`, `district`, `address`, `zip_code`, `linkman`, `mobile`,
    `telephone`, `fax`, `email`, `qq`, `url`, `remark`];
  return prepareParam(item, columns);
}

function prepSupplierParam(item) {
  const columns = [`wh_no`, `customer_no`, `supply_no`, `name`, `short_name`,
    `english_name`, `country`, `province`, `city`, `district`, `address`, `zip_code`,
    `linkman`, `mobile`, `telephone`, `fax`, `email`, `qq`, `url`, `remark`];
  return prepareParam(item, columns);
}

export default {
  insertAccounts(customers, trans) {
    return function *insertAccounts() {
      const salt = bcrypt.gensalt();
      const pwdHash = bcrypt.hashpw(__DEFAULT_PASSWORD__, salt);
      const accountIds = [];
      for (let i = 0; i < customers.length; ++i) {
        const customer = customers[i];
        const phone = customer.mobile;
        const unid = bcrypt.hashMd5(phone + salt + Date.now());
        try {
          const result = yield userDao.insertAccount(phone, salt, pwdHash, CUSTOMER, unid, trans);
          accountIds.push(result.insertId);
        } catch (e) {
          accountIds.push(0);
        }
      }
      console.log('customer account ids', accountIds);
      return accountIds;
    }
  },
  batchInsert(customers, accountIds, corpId, tenantId, trans) {
    const sql = `insert into wms_customers (customer_no, name, short_name, english_name,
      country, province, city, district, address, zip_code, linkman, mobile, telephone, fax,
      email, qq, url, remark, account_id, corp_id, tenant_id, created_date) values ?`;
    const args = [];
    customers.forEach((customer, idx) => {
      const singleArgs = prepCustomerParam(customer);
      singleArgs.push(accountIds[idx], corpId, tenantId, new Date());
      args.push(singleArgs);
    });
    return mysql.insert(sql, [args], trans);
  },
  batchInsertSuppliers(suppliers, corpId, tenantId, trans) {
    const sql = `insert into wms_supplies (wh_no, customer_no, supply_no, name, short_name, english_name,
      country, province, city, district, address, zip_code, linkman, mobile, telephone, fax, email, qq,
      url, remark, corp_id, tenant_id, created_date) values ?`;
    const args = [];
    suppliers.forEach((item, idx) => {
      const singleArgs = prepSupplierParam(item);
      singleArgs.push(corpId, tenantId, new Date());
      args.push(singleArgs);
    });
    return mysql.insert(sql, [args], trans);
  }
}
