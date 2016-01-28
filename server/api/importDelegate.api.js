import cobody from 'co-body';
import idDao from '../models/importDelegate.db';
import Result from '../../reusable/node-util/response-result';

export default [
  ['get', '/v1/import/importdelegates', importdelegates],
  ['get', '/v1/import/status', importdelegateStatusG]
//   ['put', '/v1/import/importdelegates', updateDelegate],
//   ['delete', '/v1/import/importdelegates', delDelegate]
]

function *importdelegates() {
  const current = parseInt(this.request.query.currentPage || 1, 10);
  const pageSize = parseInt(this.request.query.pageSize || 10, 10);
  //const tenantId = parseInt(this.request.query.tenantId || 0, 10);
  const currentStatus = parseInt(this.request.query.currentStatus || -1, 10);


  const filters = this.request.query.filters ? JSON.parse(this.request.query.filters) : [];
  const sortField = this.request.query.sortField;
  const sortOrder = this.request.query.sortOrder;
  
  try {
    const totals = yield idDao.getIdTotalCount(currentStatus,filters);
    const ids = yield idDao.getPagedIdsByCorp(current, pageSize, filters, sortField, sortOrder, currentStatus);
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

function *importdelegateStatusG() {

  const tenantId = parseInt(this.request.query.tenantId || 0, 10);
  const filters = this.request.query.filters ? JSON.parse(this.request.query.filters) : [];
  
  try {
    const notSendCount = yield idDao.getStatusCount(tenantId,0,filters);
    const notAcceptCount = yield idDao.getStatusCount(tenantId,1,filters);
    const acceptCount = yield idDao.getStatusCount(tenantId,2,filters);
    
    return Result.OK(this, {
      notSendCount:notSendCount.length > 0 ? notSendCount[0].count : 0,
      notAcceptCount:notAcceptCount.length > 0 ? notAcceptCount[0].count : 0,
      acceptCount:acceptCount.length > 0 ? acceptCount[0].count : 0
    });
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, e.message);
  }
}



