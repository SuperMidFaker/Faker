export const CUSTOMER_TYPES = [
  { label: '运输', value: 'transport' },
  { label: '清关', value: 'clearance' },
];

export const CRM_ORDER_STATUS = {
  created: 1,
  clearancing: 2,
  transporting: 3,
  finished: 4,
};

export const CRM_ORDER_MODE = {
  clearance: 'clearance',
  transport: 'transport',
};

export const CRM_BILLING_STATUS = {
  1: '创建未发送',
  2: '已发送,待对方对账',
  3: '待对账',
  4: '已修改,待对方对账',
  5: '接受',
  6: '已开票',
  7: '已核销',
};
