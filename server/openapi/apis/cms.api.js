/* eslint no-console:0 */
import { Delegation, Dispatch, DelegationEntryLogDao } from '../../models/cmsDelegation.db';
import tenantDao from '../../models/tenant.db';
import { Partner } from '../../models/cooperation.db';
import { BillHeadDao, BillBodyDao, EntryHeadDao, EntryBodyDao } from '../../models/cmsbillEntry.db';
import { CmsParamHsCode } from '../../models/cmsParams.db';
import { makePartnerCode } from '../util';
import { PARTNER_TENANT_TYPE, DELG_STATUS, DELG_SOURCE } from 'common/constants';
import codes from '../codes';

function *checkDelgNoExternalNoOrThrow(head, delgSrc, index) {
  let delgNo = head.delg_no;
  let billFinished = false;
  if (delgNo) {
    const delg = yield Dispatch.findOne({
      raw: true,
      where: { delg_no: delgNo, parent_id: null },
    });
    if (!delg) {
      throw { err_code: 3001, msg: `invalid delegation no at index ${index}` };
    }
    if ((delgSrc === 0 && delg.ref_delg_external_no !== head.external_no)
       || (delgSrc === 1 && delg.ref_recv_external_no !== head.external_no)) {
      throw {
        err_code: 3002,
        msg: `external_no not associated with delg_no at index ${index}`,
      };
    }
    if (delg.bill_status > 1) {
      // 已制单
      billFinished = true;
    }
  } else if (head.external_no) {
    let externalNoWhere;
    if (delgSrc === 0) {
      externalNoWhere = { ref_delg_external_no: head.external_no };
    } else {
      externalNoWhere = { ref_recv_external_no: head.external_no };
    }
    const delg = yield Dispatch.findOne({
      raw: true,
      where: { ...externalNoWhere, parent_id: null },
    });
    if (delg) {
      delgNo = delg.delg_no;
      if (delg.bill_status > 1) {
        // 已制单
        billFinished = true;
      }
    }
  }
  return { delgNo, billFinished };
}

function *createDelegate(head, billSrc, clientTid) {
  const ietype = head.delg_type;
  const [tenants, lastDelegation] = yield [
    tenantDao.getTenantInfo(clientTid),
    Delegation.findOne({
      where: { delg_type: ietype },
      attributes: ['delg_no'],
      order: [['created_date', 'DESC']],
    }),
  ];
  let delgNo;
  if (lastDelegation) {
    delgNo = Delegation.generateDelgNo(tenants[0].subdomain.toUpperCase(),
      ietype, lastDelegation.delg_no.slice(-5));
  } else {
    delgNo = Delegation.generateDelgNo(tenants[0].subdomain.toUpperCase(),
      ietype, 0);
  }
  const partnerCode = makePartnerCode(head.partner_code, head.partner_subcode);
  const partner = yield Partner.findOne({
    raw: true,
    where: {
      partner_code: partnerCode, name: head.partner_name, tenant_id: clientTid,
    },
  });
  let partnerTid;
  let partnerId;
  if (partner) {
    partnerTid = partner.partner_tenant_id;
    partnerId = partner.id;
  } else {
    partnerTid = -1;
    const partnerInst = yield Partner.create({
      name: head.partner_name,
      partner_code: partnerCode,
      tenant_type: PARTNER_TENANT_TYPE[3], // offline
      partner_tenant_id: -1,
      tenant_id: clientTid,
    });
    partnerId = partnerInst.id;
  }
  const delg = {
    delg_no: delgNo,
    delg_type: ietype,
    tenant_id: clientTid,
    decl_way_code: head.decl_way_code,
    customer_tenant_id: billSrc === 0 ? clientTid : partnerTid,
    customer_partner_id: billSrc === 0 ? null : partnerId,
    customer_name: billSrc === 0 ? tenants[0].name : head.partner_name,
    ccb_tenant_id: billSrc === 0 ? partnerTid : clientTid,
    ccb_partner_id: billSrc === 0 ? partnerId : null,
    ccb_name: billSrc === 0 ? head.partner_name : tenants[0].name,
    creater_login_id: head.creater_login_id,
    created_date: head.created_date,
  };
  const delgDisp = {
    delg_no: delgNo,
    ref_recv_external_no: billSrc === 0 ? null : head.external_no,
    ref_delg_external_no: billSrc === 0 ? head.external_no : null,
    send_tenant_id: delg.customer_tenant_id,
    send_partner_id: delg.customer_partner_id,
    send_name: delg.customer_name,
    recv_tenant_id: delg.ccb_tenant_id,
    recv_partner_id: delg.ccb_partner_id,
    recv_name: delg.ccb_name,
    delg_time: head.created_date,
    acpt_time: head.created_date, // 默认为接单
    status: DELG_STATUS.undeclared,
    source: DELG_SOURCE.consigned, // 委托
    bill_status: 0, // 未制单
  };
  const dbOps = [
    Delegation.create(delg),
    Dispatch.create(delgDisp),
  ];
  yield dbOps;
  return delgNo;
}

function *createBillHead(delgNo, head) {
  let billNo;
  const ietype = head.delg_type === 0 ? 'import' : 'export';
  const lastBill = yield BillHeadDao.findOne({
    order: 'bill_no DESC',
    where: { delg_type: head.delg_type },
  });
  if (lastBill) {
    billNo = BillHeadDao.genBillNo(lastBill.bill_no.slice(-6), ietype);
  } else {
    billNo = BillHeadDao.genBillNo(0, ietype);
  }
  yield [
    BillHeadDao.create({ ...head, bill_no: billNo, delg_no: delgNo }),
    Dispatch.update({ bill_status: 1 }, { where: { delg_no: head.delg_no } }),
  ];
  return billNo;
}

function *createBillBody(billNo, lists) {
  const dbOps = [];
  for (let i = 0; i < lists.length; i++) {
    const newBody = lists[i];
    const hscode = yield CmsParamHsCode.findOne({
      raw: true,
      where: {
        hscode: `${newBody.code_t}${newBody.code_s}`,
      },
    });
    let specialHscode = 0;
    let customControl = 0;
    if (hscode) {
      if (hscode.special_mark === 1) {
        specialHscode = 1;
      }
      if (hscode.customs) {
        customControl = 1;
      }
    }
    dbOps.push(BillBodyDao.create({
      ...newBody, bill_no: billNo, special_hscode: specialHscode,
      custom_control: customControl,
    }));
  }
  yield dbOps;
}

function *billsP() {
  const { bills } = this.reqbody;
  const clientTenantId = this.tenant_id;
  if (!bills) {
    return this.error(codes.params_error, 'bills is not defined');
  }
  try {
    for (let i = 0; i < bills.length; i++) {
      const { head, lists } = bills[i];
      const billSrc = parseInt(head.bill_source, 10);
      if (billSrc !== 0 && billSrc !== 1) {
        throw { err_code: 3003, msg: `bill_source is empty at index ${i}` };
      }
      const delgResult = yield* checkDelgNoExternalNoOrThrow(head, billSrc, i);
      if (delgResult.billFinished) {
        console.log('skip bill', head.delg_no, head.external_no);
        continue;
      }
      let delgNo = delgResult.delgNo;
      if (!delgNo) {
        delgNo = yield* createDelegate(head, billSrc, clientTenantId);
      }
      const billNo = yield* createBillHead(delgNo, head);
      yield* createBillBody(billNo, lists);
    }
    return this.ok();
  } catch (e) {
    /* handle error */
    this.internalServerError({ err_code: e.err_code || e.internalServerError.err_code, msg: e.msg || e.message });
  }
}

function *billsG() {
  const { delg_no: delgNo } = this.reqbody;
  if (!delgNo) {
    return this.error(codes.params_error, 'delg_no is not defined');
  }
  try {
    const heads = yield BillHeadDao.findAll({
      raw: true,
      where: { delg_no: delgNo },
    });
    const results = [];
    for (let i = 0; i < heads.length; i++) {
      const head = heads[i];
      const lists = yield BillBodyDao.findAll({
        raw: true,
        where: { bill_no: head.bill_no },
      });
      results.push({ head, lists });
    }
    return this.ok(results);
  } catch (e) {
    this.internalServerError({ err_code: e.err_code || e.internalServerError.err_code, msg: e.msg || e.message });
  }
}

function *createEntryHead(delgNo, head) {
  const row = yield EntryHeadDao.create({ ...head, delg_no: delgNo });
  const unfilledEntryHeadCount = yield EntryHeadDao.count({ where: {
    entry_id: null, delg_no: delgNo,
  } });
  if (unfilledEntryHeadCount === 0) {
    yield Dispatch.update({ bill_status: 2 }, { where: { delg_no: delgNo } });
  }
  return row.id;
}

function *createEntryBody(headId, lists) {
  const dbOps = [];
  for (let i = 0; i < lists.length; i++) {
    const body = lists[i];
    dbOps.push(
      EntryBodyDao.create({ ...body, head_id: headId })
    );
  }
  yield dbOps;
}

function *entriesP() {
  const { entries } = this.reqbody;
  const clientTenantId = this.tenant_id;
  if (!entries) {
    return this.error(codes.params_error, 'entries is not defined');
  }
  try {
    for (let i = 0; i < entries.length; i++) {
      const { head, lists } = entries[i];
      const entrySrc = parseInt(head.entry_source, 10);
      if (entrySrc !== 0 && entrySrc !== 1) {
        throw { err_code: 3003, msg: `entry_source is empty at index ${i}` };
      }
      const delgResult = yield* checkDelgNoExternalNoOrThrow(head, entrySrc, i);
      if (delgResult.billFinished) {
        console.log('skip entry', head.delg_no, head.external_no);
        continue;
      }
      let delgNo = delgResult.delgNo;
      if (!delgNo) {
        delgNo = yield* createDelegate(head, entrySrc, clientTenantId);
      }
      const headId = yield* createEntryHead(delgNo, head);
      yield* createEntryBody(headId, lists);
    }
    return this.ok();
  } catch (e) {
    this.internalServerError({ err_code: e.err_code || e.internalServerError.err_code, msg: e.msg || e.message });
  }
}

function *entryG() {
  const { delg_no: delgNo, entry_id: entryNo } = this.reqbody;
  let heads = [];
  if (delgNo) {
    heads = yield EntryHeadDao.findAll({
      raw: true,
      where: {
        delg_no: delgNo,
      },
    });
  } else if (entryNo) {
    heads = yield EntryHeadDao.findAll({
      raw: true,
      where: {
        entry_id: entryNo,
      },
    });
  } else {
    return this.error(codes.params_error, 'delg_no and entry_id are empty');
  }
  const results = [];
  for (let i = 0; i < heads.length; i++) {
    const head = heads[i];
    const lists = yield EntryBodyDao.findAll({
      raw: true,
      where: {
        head_id: head.id,
      },
    });
    results.push({ head, lists });
  }
  return this.ok(results);
}

function *entryLogG() {
  const { entry_id: entryNoStr } = this.reqbody;
  if (!entryNoStr) {
    return this.error(codes.params_error, 'entry_id is empty');
  }
  const entryNos = entryNoStr.split(',');
  const entryNoDbOps = [];
  for (let i = 0; i < entryNos.length; i++) {
    const entryNo = entryNos[i];
    entryNoDbOps.push(DelegationEntryLogDao.findAll({
      raw: true,
      attributes: ['entry_id', 'process_name', 'process_date'],
      where: { entry_id: entryNo },
    }));
  }
  const entryNoLogss = yield entryNoDbOps;
  const results = [];
  for (let i = 0; i < entryNos.length; i++) {
    const entryNo = entryNos[i];
    const entryNoLogs = entryNoLogss[i];
    results.push({
      entry_id: entryNo,
      logs: entryNoLogs,
    });
  }
  this.ok(results);
}

function *entryNosP() {
  const { entry_id: entryNoStr, comp_entry_id: compEntryIdStr } = this.reqbody;
  if (!entryNoStr || !compEntryIdStr) {
    return this.error(codes.params_error, 'entry_id or comp_entry_id is empty');
  }
  const entryNos = entryNoStr.split(',');
  const compEntryIds = compEntryIdStr.split(',');
  if (entryNos.length !== compEntryIds.length) {
    return this.error(codes.params_error, 'entry_id and comp_entry_id length is unequal');
  }
  const dbOps = [];
  for (let i = 0; i < entryNos.length; i++) {
    const entryNo = entryNos[i];
    dbOps.push(EntryHeadDao.update({
      entry_id: entryNo,
    }, {
      where: { comp_entry_id: compEntryIds[i] },
    }));
  }
  yield dbOps;
  this.ok();
}

export default [
  ['post', '/cms/bills', billsP],
  ['get', '/cms/bills', billsG],
  ['post', '/cms/entries', entriesP],
  ['get', '/cms/entry', entryG],
  ['get', '/cms/entry/logs', entryLogG],
  ['post', '/cms/entrynos', entryNosP],
];
