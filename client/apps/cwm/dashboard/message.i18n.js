import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

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
  toReceive: {
    id: 'cwm.dashboard.stats.receiving.to.receive',
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
    id: 'cwm.dashboard.stats.shipping.total.so',
    defaultMessage: '发货订单数',
  },
  toAllocate: {
    id: 'cwm.dashboard.stats.shipping.to.allocate',
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
  statsTasks: {
    id: 'cwm.dashboard.stats.tasks',
    defaultMessage: '作业量统计',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
