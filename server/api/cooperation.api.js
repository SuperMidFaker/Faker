import cobody from 'co-body';
import coopDao from '../models/cooperation.db';
import tenantDao from '../models/tenant.db';
import Result from '../../reusable/node-util/response-result';

const partnershipTypeNames = ['客户', '报关', '货代', '运输', '仓储'];

function *partnershipTypeG() {
  const data = partnershipTypeNames.map((name, idx) => ({
    key: `${idx}`,
    name
  }));
  return Result.OK(this, data);
}

function *partnersG() {
  const current = parseInt(this.request.query.currentPage, 10);
  const pageSize = parseInt(this.request.query.pageSize, 10);
  const tenantId = parseInt(this.request.query.tenantId, 10);
  try {
    const totals = yield coopDao.getPartnersTotalCount(tenantId);
    const partners = yield coopDao.getPagedPartners(tenantId, current, pageSize);
    for (let i = 0; i < partners.length; ++i) {
      const partner = partners[i];
      partner.types = [];
      const partnerships = yield coopDao.getTenantPartnerships(tenantId, partner.name);
      partnerships.map(
        pt => partner.types.push({
          key: pt.type,
          name: pt.name
        })
      );
    }
    const tenants = yield tenantDao.getAllTenantsExcept(tenantId);
    return Result.OK(this, {
      partnerlist: {
        totalCount: 2,// totals.length > 0 ? totals[0].count : 0,
        pageSize,
        current,
        data: partners
      },
      tenants
    });
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, e.message);
  }
}

function *billP() {
  const body = yield cobody(this);
  try {
    // todo check duplicates by wh_code maybe
    const result = yield billDao.insertBill(body.bill, body.tenantId, body.tenantId);
    return Result.OK(this, { id: result.insertId });
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, '添加帐单异常');
  }
}

function *updateBill() {
  const body = yield cobody(this);
  try {
    yield billDao.updateBill(body.bill);
    return Result.OK(this);
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, '更新帐单异常');
  }
}

function *delBill() {
  const body = yield cobody(this);
  try {
    yield billDao.deleteBill(body.whkey);
    return Result.OK(this);
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, '删除帐单异常');
  }
}

export default [
  ['get', '/v1/cooperation/partnership/types', partnershipTypeG],
  ['get', '/v1/cooperation/partners', partnersG],
  ['post', '/v1/wewms/bill', billP],
  ['put', '/v1/wewms/bill', updateBill],
  ['delete', '/v1/wewms/bill', delBill],
]
