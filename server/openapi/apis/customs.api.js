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

}

function *partnersImport() {
  const partners = this.reqbody.partners;
  if (isArray(partners)) {
    for (let i = 0; i < partners.length; i++) {
      const p = partners[i];

    }
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
