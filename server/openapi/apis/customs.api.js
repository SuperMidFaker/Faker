/**
 * Copyright (c) 2012-2016 Qeemo Ltd. All Rights Reserved.
 */
/**
 * User: Kurten
 * Date: 2016-03-17
 * Time: 17:12
 * Version: 1.0
 * Description:
 */
import { isArray } from 'util';

import tenantDao from '../../models/tenant.db';
import copsDao from '../../models/cooperation.db';
import dectrackDao from '../../models/dectrack.db';
import delegateDao from '../../models/delegate.db';
import decbillDao from '../../models/decbill.db';
import entryDao from '../../models/entry.db';
import codes from '../codes';

function *billImport() {
  const bills = this.reqbody.bills;

  if (isArray(bills)) {
    for (let i = 0; i < bills.length; i++) {
      const bill = bills[i];
      let res = yield [tenantDao.getTenantInfoByCode(bill.head.trade_co),
        tenantDao.getTenantInfoByCode(bill.head.agent_code)];
      const tenant = res[0][0];  // owner tenant
      const ctenant = res[1][0]; // create tenant
      if (tenant && ctenant) {
        res = yield delegateDao.genDelNo(tenant.code, tenant.delegate_prefix, tenant.tenant_id);
        bill.head.external_no = bill.head.del_no;
        bill.head.del_no = res.del_no;
        bill.head.tenant_id = tenant.tenant_id;
        bill.head.create_tenant_id = ctenant.tenant_id;

        const entryId = bill.head.entry_id;
        bill.head.entry_id = '';
        for (let j = 0; j < bill.lists.length; j++) {
          bill.lists[j].del_no = bill.head.del_no;
          bill.lists[j].tenant_id = tenant.tenant_id;
          bill.lists[j].create_tenant_id = ctenant.tenant_id;
        }
        const eIds = entryId.split(',');
        const eArr = [];
        eIds.forEach(id => {
          eArr.push({
            entry_id: id,
            del_no: bill.head.del_no,
            i_e_flag: bill.head.delegate_type === 0 ? 'I' : 'E',
            i_e_port: bill.head.master_customs,
            destination_port: bill.head.distinate_port,
            // TODO
          });
        });
        yield [decbillDao.insertHead(bill.head),
          decbillDao.insertLists(bill.lists)];
      }
    }
    return this.ok();
  }

  return this.error(codes.params_error);
}

function *partnersImport() {
  const partners = this.reqbody.partners;
  const stenantId = this.tenant_id;

  if (isArray(partners)) {
    for (let i = 0; i < partners.length; i++) {
      const part = partners[i];
      const p = part.partner;
      let res = yield tenantDao.getTenantInfoByCode(p.code);
      if (res.length === 0) {
        p.category_id = p.category_id || 0;
        p.level = p.level || 0;

        res = yield tenantDao.insertCorp(p, 0);
        const tid = res.insertId;

        yield copsDao.insertPartner(stenantId, tid, p.name, 'TENANT_ENTERPRISE', 1);

        const arr = [];
        if (isArray(part.ships)) {
          part.ships.forEach(v => {
            arr.push({key: v.type, code: v.type_code});
          });

          if (arr.length > 0) {
            yield copsDao.insertPartnership(stenantId, tid, p.name, arr);
          }
        }
      }
    }

    return this.ok();
  }

  return this.error(codes.params_error);
}

function *billStatus() {
  const no = this.reqbody.del_no;
  const tenantId = this.tenant_id;

  const res = yield dectrackDao.getTrackByExternalNo(no, tenantId);
  this.ok(res[0]);
}


export default [
  ['post', '/v1/customs/bill_import', billImport],
  ['get', '/v1/customs/status', billStatus],
  ['post', '/v1/partners/import', partnersImport]
];
