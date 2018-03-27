import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  shipping: {
    id: 'cwm.shipping',
    defaultMessage: '出库',
  },
  save: {
    id: 'cwm.shipping.save',
    defaultMessage: '保存',
  },
  cancel: {
    id: 'cwm.shipping.cancel',
    defaultMessage: '取消',
  },
  shippingOrder: {
    id: 'cwm.shipping.order',
    defaultMessage: '出货订单SO',
  },
  regStatus: {
    id: 'cwm.shipping.reg.status',
    defaultMessage: '备案状态',
  },
  allSO: {
    id: 'cwm.shipping.order.all',
    defaultMessage: '全部出货订单',
  },
  inWaveSO: {
    id: 'cwm.shipping.order.in.wave',
    defaultMessage: '波次出货订单',
  },
  createSO: {
    id: 'cwm.shipping.order.create',
    defaultMessage: '创建出货订单',
  },
  batchImport: {
    id: 'cwm.shipping.order.batch.import',
    defaultMessage: '批量导入',
  },
  shippingWave: {
    id: 'cwm.shipping.wave',
    defaultMessage: '波次',
  },
  shippingOutbound: {
    id: 'cwm.shipping.outbound',
    defaultMessage: '出库单',
  },
  outboundStatus: {
    id: 'cwm.shipping.outbound.status',
    defaultMessage: '出库状态',
  },
  soPlaceholder: {
    id: 'cwm.shipping.so.search.placeholder',
    defaultMessage: '搜索SO编号/客户单号',
  },
  wavePlaceholder: {
    id: 'cwm.shipping.wave.search.placeholder',
    defaultMessage: '搜索波次编号',
  },
  outboundPlaceholder: {
    id: 'cwm.shipping.outbound.search.placeholder',
    defaultMessage: '搜索SO编号/出库单号',
  },
  outboundListSearchPlaceholder: {
    id: 'cwm.shipping.list.placeholder',
    defaultMessage: 'SKU号或序列号或流水号',
  },
  shippingLoad: {
    id: 'cwm.shipping.load',
    defaultMessage: '装车单',
  },
  tabSO: {
    id: 'cwm.shipping.dock.tab.so',
    defaultMessage: '出货订单',
  },
  tabFTZ: {
    id: 'cwm.shipping.dock.tab.ftz',
    defaultMessage: '海关备案',
  },
  tabOutbound: {
    id: 'cwm.shipping.dock.tab.outbound',
    defaultMessage: '出库信息',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
