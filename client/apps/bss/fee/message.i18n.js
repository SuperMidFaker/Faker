import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  fee: {
    id: 'bss.fee',
    defaultMessage: '费用',
  },
  feeSummary: {
    id: 'bss.fee.summary',
    defaultMessage: '费用汇总',
  },
  feeStatement: {
    id: 'bss.fee.statement',
    defaultMessage: '费用明细',
  },
  receivingASN: {
    id: 'bss.fee.asn',
    defaultMessage: '收货通知ASN',
  },
  createASN: {
    id: 'bss.fee.asn.create',
    defaultMessage: '新建收货通知',
  },
  receivingInound: {
    id: 'bss.fee.inbound',
    defaultMessage: '入库单',
  },
  inboundListSearchPlaceholder: {
    id: 'bss.fee.list.placeholder',
    defaultMessage: 'SKU号或序列号或流水号',
  },
  warehouse: {
    id: 'bss.fee.warehouse',
    defaultMessage: '仓库',
  },
  inboundNo: {
    id: 'bss.fee.inboundNo',
    defaultMessage: '入库单号',
  },
  inboundDate: {
    id: 'bss.fee.inboundDate',
    defaultMessage: '入库日期',
  },
  sku: {
    id: 'bss.fee.sku',
    defaultMessage: 'SKU',
  },
  actualQty: {
    id: 'bss.fee.actual.qty',
    defaultMessage: '入库数量',
  },
  postQty: {
    id: 'bss.fee.postqty',
    defaultMessage: '库存数量',
  },
  lotserialNo: {
    id: 'bss.fee.lot.serialno',
    defaultMessage: '批次号/序列号',
  },
  vendor: {
    id: 'bss.fee.vendor',
    defaultMessage: '供货商',
  },
  unitPrice: {
    id: 'bss.fee.unit.price',
    defaultMessage: '单价',
  },
  manufexpiryDate: {
    id: 'bss.fee.manuf.expiry.date',
    defaultMessage: '生产/失效日期',
  },
  asnPlaceholder: {
    id: 'bss.fee.asn.search.place.holder',
    defaultMessage: '搜索ASN编号/采购订单号',
  },
  inboundPlaceholder: {
    id: 'bss.fee.asn.inbound.search.place.holder',
    defaultMessage: '搜索ASN编号/入库单号',
  },
  tabASN: {
    id: 'bss.fee.dock.tab.asn',
    defaultMessage: '收货通知',
  },
  tabFTZ: {
    id: 'bss.fee.dock.tab.ftz',
    defaultMessage: '海关备案',
  },
  tabInbound: {
    id: 'bss.fee.dock.tab.inbound',
    defaultMessage: '入库信息',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
