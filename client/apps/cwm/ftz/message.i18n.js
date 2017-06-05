import { defineMessages } from 'react-intl';

const messages = defineMessages({
  receiving: {
    id: 'cwm.ftz',
    defaultMessage: '入库',
  },
  receivingASN: {
    id: 'cwm.ftz.asn',
    defaultMessage: '收货通知ASN',
  },
  createASN: {
    id: 'cwm.ftz.asn.create',
    defaultMessage: '新建收货通知',
  },
  receivingInound: {
    id: 'cwm.ftz.inbound',
    defaultMessage: '入库操作',
  },
  inboundListSearchPlaceholder: {
    id: 'cwm.ftz.list.placeholder',
    defaultMessage: 'SKU号或序列号或流水号',
  },
  warehouse: {
    id: 'cwm.ftz.transactions.warehouse',
    defaultMessage: '仓库',
  },
  inboundNo: {
    id: 'cwm.ftz.transactions.inboundNo',
    defaultMessage: '入库单号',
  },
  inboundDate: {
    id: 'cwm.ftz.transactions.inboundDate',
    defaultMessage: '入库日期',
  },
  sku: {
    id: 'cwm.ftz.transactions.sku',
    defaultMessage: 'SKU',
  },
  actualQty: {
    id: 'cwm.ftz.transactions.actual.qty',
    defaultMessage: '入库数量',
  },
  postQty: {
    id: 'cwm.ftz.transactions.postqty',
    defaultMessage: '库存数量',
  },
  lotserialNo: {
    id: 'cwm.ftz.transactions.lot.serialno',
    defaultMessage: '批次号/序列号',
  },
  vendor: {
    id: 'cwm.ftz.transactions.vendor',
    defaultMessage: '供应商',
  },
  unitPrice: {
    id: 'cwm.ftz.transactions.unit.price',
    defaultMessage: '单价',
  },
  manufexpiryDate: {
    id: 'cwm.ftz.transactions.manuf.expiry.date',
    defaultMessage: '生产/失效日期',
  },
});

export default messages;
