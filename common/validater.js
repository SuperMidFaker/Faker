import messages from './message.i18n';
/**
 *移动：134、135、136、137、138、139、150、151、157(TD)、158、159、187、188
 *联通：130、131、132、152、155、156、182、185、186
 *电信：133、153、180、189、（1349卫通）
 */
function isMobile(phone, defaultPhone) {
  if (phone === defaultPhone) {
    return true;
  }
  const phoneRe = new RegExp('^((13[0-9])|(14[0-9])|(17[0-9])|(15[^4,\\D])|(18[0-3,5-9]))\\d{8}$');
  return phoneRe.test(phone);
}
function getSmsCode(len) {
  let str = '';
  for (let i = 0; i < len; ++i) {
    str += Math.floor(Math.random() * 10);
  }
  return str;
}

function validatePhone(phone, callback, formatFn) {
  if (phone === undefined || phone === '') {
    callback(new Error(formatFn(messages, 'phoneRequired')));
  } else if (isMobile(phone)) {
    callback();
  } else {
    callback(new Error(formatFn(messages, 'invalidPhone')));
  }
}

export function isPositiveInteger(val) {
  if (!val || (val.trim && !val.trim())) {
    return undefined;
  }
  const num = +val; // Number(val)
  if (Number.isNaN(num)) {
    return false;
  }
  const numint = parseInt(num, 10);
  if (numint !== num || numint < 0) {
    return false;
  }
  return true;
}
export {
  validatePhone,
  isMobile,
  getSmsCode,
};
