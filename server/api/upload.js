import cobusboy from 'co-busboy';
import Result from '../../reusable/node-util/response-result';
import fileUtil from '../../reusable/node-util/fileUtil';

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
    Result.OK(this, fileUtil.getFileUrl(fpath));
  } catch (e) {
    console.log(e);
    Result.InternalServerError(this, 'upload exception');
  }
}
