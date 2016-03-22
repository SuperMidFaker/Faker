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
import util from 'util';

import tenantDao from '../../models/tenant.db';
import copsDao from '../../models/cooperation.db';
import dectrackDao from '../../models/dectrack.db';
import codes from '../codes';

const isArray = util.isArray;

function *billImport() {
  const bills = this.reqbody.bills;

  if (isArray(bills)) {
    for (let i = 0; i < bills.length; i++) {
      const bill = bills[i];

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
