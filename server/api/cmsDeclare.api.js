 import cobody from 'co-body';
import { Delegation, Dispatch } from '../models/cmsDelegation.db';
import { BillHeadDao, BillBodyDao, EntryHeadDao, EntryBodyDao } from '../models/cmsbillEntry.db';
import {
  CmsParamCustomsDao, CmsParamTradeDao, CmsParamTransModeDao,
  CmsParamTrxDao, CmsParamCountry, CmsParamRemission, CmsParamPorts,
  CmsParamDistricts, CmsParamCurrency, CmsParamUnit,
} from '../models/cmsParams.db';
import { CmsCompRelationDao } from '../models/cmsComp.db';
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
  const delgWhere = {};
  if (filter.name) {
    delgWhere.$or = [{
       delg_no: {
         $like: `%${filter.name}%`,
       },
     }, {
       invoice_no: {
         $like: `%${filter.name}%`,
       },
     }, {
       bl_wb_no: {
         $like: `%${filter.name}%`,
       },
     }];
  }
  const result = yield Delegation.findAndCountAll({
    attributes: [
      'delg_no', 'customer_name', 'contract_no', 'invoice_no',
      'bl_wb_no', 'voyage_no', 'pieces', 'weight'
    ],
    offset: (current - 1) * pageSize,
    limit: pageSize,
    raw: true,
    include: [{
      model: Dispatch,
      attributes: [
        'ref_delg_external_no', 'ref_recv_external_no',
        'delg_time', 'acpt_time', 'decl_time', 'clean_time',
        'bill_no', 'entry_id', 'comp_entry_id', 'source',
      ],
      where: {
        recv_tenant_id: tenantId,
        bill_status: billStatus,
      }
    }],
    where: delgWhere,
  });
  return Result.ok(this, {
    totalCount: result.count,
    pageSize,
    current,
    data: result.rows,
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
    ports, districts, currencies, packs: [], units,
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
  const { head, ietype, loginId } = yield cobody(this);
  let billNo = head.bill_no;
  if (!billNo) {
    const lastBill = yield BillHeadDao.findOne({ order: 'bill_no DESC' });
    if (lastBill) {
      billNo = BillHeadDao.genBillNo(lastBill.bill_no.slice(-6), ietype);
    } else {
      billNo = BillHeadDao.genBillNo(0, ietype);
    }
  }
  const dbOps = [ BillHeadDao.upsert({ ...head, bill_no: billNo, creater_login_id: loginId }) ];
  if (!head.bill_no) {
    dbOps.push(
      Dispatch.update({ bill_status: 1}, { where: { delg_no: head.delg_no }})
    );
  }
  yield dbOps;
  return Result.ok(this, { billNo });
}

function *addBillBody() {
  const { newBody, billNo, loginId } = yield cobody(this);
  const body = yield BillBodyDao.create({ ...newBody, bill_no: billNo, creater_login_id: loginId });
  return Result.ok(this, { id: body.id });
}

function *delBillBody() {
  const { bodyId } = yield cobody(this);
  yield BillBodyDao.destroy({
    where: {
      id: bodyId,
    },
  });
  return Result.ok(this);
}

function *editBillBody() {
  const body = yield cobody(this);
  yield BillBodyDao.update(body, { where: { id: body.id } });
  return Result.ok(this);
}

function *upsertEntryHead() {
  const { head, totalCount, loginId } = yield cobody(this);
  head.comp_entry_id = `${head.bill_no}-${totalCount + 1}`;
  head.creater_login_id = loginId;
  let id = head.id;
  if (id) {
    yield EntryHeadDao.update(head);
  } else {
    const row = yield EntryHeadDao.create(head);
    id = row.id;
  }
  return Result.ok(this, { id });
}

function *addEntryBody() {
  const { newBody, headId, loginId } = yield cobody(this);
  const body = yield EntryBodyDao.create({ ...newBody, head_id: headId, creater_login_id: loginId });
  return Result.ok(this, { id: body.id });
}

function *delEntryBody() {
  const { bodyId } = yield cobody(this);
  yield EntryBodyDao.destroy({
    where: {
      id: bodyId,
    },
  });
  return Result.ok(this);
}

function *editEntryBody() {
  const body = yield cobody(this);
  yield EntryBodyDao.update(body, { where: { id: body.id } });
  return Result.ok(this);
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
];
