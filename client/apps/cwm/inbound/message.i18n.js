import { defineMessages } from 'react-intl';

const messages = defineMessages({
  inbound: {
    id: 'cwm.inbound',
    defaultMessage: '入库',
  },
  receivingNotice: {
    id: 'cwm.inbound.receiving',
    defaultMessage: '收货预告',
  },
  createRN: {
    id: 'cwm.inbound.receiving.create',
    defaultMessage: '新建收货预告',
  },
  inboundTransactions: {
    id: 'cwm.inbound.transactions',
    defaultMessage: '入库操作',
  },
  inboundListSearchPlaceholder: {
    id: 'cwm.inbound.list.placeholder',
    defaultMessage: 'SKU号或序列号或流水号',
  },
  warehouse: {
    id: 'cwm.inbound.transactions.warehouse',
    defaultMessage: '仓库',
  },
  inboundNo: {
    id: 'cwm.inbound.transactions.inboundNo',
    defaultMessage: '入库单号',
  },
  inboundDate: {
    id: 'cwm.inbound.transactions.inboundDate',
    defaultMessage: '入库日期',
  },
  sku: {
    id: 'cwm.inbound.transactions.sku',
    defaultMessage: 'SKU',
  },
  actualQty: {
    id: 'cwm.inbound.transactions.actual.qty',
    defaultMessage: '入库数量',
  },
  postQty: {
    id: 'cwm.inbound.transactions.postqty',
    defaultMessage: '库存数量',
  },
  lotserialNo: {
    id: 'cwm.inbound.transactions.lot.serialno',
    defaultMessage: '批次号/序列号',
  },
  vendor: {
    id: 'cwm.inbound.transactions.vendor',
    defaultMessage: '供应商',
  },
  unitPrice: {
    id: 'cwm.inbound.transactions.unit.price',
    defaultMessage: '单价',
  },
  manufexpiryDate: {
    id: 'cwm.inbound.transactions.manuf.expiry.date',
    defaultMessage: '生产/失效日期',
  },
});

export default messages;
