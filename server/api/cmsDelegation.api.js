import cobody from 'co-body';
import Result from '../util/responseResult';

function *createDelegation() {
  const body = yield cobody(this);
  try {
    console.log(body);
    return Result.ok(this);
  } catch(e) {
    return Result.internalServerError(this, e.message);
  }
}

export default [
  ['post', 'v1/cms/delegation/create', createDelegation]
];