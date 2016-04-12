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
import { DELEGATE_STATUS, TENANT_LEVEL, PARTNER_TENANT_TYPE, PARTNERSHIP_TYPE_INFO } from '../../../universal/constants';

function billHeadToEntryHead(entryId, head) {
  return {
    entry_id: entryId,
    del_id: head.del_id,
    del_no: head.del_no,
    i_e_flag: head.delegate_type === 0 ? 'I' : 'E',
    i_e_port: head.i_e_port,
    i_e_date: head.i_e_date,
    d_date: head.d_date,
    destination_port: head.distinate_port,
    traf_name: head.traf_name,
    traf_mode: head.traf_mode,
    trade_co: head.trade_co,
    trade_name: head.trade_name,
    district_code: head.district_code,
    owner_code: head.owner_code,
    owner_name: head.owner_name,
    agent_tenant_id: head.agent_tenant_id,
    agent_code: head.agent_code,
    agent_name: head.agent_name,
    voyage_no: head.voyage_no,
    contr_no: head.contr_no,
    bill_no: head.bill_no,
    trade_country: head.trade_country,
    trade_mode: head.trade_mode,
    cut_mode: head.cut_mode,
    trans_mode: head.trans_mode,
    container_no: head.jzxsl,
    pay_way: head.pay_mode,
    fee_mark: head.fee_mark,
    fee_curr: head.fee_curr,
    fee_rate: head.fee_rate,
    insur_mark: head.insur_mark,
    insur_curr: head.insur_curr,
    insur_rate: head.insur_rate,
    other_mark: head.other_mark,
    other_curr: head.other_curr,
    other_rate: head.other_rate,
    pack_no: head.pack_no,
    gross_wt: head.gross_wt,
    net_wt: head.net_wt,
    wrap_type: head.wrap_type,
    manual_no: head.ems_no,
    license_no: head.license_no,
    appr_no: head.appr_no,
    node_s: head.note,
    decl_port: head.master_customs,
    tenant_id: head.tenant_id,
    create_tenant_id: head.create_tenant_id
  };
}

function billHeadsToEntryHeads(ids, head) {
  if (!ids) {
    return [];
  }
  const eIds = ids.split(',');
  if (eIds.length === 0) {
    return [];
  }
  const eArr = [];
  eIds.forEach(id => {
    if (id) {
      eArr.push(billHeadToEntryHead(id, head));
    }
  });

  return eArr;
}

function billHeadToDelegate(head, sendName, recName, cTenantId) {
  return {
    del_no: head.del_no,
    status: DELEGATE_STATUS.accept.id,
    del_date: head.input_date,
    invoice_no: head.invoice_no,
    bill_no: head.bill_no,
    send_tenant_id: head.tenant_id,
    send_tenant_name: sendName,
    rec_tenant_id: head.agent_tenant_id,
    rec_tenant_name: recName,
    rec_del_date: head.input_date,
    master_customs: head.master_customs,
    declare_way_no: head.declare_way_no,
    usebook: head.ems_no ? 1 : 0,
    ems_no: head.ems_no,
    trade_mode: head.trade_mode,
    urgent: 0,
    delegate_type: head.delegate_type,
    tenant_id: cTenantId,
    created_date: new Date()
  };
}

function *billImport() {
  const bills = this.reqbody.bills;
  const cTenantId = this.tenant_id;

  if (isArray(bills)) {
    for (let i = 0; i < bills.length; i++) {
      const bill = bills[i];
      let res = yield [tenantDao.getTenantInfoByCode(bill.head.customer_id, bill.head.customer_subid),
        tenantDao.getTenantInfoByCode(bill.head.agent_code)];
      if (res.length !== 2) {
        return this.error(codes.params_error);
      }
      const tenant = res[0][0];  // customer tenant
      const ctenant = res[1][0]; // agent tenant

      // check current access token belong tenant
      /*
      if (tenant.tenant_id !== this.tenant_id &&
        ctenant.tenant_id !== this.tenant_id) {
        console.log('import bill data trade_co and agent_code not valid current access token tenant');
        return this.error(codes.params_error);
      }
      */

      if (tenant && ctenant && bill.head.external_no) {
        // gen del_no
        res = yield delegateDao.genDelNo(tenant.code, tenant.delegate_prefix, tenant.tenant_id);
        // bill.head.external_no = bill.head.del_no;
        if (bill.head.customer_subid && bill.head.customer_subid.length >= 10 &&
          bill.head.customer_subid !== bill.head.customer_id) {
          // change customer_id to right id and ignore customer_subid
          bill.head.customer_id = bill.head.customer_subid;
        }
        bill.head.del_no = res.del_no;
        bill.head.tenant_id = tenant.tenant_id; // customer tenant id
        bill.head.agent_tenant_id = ctenant.tenant_id;
        bill.head.create_tenant_id = cTenantId;

        // insert delegate
        const de = billHeadToDelegate(bill.head, tenant.name, ctenant.name, cTenantId);
        res = yield delegateDao.insertDe(de);
        bill.head.del_id = res.insertId;

        const entryId = bill.head.entry_id;
        bill.head.entry_id = '';
        for (let j = 0; j < bill.lists.length; j++) {
          bill.lists[j].del_id = bill.head.del_id;
          bill.lists[j].del_no = bill.head.del_no;
          bill.lists[j].tenant_id = bill.head.tenant_id;
          bill.lists[j].create_tenant_id = bill.head.create_tenant_id;
        }

        // pack entryId to entry heads array
        const entryHeads = billHeadsToEntryHeads(entryId, bill.head);

        // sql array
        const arr = [decbillDao.insertHead(bill.head),
          decbillDao.insertLists(bill.lists)];
        if (entryHeads.length > 0) {
          arr.push(entryDao.insertHead(entryHeads));
        }
        yield arr;
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
      if (!p.code || !p.name) {
        continue;
      }
      if (p.code === p.sub_code) {
        p.sub_code = '';
      }
      let res = yield [tenantDao.getTenantInfoByCode(p.code, p.sub_code),
        tenantDao.getTenantInfo(stenantId)];

      const name = res[1][0].name;

      if (res[0].length === 0) {
        p.category_id = p.category_id || 0;
        p.level = p.level || TENANT_LEVEL.STANDARD;
        p.aspect = 1;
        p.parent_tenant_id = 0;

        if (p.sub_code && p.sub_code.length > 0 && p.code !== p.sub_code) {
          const tns = yield tenantDao.getTenantInfoByCode(p.code);
          if (tns.length > 0) {
            p.parent_tenant_id = tns[0].tenant_id;
          }
        }

        res = yield tenantDao.insertCorp(p, p.parent_tenant_id);
        const tid = res.insertId;
        if (!p.sub_code) {
          yield tenantDao.bindSubTenant(tid, p.code);
        }

        yield [copsDao.insertPartner(stenantId, tid, p.name, PARTNER_TENANT_TYPE[0], 1),
          copsDao.insertPartner(tid, stenantId, name, PARTNER_TENANT_TYPE[0], 1)];

        if (isArray(part.ships) && part.ships.length > 0) {
          const arr1 = [];
          const arr2 = [];
          part.ships.forEach(v => {
            if (v.type_code === PARTNERSHIP_TYPE_INFO.customer) {
              arr2.push({key: 2, code: PARTNERSHIP_TYPE_INFO.customsClearanceBroker});
            } else {
              arr2.push({key: 0, code: PARTNERSHIP_TYPE_INFO.customer});
            }
            arr1.push({key: v.type, code: v.type_code});
          });

          yield [copsDao.insertPartnership(stenantId, tid, p.name, arr1),
            copsDao.insertPartnership(tid, stenantId, name, arr2)];
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

function *entryLogs() {
  const ids = this.reqbody.entry_id;
  if (ids) {
    const arr = ids.split(',');
    const res = yield entryDao.getEntryLogs(arr);
    const rarr = [];
    let lid;
    let idx = 0;
    for (let i = 0; i < res.length; i++) {
      const e = res[i];
      delete e.id;

      if (lid) {
        if (lid !== e.entry_id) {
          idx++;
          lid = e.entry_id;
          rarr.push({
            entry_id: lid,
            logs: [e]
          });
        } else {
          rarr[idx].logs.push(e);
        }
      } else {
        lid = e.entry_id;
        rarr.push({
          entry_id: lid,
          logs: [e]
        });
      }
    }
    return this.ok(rarr);
  }

  return this.error(codes.params_error);
}

function *addEntries() {
  const ids = this.reqbody.entry_id;
  const exNo = this.reqbody.external_no;
  if (ids && exNo) {
    const res = yield decbillDao.getHeadByExternalNo(exNo);
    if (res.length > 0) {
      // pack entryId to entry heads array
      const entryHeads = billHeadsToEntryHeads(ids, res[0]);
      if (entryHeads.length > 0) {
        yield entryDao.insertHead(entryHeads);
      }

      return this.ok();
    }
  }

  return this.error(codes.params_error);
}


export default [
  ['post', '/customs/bills', billImport, 'import_bills_url'],
  ['get', '/customs/status', billStatus, 'bill_status_info_url'],
  ['post', '/customs/partners', partnersImport, 'import_partners_url'],
  ['post', '/customs/entries', addEntries, 'add_entry_ids_url'],
  ['get', '/customs/entries/logs', entryLogs, 'gen_entry_logs_by_entry_id_url']
];
