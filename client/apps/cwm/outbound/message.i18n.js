import { defineMessages } from 'react-intl';

const messages = defineMessages({
  outbound: {
    id: 'cwm.outbound',
    defaultMessage: '出库管理',
  },
  shippingOrder: {
    id: 'cwm.outbound.shipping',
    defaultMessage: '出货订单',
  },
  outboundTransactions: {
    id: 'cwm.outbound.transactions',
    defaultMessage: '出库记录',
  },
  warehouse: {
    id: 'cwm.outbound.transactions.warehouse',
    defaultMessage: '仓库',
  },
  outboundNo: {
    id: 'cwm.outbound.transactions.outboundNo',
    defaultMessage: '出库流水号',
  },
  outboundDate: {
    id: 'cwm.outbound.transactions.outboundDate',
    defaultMessage: '出库日期',
  },
  sku: {
    id: 'cwm.outbound.transactions.sku',
    defaultMessage: 'SKU',
  },
  actualQty: {
    id: 'cwm.outbound.transactions.actual.qty',
    defaultMessage: '出库数量',
  },
  postQty: {
    id: 'cwm.outbound.transactions.postqty',
    defaultMessage: '库存余量',
  },
  lotserialNo: {
    id: 'cwm.outbound.transactions.lot.serialno',
    defaultMessage: '批次号/序列号',
  },
  consignee: {
    id: 'cwm.outbound.transactions.consignee',
    defaultMessage: '收货人',
  },
  unitPrice: {
    id: 'cwm.outbound.transactions.unit.price',
    defaultMessage: '单价',
  },
  manufexpiryDate: {
    id: 'cwm.outbound.transactions.manuf.expiry.date',
    defaultMessage: '生产/失效日期',
  },
});

export default messages;
