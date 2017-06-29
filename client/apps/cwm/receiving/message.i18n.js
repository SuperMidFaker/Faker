import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  receiving: {
    id: 'cwm.receiving',
    defaultMessage: '入库',
  },
  receivingASN: {
    id: 'cwm.receiving.asn',
    defaultMessage: '收货通知ASN',
  },
  createASN: {
    id: 'cwm.receiving.asn.create',
    defaultMessage: '新建收货通知',
  },
  receivingInound: {
    id: 'cwm.receiving.inbound',
    defaultMessage: '入库操作',
  },
  inboundListSearchPlaceholder: {
    id: 'cwm.receiving.list.placeholder',
    defaultMessage: 'SKU号或序列号或流水号',
  },
  warehouse: {
    id: 'cwm.receiving.transactions.warehouse',
    defaultMessage: '仓库',
  },
  inboundNo: {
    id: 'cwm.receiving.transactions.inboundNo',
    defaultMessage: '入库单号',
  },
  inboundDate: {
    id: 'cwm.receiving.transactions.inboundDate',
    defaultMessage: '入库日期',
  },
  sku: {
    id: 'cwm.receiving.transactions.sku',
    defaultMessage: 'SKU',
  },
  actualQty: {
    id: 'cwm.receiving.transactions.actual.qty',
    defaultMessage: '入库数量',
  },
  postQty: {
    id: 'cwm.receiving.transactions.postqty',
    defaultMessage: '库存数量',
  },
  lotserialNo: {
    id: 'cwm.receiving.transactions.lot.serialno',
    defaultMessage: '批次号/序列号',
  },
  vendor: {
    id: 'cwm.receiving.transactions.vendor',
    defaultMessage: '供应商',
  },
  unitPrice: {
    id: 'cwm.receiving.transactions.unit.price',
    defaultMessage: '单价',
  },
  manufexpiryDate: {
    id: 'cwm.receiving.transactions.manuf.expiry.date',
    defaultMessage: '生产/失效日期',
  },
  asnPlaceholder: {
    id: 'cwm.receiving.asn.search.place.holder',
    defaultMessage: '搜索ASN单号/订单号',
  },
  inboundPlaceholder: {
    id: 'cwm.receiving.asn.inbound.search.place.holder',
    defaultMessage: '搜索入库单号',
  },
  tabASN: {
    id: 'cwm.receiving.dock.tab.asn',
    defaultMessage: '收货通知',
  },
  tabFTZ: {
    id: 'cwm.receiving.dock.tab.ftz',
    defaultMessage: '海关备案',
  },
  tabInbound: {
    id: 'cwm.receiving.dock.tab.inbound',
    defaultMessage: '入库信息',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
