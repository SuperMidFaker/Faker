import cobody from 'co-body';
import idDao from '../models/importDelegate.db';
import Result from '../../reusable/node-util/response-result';

export default [
  ['get', '/v1/import/importdelegates', importdelegatesG] 
//   ['post', '/v1/import/importdelegates', importdelegatesP],
//   ['put', '/v1/import/importdelegates', updateDelegate],
//   ['delete', '/v1/import/importdelegates', delDelegate]
]

function *importdelegatesG() {
  const current = parseInt(this.request.query.currentPage || 1, 10);
  const pageSize = parseInt(this.request.query.pageSize || 10, 10);
  const tenantId = parseInt(this.request.query.tenantId || 0, 10);
  if (!tenantId) {
   // return Result.ParamError(this, 'corpid incorrect');
  }
  try {
    const totals = yield idDao.getIdTotalCount(tenantId);
    const ids = yield idDao.getPagedIdsByCorp(current, pageSize, tenantId);
    return Result.OK(this, {
      totalCount: totals.length > 0 ? totals[0].count : 0,
      pageSize,
      current,
      data: ids
    });
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, e.message);
  }
}



