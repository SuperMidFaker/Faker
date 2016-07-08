import cobody from 'co-body';
import Result from '../util/responseResult';
import mysql from '../util/mysql';
import { CompRelation } from '../models/cmsCompRelation.db';

export default [
  ['get', '/v1/cms/compRelations', compRelations],
  ['put', '/v1/cms/compRelation', insertCompRelation],
  ['get', '/v1/cms/compRelation', compRelation],
  ['post', '/v1/cms/compRelationStatus', compRelationStatus],
]

function* compRelations() {
  try {
    const query = this.request.query;
    const tenantId = query.tenantId;
    const pageSize = parseInt(query.pageSize, 10);
    const currentPage = parseInt(query.currentPage, 10);
    const result = yield CompRelation.findAll({
      raw: true,
      where:{
        tenant_id: tenantId
      },
      offset: (currentPage-1) * pageSize,
      limit: pageSize
    });
    const totalCount = yield CompRelation.count();
    return Result.ok(this, {rows: result, pageSize, currentPage, totalCount});
  } catch (e) {
    console.log(e);
    return Result.internalServerError(this, e.message);
  }
}
function* compRelation() {
  try {
    const query = this.request.query;
    const result = yield CompRelation.findOne({
      raw: true,
      where:{
        id: query.id
      }
    });
    return Result.ok(this, result);
  } catch (e) {
    console.log(e);
    return Result.internalServerError(this, e.message);
  }
}
function* insertCompRelation() {
  try {
    const body = yield cobody(this);
    const { id } = body;
    if(id == -1) {
      delete body.id;
      const result = yield CompRelation.create(body);
      return Result.ok(this, {insertId: result['null'], id});
    }
    else {
      const set = {...body};
      delete set.id;
      const result = yield CompRelation.update(set,{where:{ id }});
      return Result.ok(this, {result, id});
    }

  } catch (e) {
    console.log(e);
    return Result.internalServerError(this, e.message);
  }
}
function* compRelationStatus() {
  try {
    const body = yield cobody(this);
    const result = yield CompRelation.update(body.set, {where:body.where});
    return Result.ok(this);
  } catch (e) {
    console.log(e);
    return Result.internalServerError(this, e.message);
  }
}
