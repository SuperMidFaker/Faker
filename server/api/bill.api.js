import cobody from 'co-body';
import billDao from '../../reusable/models/bill.db';
import Result from '../../reusable/node-util/response-result';

export default [
  ['get', '/v1/wewms/bills', billG],
  ['post', '/v1/wewms/bill', billP],
  ['put', '/v1/wewms/bill', updateBill],
  ['delete', '/v1/wewms/bill', delBill],
]

function *billG() {
  const current = parseInt(this.request.query.currentPage || 1, 10);
  const pageSize = parseInt(this.request.query.pageSize || 10, 10);
  const corpId = parseInt(this.request.query.corpId || 0, 10);
  try {
    const totals = yield billDao.getBillTotalCount(corpId);
    const bills = yield billDao.getPagedBillsByCorp(current, pageSize, corpId); 
    const customers = [{ id: 1, name: 1}, { id: 2, name: 2}]; // todo
    return Result.OK(this, {
      bills :{
        totalCount: totals.length > 0 ? totals[0].count : 0,
        pageSize,
        current,
        customers,
        data: bills
      },
      customers
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
    const result = yield billDao.insertBill(body.bill, body.corpId, body.tenantId);
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
