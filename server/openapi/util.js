export function makePartnerCode(code, subCode) {
  if (subCode) {
    return `${code}/${subCode}`;
  } else if (code) {
    return code;
  } else {
    return '';
  }
}
