import cobody from 'co-body';
import Result from '../../reusable/node-util/response-result';
import mysql from '../../reusable/db-util/mysql';
import taskDao from '../models/task.db';
import paraDao from '../models/para.db';


export default [
  ['get', '/v1/import/tasks', getTasks],
  ['get', '/v1/import/tasks/loadSource', loadSource]
];

function* loadSource() {
  try {
    const CustomsRel = yield paraDao.getCustomsRel();
    const Trade = yield paraDao.getTrade();
    const Transac = yield paraDao.getTransac();
    const Transf = yield paraDao.getTransf();
    const Country = yield paraDao.getCountry();
    const Levytype = yield paraDao.getLevytype();
    const District = yield paraDao.getDistrict();
    const Curr = yield paraDao.getCurr();
    const Port = yield paraDao.getPort();


    return Result.OK(this, {
        CustomsRel:CustomsRel,
        Trade:Trade,
        Transac:Transac,
        Transf:Transf,
        Country:Country,
        Levytype:Levytype,
        District:District,
        Curr:Curr,
        Port:Port
    });
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, e.message);
  }
}

function* getTasks() {
  const current = parseInt(this.request.query.currentPage || 1, 10);
  const pageSize = parseInt(this.request.query.pageSize || 10, 10);
  const tenantId = parseInt(this.request.query.tenantId || 0, 10);
  const loginId = parseInt(this.request.query.loginId || 0, 10);
  const currentStatus = parseInt(this.request.query.currentStatus || 1, 10) 


  const filters = this.request.query.filters ? JSON.parse(this.request.query.filters) : [];
  const sortField = this.request.query.sortField;
  const sortOrder = this.request.query.sortOrder;

  try {
    const totals = yield taskDao.getTaskTotalCount(loginId, tenantId, currentStatus, filters);
    const tasks = yield taskDao.getTasks(current, currentStatus, loginId, filters, pageSize, tenantId, sortField, sortOrder);
    console.log(tasks);
    const haveOrderCount = yield taskDao.getStatusCount(loginId, tenantId, 1, filters);
    const closeOrderCount = yield taskDao.getStatusCount(loginId, tenantId, 2, filters);


    return Result.OK(this, {
      tasklist: {
        totalCount: totals.length > 0 ? totals[0].count : 0,
        pageSize,
        current,
        data: tasks
      },
      statusList: {
        haveOrderCount: haveOrderCount.length > 0 ? haveOrderCount[0].count : 0,
        closeOrderCount: closeOrderCount.length > 0 ? closeOrderCount[0].count : 0
      }
    });
  } catch (e) {
    console.log(e);
    return Result.InternalServerError(this, e.message);
  }
}
