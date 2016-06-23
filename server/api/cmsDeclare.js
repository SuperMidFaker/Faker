// import cobody from 'co-body';
import Result from '../util/responseResult';

function *getDelgDeclares() {
  return Result.ok(this, {
    totalCount: 1,
    pageSize: 10,
    current: 1,
    data: [{
      delg_no: 'as11000d',
      acpt_time: new Date(),
    }],
  });
}
export default [
  [ 'get', '/v1/cms/delegation/declares', getDelgDeclares ],
];
