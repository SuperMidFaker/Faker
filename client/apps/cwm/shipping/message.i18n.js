import { defineMessages } from 'react-intl';

const messages = defineMessages({
  shipping: {
    id: 'cwm.shipping',
    defaultMessage: '出库',
  },
  shippingOrder: {
    id: 'cwm.shipping.order',
    defaultMessage: '发货订单SO',
  },
  shippingOutbound: {
    id: 'cwm.shipping.outbound',
    defaultMessage: '出库操作',
  },
  outboundListSearchPlaceholder: {
    id: 'cwm.shipping.list.placeholder',
    defaultMessage: 'SKU号或序列号或流水号',
  },
  warehouse: {
    id: 'cwm.shipping.transactions.warehouse',
    defaultMessage: '仓库',
  },
  outboundNo: {
    id: 'cwm.shipping.transactions.outboundNo',
    defaultMessage: '出库流水号',
  },
  outboundDate: {
    id: 'cwm.shipping.transactions.outboundDate',
    defaultMessage: '出库日期',
  },
  sku: {
    id: 'cwm.shipping.transactions.sku',
    defaultMessage: 'SKU',
  },
  actualQty: {
    id: 'cwm.shipping.transactions.actual.qty',
    defaultMessage: '出库数量',
  },
  postQty: {
    id: 'cwm.shipping.transactions.postqty',
    defaultMessage: '库存余量',
  },
  lotserialNo: {
    id: 'cwm.shipping.transactions.lot.serialno',
    defaultMessage: '批次号/序列号',
  },
  consignee: {
    id: 'cwm.shipping.transactions.consignee',
    defaultMessage: '收货人',
  },
  unitPrice: {
    id: 'cwm.shipping.transactions.unit.price',
    defaultMessage: '单价',
  },
  manufexpiryDate: {
    id: 'cwm.shipping.transactions.manuf.expiry.date',
    defaultMessage: '生产/失效日期',
  },
});

export default messages;
