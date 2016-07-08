import cobody from 'co-body';
import Result from '../util/responseResult';
import { Delegation, Dispatch, DelegationFileDao } from '../models/cmsDelegation.db';
import tenantDao from '../models/tenant.db';
import coopDao from '../models/cooperation.db';
import { CmsCompDeclareWayDao, CmsParamTransModeDao, CmsParamTradeDao }
  from '../models/cmsParams.db';
import { PARTNERSHIP_TYPE_INFO, DELG_STATUS } from 'common/constants';

function *getAcceptDelegations() {
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const current = parseInt(this.request.query.currentPage, 10);
  const filters = JSON.parse(this.request.query.filter);
  const tenantId = parseInt(this.request.query.tenantId, 10);
  let dispWhere = {};
  if (filters.status === 'accepted') {
    dispWhere = { status: { $gt: DELG_STATUS.unaccepted }};
  } else if (filters.status === 'unaccepted') {
    dispWhere = { status: DELG_STATUS.unaccepted };
  }
  const delgs = yield Delegation.findAndCountAll({
    raw: true,
    attributes: [
      [ 'delg_no', 'key' ],
      `delg_no`, `invoice_no`, `contract_no`, `customer_name`,
      `bl_wb_no`, `pieces`, `weight`, `voyage_no`,
    ],
    offset: (current - 1) * pageSize,
    limit: pageSize,
    include: [{
      model: Dispatch,
      attributes: [
        `ref_delg_external_no`, `ref_recv_external_no`,
        `delg_time`, `acpt_time`, 'source', 'id',
      ],
      where: { ...dispWhere, recv_tenant_id: tenantId },
    }],
  });
  // todo clean the model.attribute with model name
  delgs.rows = delgs.rows.map(row => {
    return { ...row, ref_delg_external_no: row['cms_delegation_dispatches.ref_delg_external_no'],
      ref_recv_external_no: row['cms_delegation_dispatches.ref_recv_external_no'],
      delg_time: row['cms_delegation_dispatches.delg_time'],
      acpt_time: row['cms_delegation_dispatches.acpt_time'],
      source: row['cms_delegation_dispatches.source'],
      dispId: row['cms_delegation_dispatches.id'],
    };
  });
  return Result.ok(this, {
    totalCount: delgs.count,
    pageSize,
    current,
    data: delgs.rows,
  });
}

function *createDelegationByCCB() {
  try {
    const body = yield cobody(this);
    const {
      delegation, tenantId, loginId, username,
      ietype, source, tenantName, attachments,
      accepted,
    } = body;
    // 生成委托运单号delg_no
    const [ tenants, lastDelegation ] = yield [
      tenantDao.getTenantInfo(tenantId),
      Delegation.findOne({
        where: { delg_type: ietype },
        attributes: [ 'delg_no' ],
        order: [[ 'created_date', 'DESC' ]],
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
    const dbOps = [
      // 新建一条Delegation
      Delegation.create({
        ...delegation, tenant_id: tenantId, delg_no: delgNo, ccb_tenant_id: tenantId,
        ccb_partner_name: tenantName, creater_login_id: loginId, creater_login_name: username,
      }),
      // 新建一条Delegation Dispatch
      Dispatch.create({
        delg_no: delgNo, ref_recv_external_no: delegation.internal_no, send_login_id: loginId,
        send_login_name: username, send_tenant_id: delegation.customer_tenant_id,
        send_partner_id: delegation.customer_partner_id, send_name: delegation.customer_name,
        delg_time: new Date(), recv_tenant_id: tenantId, recv_name: tenantName, source,
        status: accepted ? DELG_STATUS.undeclared : DELG_STATUS.unaccepted,
        acpt_time: accepted ? new Date() : undefined,
      }),
    ];
    attachments.forEach(att => {
      dbOps.push(DelegationFileDao.create({
        delg_no: delgNo,
        doc_name: att.name,
        url: att.url,
        creater_login_id: loginId,
      }));
    });
    yield dbOps;
    return Result.ok(this);
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *findDelgClients() {
  const { tenantId, searched } = this.request.query;
  const partners = yield coopDao.getPartnerByTypeCode(tenantId, PARTNERSHIP_TYPE_INFO.customer, searched);
  return Result.ok(this, partners);
}

function *findDelgParams() {
  const { tenantId, searched, field, ieType } = this.request.query;
  if (field === 'decl_way_code') {
    const declareWayModes = yield CmsCompDeclareWayDao.findAll({
      raw: true,
      attributes: [['decl_way_code', 'value'], [ 'decl_way_name', 'text' ]],
      where: {
        tenant_id: tenantId,
        i_e_type: ieType === 'import' ? 0 : 1,
        decl_way_name: {
          $like: `%${searched}%`,
        },
      },
    });
    return Result.ok(this, { declareWayModes });
  } else if (field === 'trans_mode') {
    const transModes = yield CmsParamTransModeDao.findAll({
      raw: true,
      attributes: [[ 'trans_code', 'value' ], [ 'trans_spec', 'text' ]],
      where: [ 'trans_spec like ?', `%${searched}%` ],
    });
    return Result.ok(this, { transModes });
  } else if (field === 'trade_mode') {
    const tradeModes = yield CmsParamTradeDao.findAll({
      raw: true,
      attributes: [[ 'trade_mode', 'value' ], [ 'trade_abbr', 'text' ]],
      where: {
        trade_abbr: {
          $like: `%${searched}%`,
        },
      },
    });
    return Result.ok(this, { tradeModes });
  }
  return Result.ok(this);
}

function *acceptDelg() {
  try {
    const { loginId, loginName, dispId } = yield cobody(this);
    yield Dispatch.update({
      recv_login_id: loginId,
      recv_login_name: loginName,
      status: DELG_STATUS.undeclared,
      acpt_time: new Date(),
    }, { where: { id: dispId }});
    return Result.ok(this);
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *getDelegation() {
  const { delgNo } = this.request.query;
  try {
    const [ delegation, files ] = yield [
      Delegation.findOne({
        raw: true,
        attributes: [
          `delg_no`, 'order_no', `invoice_no`, `contract_no`, `bl_wb_no`, `pieces`,
          `weight`, `trans_mode`, `voyage_no`, `trade_mode`, `decl_way_code`,
          `ems_no`, `customer_tenant_id`, `customer_partner_id`, `customer_name`,
        ],
        where: {
            delg_no: delgNo,
          },
          include: [{
            model: Dispatch,
            attributes: [ 'ref_delg_external_no', 'ref_recv_external_no' ],
          }],
      }),
      DelegationFileDao.findAll({
        raw: true,
        attributes: [[ 'id', 'uid' ], [ 'doc_name', 'name' ], 'url' ],
        where: {
          delg_no: delgNo,
        },
      }),
    ];
    delegation.ref_delg_external_no =
      delegation['cms_delegation_dispatches.ref_delg_external_no'];
    delegation.ref_recv_external_no =
      delegation['cms_delegation_dispatches.ref_recv_external_no'];
    delegation['cms_delegation_dispatches.ref_delg_external_no'] = undefined;
    const [ transModes, tradeModes, declareWayModes ] = yield [
      CmsParamTransModeDao.findAll({
        raw: true,
        attributes: [ [ 'trans_code', 'value' ], ['trans_spec', 'text'] ],
        where: { trans_code: delegation.trans_mode },
      }),
      CmsParamTradeDao.findAll({
        raw: true,
        attributes: [ [ 'trade_mode', 'value' ], ['trade_abbr', 'text'] ],
        where: { trade_mode: delegation.trade_mode },
      }),
      CmsCompDeclareWayDao.findAll({
        raw: true,
        attributes: [ [ 'decl_way_code', 'value' ], [ 'decl_way_name', 'text' ] ],
        where: { decl_way_code: delegation.decl_way_code },
      }),
    ];
    return Result.ok(this, {
      delegation, files, formRequire: {
        transModes, tradeModes, declareWayModes,
      },
    });
  } catch (e) {
    Result.internalServerError(this, e.message);
  }
}

function *editDelgByCCB() {
  try {
    const { delegation, addedFiles, removedFiles, accepted, loginId } = yield cobody(this);
    const dbOps = [
      Delegation.update(delegation, { where: { delg_no: delegation.delg_no }}),
      Dispatch.update({
        status: accepted ? DELG_STATUS.undeclared : DELG_STATUS.unaccepted,
        acpt_time: accepted ? new Date() : undefined,
        ref_recv_external_no: delegation.internal_no,
      }, { where: { delg_no: delegation.delg_no }}),
    ];
    addedFiles.forEach(af => dbOps.push(
      DelegationFileDao.create({
        delg_no: delegation.delg_no,
        doc_name: af.name,
        url: af.url,
        creater_login_id: loginId,
      })
    ));
    removedFiles.forEach(rf => dbOps.push(
      DelegationFileDao.destroy({
        where: { id: rf.uid },
      })
    ));
    yield dbOps;
    return Result.ok(this);
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

function *delDelg() {
  try {
    const { delgNo } = yield cobody(this);
    yield [
      Delegation.destroy({ where: { delg_no: delgNo }}),
      Dispatch.destroy({ where: { delg_no: delgNo }}),
      DelegationFileDao.destroy({ where: { delg_no: delgNo }}),
    ];
    return Result.ok(this);
  } catch (e) {
    return Result.internalServerError(this, e.message);
  }
}

export default [
  [ 'get', '/v1/cms/acceptance/delegations', getAcceptDelegations ],
  [ 'post', '/v1/cms/ccb/delegation', createDelegationByCCB ],
  [ 'get', '/v1/cms/delegation/clients', findDelgClients ],
  [ 'get', '/v1/cms/delegation/params', findDelgParams ],
  [ 'post', '/v1/cms/delegation/accept', acceptDelg ],
  [ 'get', '/v1/cms/ccb/delegation', getDelegation ],
  [ 'post', '/v1/cms/ccb/delegation/edit', editDelgByCCB ],
  [ 'post', '/v1/cms/delegation/accept', acceptDelg ],
  [ 'post', '/v1/cms/delegation/del', delDelg ],
];
