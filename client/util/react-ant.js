export function resolveCurrentPageNumber(total, current, pageSize) {
  // 删除完一页时返回上一页
  return total > 0 && (current - 1) * pageSize === total ? current - 1 : current;
}

export function getFormatMsg(message, formatFn) {
  return !message || typeof message === 'string' ? (message || '')
    : formatFn(message.key, message.values);
}
