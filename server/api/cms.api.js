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
    let pageSize = parseInt(this.request.query.pageSize, 10);
    let currentPage = parseInt(this.request.query.currentPage, 10);
    const result = yield CompRelation.findAll({
      raw: true,
      where:{},
      offset: (currentPage-1) * pageSize,
      limit: pageSize
    });
    const totalCount = yield CompRelation.count();
    return Result.ok(this, {rows: result, pageSize, currentPage: currentPage, totalCount});
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
      where:query
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
    const { comp_code } = body;
    const count = yield CompRelation.count({ where: {comp_code} });
    if(count == 0) {
      yield CompRelation.create(body);
    }
    else {
      const set = {...body};
      
      delete set.comp_code;
      yield CompRelation.update(set,{where:{ comp_code }});
    }
    
    return Result.ok(this,{count});
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
