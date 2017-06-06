import { defineMessages } from 'react-intl';

const messages = defineMessages({
  dashboard: {
    id: 'cwm.dashboard',
    defaultMessage: '看板',
  },
  statsReceiving: {
    id: 'cwm.dashboard.stats.receiving',
    defaultMessage: '收货统计',
  },
  totalASN: {
    id: 'cwm.dashboard.stats.receiving.total.asn',
    defaultMessage: '收货通知ASN数',
  },
  toBeReceived: {
    id: 'cwm.dashboard.stats.receiving.tobe.received',
    defaultMessage: '待收货数',
  },
  putawayCompleted: {
    id: 'cwm.dashboard.stats.receiving.putaway.completed',
    defaultMessage: '上架完成数',
  },
  statsShipping: {
    id: 'cwm.dashboard.stats.shipping',
    defaultMessage: '发货统计',
  },
  totalSO: {
    id: 'cwm.dashboard.stats.shipping.total.asn',
    defaultMessage: '收货通知ASN数',
  },
  toBeAllocated: {
    id: 'cwm.dashboard.stats.shipping.tobe.allocated',
    defaultMessage: '待分配数',
  },
  pickingCompleted: {
    id: 'cwm.dashboard.stats.shipping.picking.completed',
    defaultMessage: '拣货完成数',
  },
  packingVerified: {
    id: 'cwm.dashboard.stats.shipping.packing.verified',
    defaultMessage: '复核装箱数',
  },
});

export default messages;
