import cobusboy from 'co-busboy';
import Result from '../util/responseResult';
import fileUtil from '../util/fileUtil';

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
    const filename = part.filename;
    const buf = yield saveBuffer(part);
    const prefix = !!parts.field ? parts.field.prefix : null;
    const fpath = yield fileUtil.saveFileWithBuffer(buf, prefix, filename);
    Result.ok(this, fileUtil.getFileUrl(fpath));
  } catch (e) {
    console.log(e);
    Result.internalServerError(this, e.message);
  }
}

export default [
   ['post', '/v1/upload/img/', uploadImgs],
];
