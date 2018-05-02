export const BSS_PLUGINS = [
  { key: 'expenseAudit', name: '费用审核' },
  { key: 'customerBills', name: '客户账单' },
  { key: 'vendorBills', name: '服务商账单' },
];

export const FEE_TYPE = [
  { key: 'SC', text: '服务费', tag: 'green' },
  { key: 'AP', text: '代垫费', tag: 'blue' },
  { key: 'SP', text: '特殊费用', tag: 'red' },
];

export const BILL_TYPE = [
  { key: 'buyerBill', text: '客户账单' },
  { key: 'sellerBill', text: '服务商账单' },
];

export const BILL_STATUS = [
  { key: 'draft', value: 1, text: '草稿' },
  { key: 'reconciling', value: 2, text: '对账' },
  { key: 'Written-Off', value: 4, text: '核销' },
];

export const SETTLE_TYPE = {
  owner: 1,
  vendor: 2,
};

export const INVOICE_OP = [
  { key: 'applyInvoice', text: '开票' },
  { key: 'collectInvoice', text: '收票' },
];
