import cobusboy from 'co-busboy';
import Result from '../util/responseResult';
import fileUtil from '../util/fileUtil';

export default [
   ['post', '/v1/upload/img/', uploadImgs]
];

function saveBuffer(stream) {
  const chunks = [];
  stream.on('data', (data) => {
    chunks.push(data);
  });
  return (done) => {
    stream.on('end', () => {
      const buf = Buffer.concat(chunks);
      done(null, buf);
    });
  };
}
function *uploadImgs() {
  const parts = cobusboy(this, { autoFields: true });
  try {
    const part = yield parts;
    const buf = yield saveBuffer(part);
    const prefix = !!parts.field ? parts.field.prefix : 'tms';
    const fpath = yield fileUtil.saveFileWithBuffer(buf, prefix);
    Result.ok(this, fileUtil.getFileUrl(fpath));
  } catch (e) {
    console.log(e);
    Result.internalServerError(this, 'upload exception');
  }
}
