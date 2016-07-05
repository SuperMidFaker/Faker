import cobody from 'co-body';
import { Delegation, Dispatch } from '../models/cmsDelegation.db';
import { BillHeadDao, BillBodyDao, EntryHeadDao, EntryBodyDao } from '../models/cmsbillEntry.db';
import {
  CmsParamCustomsDao, CmsParamTradeDao, CmsParamTransModeDao,
  CmsParamTrxDao, CmsParamCountry, CmsParamRemission, CmsParamPorts,
  CmsParamDistricts, CmsParamCurrency, CmsParamUnit, CmsParamHsCode,
} from '../models/cmsParams.db';
import { CmsCompRelationDao } from '../models/cmsComp.db';
import mergeSplit from './_utils/billMergeSplit';
import { CMS_BILL_STATUS } from 'common/constants';
import Result from '../util/responseResult';

function *getDelgDeclares() {
  let { filter, pageSize, current, tenantId } = this.request.query;
  pageSize = parseInt(pageSize, 10);
  current = parseInt(current, 10);
  tenantId = parseInt(tenantId, 10);
  filter = JSON.parse(filter);
  let billStatus = CMS_BILL_STATUS.undeclared;
  if (filter.declareType === 'declaring') {
    billStatus = CMS_BILL_STATUS.declaring;
  } else if (filter.declareType === 'declared') {
    billStatus = CMS_BILL_STATUS.declared;
  }
  const delgWhere = [];
  if (filter.name) {
    delgWhere.push(`
      delg_no LIKE '%${filter.name}%' OR invoice_no LIKE '%${filter.name}%' OR bl_wb_no LIKE '%${filter.name}%'
    `);
  }
  let whereClause = '';
  if (delgWhere.length > 0) {
    whereClause = `where ${delgWhere.join('')}`;
  }
  const counts = yield Delegation.getDelgBillEntryCount(billStatus, tenantId, whereClause);
  const offset = (current - 1) * pageSize;
  const limit = pageSize;
  const rows = yield Delegation.getPagedDelgBillEntry(billStatus, tenantId, whereClause, offset, limit);
  return Result.ok(this, {
    totalCount: counts[0],
    pageSize,
    current,
    data: rows,
  });
}

function *getDelgBills() {
  const { delgNo } = this.request.query;
  const [ bhead, delg ] = yield [
    BillHeadDao.findOne({
      raw: true,
      where: {
        delg_no: delgNo,
      },
    }),
    Delegation.findOne({
      raw: true,
      where: {
        delg_no: delgNo,
      },
    }),
  ];
  if (!delg) {
    return Result.internalServerError(this);
  }
  let bodies = [];
  let head = bhead;
  if (head) {
    bodies = yield BillBodyDao.findAll({
      raw: true,
      where: {
        bill_no: head.bill_no,
      },
    });
  } else {
    head = {
      invoice_no: delg.invoice_no,
      contract_no: delg.contract_no,
      bl_wb_no: delg.bl_wb_no,
      delg_no: delg.delg_no,
    };
  }
  return Result.ok(this, {
    head,
    bodies,
  });
}

function *getDelgEntries() {
  const { delgNo } = this.request.query;
  const heads = yield EntryHeadDao.findAll({
    raw: true,
    where: {
      delg_no: delgNo,
    },
  });
  const dbOps = [];
  const entries = [];
  for (let i = 0; i < heads.length; i++) {
    const head = heads[i];
    dbOps.push(EntryBodyDao.findAll({
      raw: true,
      where: {
        head_id: head.id,
      },
    }));
  }
  const dbBodies = yield dbOps;
  for (let i = 0; i < heads.length; i++) {
    const head = heads[i];
    const bodies = dbBodies[i];
    entries.push({
      head,
      bodies,
    });
  }
  return Result.ok(this, entries);
}

function *getDelgParams() {
  const dbOps = [
    CmsParamCustomsDao.findAll({ raw: true }),
    CmsParamTradeDao.findAll({ raw: true }),
    CmsParamTransModeDao.findAll({ raw: true }),
    CmsParamTrxDao.findAll({ raw: true }),
    CmsParamCountry.findAll({ raw: true }),
    CmsParamRemission.findAll({ raw: true }),
    CmsParamPorts.findAll({ raw: true }),
    CmsParamDistricts.findAll({ raw: true }),
    CmsParamCurrency.findAll({ raw: true }),
    CmsParamUnit.findAll({ raw: true }),
  ];
  const [
    customs, tradeModes, transModes, trxModes, tradeCountries, remissionModes,
    ports, districts, currencies, units,
  ] = yield dbOps;
  return Result.ok(this, {
    customs, tradeModes, transModes, trxModes, tradeCountries, remissionModes,
    ports, districts, currencies, units,
  });
}

function *getCompRelations() {
  const { type, ietype, code, tenantId } = this.request.query;
  const relations = yield CmsCompRelationDao.findAll({
    raw: true,
    attributes: [[ 'comp_code', 'code' ], [ 'comp_name', 'name' ]],
    where: {
      $or: [{
        i_e_type: ietype === 'import' ? 'I' : 'E',
      }, {
        i_e_type: 'A',
      }],
      relation_type: type,
      tenant_id: parseInt(tenantId, 10),
      comp_code: {
        $like: `%${code}%`,
      },
      status: 1,
    }
  });
  return Result.ok(this, relations);
}

function *upsertDelgBillHead() {
  try {
    const { head, ietype, loginId } = yield cobody(this);
    let billNo = head.bill_no;
    const dbOps = [];
    if (!billNo) {
      const lastBill = yield BillHeadDao.findOne({ order: 'bill_no DESC' });
      if (lastBill) {
        billNo = BillHeadDao.genBillNo(lastBill.bill_no.slice(-6), ietype);
      } else {
        billNo = BillHeadDao.genBillNo(0, ietype);
      }
      dbOps.push(
        BillHeadDao.create({ ...head, bill_no: billNo, creater_login_id: loginId }),
        Dispatch.update({ bill_status: 1}, { where: { delg_no: head.delg_no }})
      );
    } else {
      dbOps.push(
        BillHeadDao.update(head, { where: { bill_no: billNo }})
      );
    }
    yield dbOps;
    return Result.ok(this, { bill_no: billNo, ...head });
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *addBillBody() {
  try {
    const { newBody, billNo, loginId } = yield cobody(this);
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
    const body = yield BillBodyDao.create({
      ...newBody, bill_no: billNo, creater_login_id: loginId,
      special_hscode: specialHscode, custom_control: customControl,
    });
    return Result.ok(this, { id: body.id });
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *delBillBody() {
  try {
    const { bodyId } = yield cobody(this);
    yield BillBodyDao.destroy({
      where: {
        id: bodyId,
      },
    });
    return Result.ok(this);
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *editBillBody() {
  try {
    const body = yield cobody(this);
    const hscode = yield CmsParamHsCode.findOne({
      raw: true,
      where: {
        hscode: `${body.code_t}${body.code_s}`,
      },
    });
    body.special_hscode = 0;
    body.custom_control = 0;
    if (hscode) {
      if (hscode.special_mark === 1) {
        body.special_hscode = 1;
      }
      if (hscode.customs) {
        body.custom_control = 1;
      }
    }
    yield BillBodyDao.update(body, { where: { id: body.id } });
    return Result.ok(this);
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *upsertEntryHead() {
  try {
    const { head, totalCount, loginId } = yield cobody(this);
    head.comp_entry_id = `${head.bill_no}-${totalCount}`;
    head.creater_login_id = loginId;
    let id = head.id;
    if (id) {
      yield EntryHeadDao.update(head);
    } else {
      const row = yield EntryHeadDao.create(head);
      id = row.id;
    }
    return Result.ok(this, { id });
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *addEntryBody() {
  try {
    const { newBody, headId, loginId } = yield cobody(this);
    const body = yield EntryBodyDao.create({ ...newBody, head_id: headId, creater_login_id: loginId });
    return Result.ok(this, { id: body.id });
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *delEntryBody() {
  try {
    const { bodyId } = yield cobody(this);
    yield EntryBodyDao.destroy({
      where: {
        id: bodyId,
      },
    });
    return Result.ok(this);
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *editEntryBody() {
  try {
    const body = yield cobody(this);
    yield EntryBodyDao.update(body, { where: { id: body.id } });
    return Result.ok(this);
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *delEntry() {
  try {
    const { headId } = yield cobody(this);
    yield [
      EntryHeadDao.destroy({ where: { id: headId } }),
      EntryBodyDao.destroy({ where: { head_id: headId } }),
    ];
    return Result.ok(this);
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *mergeSplitBill() {
  try {
    const { billNo, mergeOpt, splitOpt, sortOpt } = yield cobody(this);
    const [ billHead, billList, lastEntryHead ] = yield [
      BillHeadDao.findOne({
        raw: true,
        where: {
          bill_no: billNo,
        },
      }),
      BillBodyDao.findAll({
        raw: true,
        where: {
          bill_no: billNo,
        },
      }),
      EntryHeadDao.findOne({
        raw: true,
        where: {
          bill_no: billNo,
        },
        order: 'comp_entry_id desc',
      }),
    ];
    let maxEntryNum = 0;
    if (lastEntryHead) {
      maxEntryNum = parseInt(lastEntryHead.comp_entry_id.slice(-6), 10);
    }
    const entries = mergeSplit(
      billHead, maxEntryNum, billList, { ...splitOpt, perCount: 20 },
      mergeOpt, sortOpt
    );
    const headDbs = [];
    entries.forEach(entry => {
      headDbs.push(EntryHeadDao.create(entry.head));
    });
    const headResults = yield headDbs;
    const bodyDbs = [];
    entries.forEach((entry, index) => {
      entry.bodies.forEach(body => {
        bodyDbs.push(EntryBodyDao.create({ ...body, head_id: headResults[index].id }));
      });
    });
    const bodyResults = yield bodyDbs;
    const entryResults = [];
    let bidx = 0;
    entries.forEach((entry, hidx) => {
      const head = { ...entry.head, id: headResults[hidx].id };
      const bodies = [];
      entry.bodies.forEach(bd => {
        bodies.push({ ...bd, head_id: headResults[hidx].id, id: bodyResults[bidx].id });
        bidx++;
      });
      entryResults.push({ head, bodies });
    });
    return Result.ok(this, entryResults);
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *fillEntryNo() {
  try {
    const { delgNo, entryNo, entryHeadId } = yield cobody(this);
    yield EntryHeadDao.update({ entry_id: entryNo }, { where: { id: entryHeadId }});
    const unfilledEntryHeadCount = yield EntryHeadDao.count({ where: { entry_id: null }});
    if (unfilledEntryHeadCount === 0) {
      yield Dispatch.update({ bill_status: 2 }, { where: { delg_no: delgNo }});
    }
    return Result.ok(this, { needReload: unfilledEntryHeadCount === 0 });
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

export default [
  [ 'get', '/v1/cms/delegation/declares', getDelgDeclares ],
  [ 'get', '/v1/cms/declare/bills', getDelgBills ],
  [ 'get', '/v1/cms/declare/entries', getDelgEntries ],
  [ 'get', '/v1/cms/declare/params', getDelgParams ],
  [ 'get', '/v1/cms/declare/comprelation', getCompRelations ],
  [ 'post', '/v1/cms/declare/billhead', upsertDelgBillHead ],
  [ 'post', '/v1/cms/declare/billbody/add', addBillBody ],
  [ 'post', '/v1/cms/declare/billbody/del', delBillBody ],
  [ 'post', '/v1/cms/declare/billbody/edit', editBillBody ],
  [ 'post', '/v1/cms/declare/entryhead', upsertEntryHead ],
  [ 'post', '/v1/cms/declare/entrybody/add', addEntryBody ],
  [ 'post', '/v1/cms/declare/entrybody/del', delEntryBody ],
  [ 'post', '/v1/cms/declare/entrybody/edit', editEntryBody ],
  [ 'post', '/v1/cms/declare/entry/del', delEntry ],
  [ 'post', '/v1/cms/declare/bill/mergesplit', mergeSplitBill ],
  [ 'post', '/v1/cms/declare/entry/fillno', fillEntryNo ],
];
