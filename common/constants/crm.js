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
  clearance: 0,
  transport: 1,
  clearanceAndTransport: 2,
};
