import cobody from 'co-body';
import noticeDao from '../../reusable/models/notice.db';
import Result from '../../reusable/node-util/response-result';

export default [
  ['get', '/v1/wewms/notices', noticeG],
  ['post', '/v1/wewms/notice', noticeP],
  ['put', '/v1/wewms/notice', update],
  ['delete', '/v1/wewms/notice', del],
]

function *noticeG() {
  const current = parseInt(this.request.query.currentPage || 1, 10);
  const pageSize = parseInt(this.request.query.pageSize || 10, 10);
  const corpId = parseInt(this.request.query.corpId || 0, 10);
  if (!corpId) {
    return Result.ParamError(this, 'incorrect corpid');
  }
  try {
    const totals = yield noticeDao.getTotalCount(corpId);
    const items = yield noticeDao.getPagedItemsByCorp(current, pageSize, corpId);
    return Result.OK(this, {
      totalCount: totals.length > 0 ? totals[0].count : 0,
      pageSize,
      current,
      data: items
    });
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, e.message);
  }
}

function *noticeP() {
  const body = yield cobody(this);
  try {
    const createdDate = new Date();
    const result = yield noticeDao.insert(body.notice, createdDate, body.corpId, body.tenantId);
    // todo im send
    return Result.OK(this, { id: result.insertId, createdDate });
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, '发布通知异常');
  }
}

function *update() {
  const body = yield cobody(this);
  try {
    yield noticeDao.update(body.notice);
    return Result.OK(this);
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, '更新通知异常');
  }
}

function *del() {
  const body = yield cobody(this);
  try {
    yield noticeDao.deleteItem(body.key);
    return Result.OK(this);
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, '删除通知异常');
  }
}
