import cobody from 'co-body';
import idDao from '../models/importTracking.db';
import Result from '../../reusable/node-util/response-result';
import mysql from '../../reusable/db-util/mysql';

export default [
  ['get', '/v1/import/importtracking', importtracking],
  ['get', '/v1/import/:tid/customsBrokers', customsBrokersG],
]

function* importtracking() {
  const current = parseInt(this.request.query.currentPage || 1, 10);
  const pageSize = parseInt(this.request.query.pageSize || 10, 10);
  const tenantId = parseInt(this.request.query.tenantId || 0, 10);

  const filters = this.request.query.filters ? JSON.parse(this.request.query.filters) : [];
  const sortField = this.request.query.sortField;
  const sortOrder = this.request.query.sortOrder;

  try {
    const totals = yield idDao.getIdTotalCount(filters, tenantId);
    const ids = yield idDao.getPagedIdsByCorp(current, pageSize, filters, sortField, sortOrder, tenantId);

    return Result.OK(this, {
      idlist: {
        totalCount: totals.length > 0 ? totals[0].count : 0,
        pageSize,
        current,
        data: ids
      }
    });
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, e.message);
  }
}

function* customsBrokersG() {
  const tenantId = this.params.tid;
  const cbs = yield idDao.getcustomsBrokers(tenantId);
  return Result.OK(this, cbs);
}
