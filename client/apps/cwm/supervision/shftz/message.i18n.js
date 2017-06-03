import { defineMessages } from 'react-intl';

const messages = defineMessages({
  receiving: {
    id: 'cwm.supervision.shftz',
    defaultMessage: '入库',
  },
  receivingASN: {
    id: 'cwm.supervision.shftz.asn',
    defaultMessage: '收货通知ASN',
  },
  createASN: {
    id: 'cwm.supervision.shftz.asn.create',
    defaultMessage: '新建收货通知',
  },
  receivingInound: {
    id: 'cwm.supervision.shftz.inbound',
    defaultMessage: '入库操作',
  },
  inboundListSearchPlaceholder: {
    id: 'cwm.supervision.shftz.list.placeholder',
    defaultMessage: 'SKU号或序列号或流水号',
  },
  warehouse: {
    id: 'cwm.supervision.shftz.transactions.warehouse',
    defaultMessage: '仓库',
  },
  inboundNo: {
    id: 'cwm.supervision.shftz.transactions.inboundNo',
    defaultMessage: '入库单号',
  },
  inboundDate: {
    id: 'cwm.supervision.shftz.transactions.inboundDate',
    defaultMessage: '入库日期',
  },
  sku: {
    id: 'cwm.supervision.shftz.transactions.sku',
    defaultMessage: 'SKU',
  },
  actualQty: {
    id: 'cwm.supervision.shftz.transactions.actual.qty',
    defaultMessage: '入库数量',
  },
  postQty: {
    id: 'cwm.supervision.shftz.transactions.postqty',
    defaultMessage: '库存数量',
  },
  lotserialNo: {
    id: 'cwm.supervision.shftz.transactions.lot.serialno',
    defaultMessage: '批次号/序列号',
  },
  vendor: {
    id: 'cwm.supervision.shftz.transactions.vendor',
    defaultMessage: '供应商',
  },
  unitPrice: {
    id: 'cwm.supervision.shftz.transactions.unit.price',
    defaultMessage: '单价',
  },
  manufexpiryDate: {
    id: 'cwm.supervision.shftz.transactions.manuf.expiry.date',
    defaultMessage: '生产/失效日期',
  },
});

export default messages;
