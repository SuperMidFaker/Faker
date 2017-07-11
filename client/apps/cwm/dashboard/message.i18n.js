import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  dashboard: {
    id: 'cwm.dashboard',
    defaultMessage: '看板',
  },
  stats: {
    id: 'cwm.dashboard.stats',
    defaultMessage: '数据统计',
  },
  totalASN: {
    id: 'cwm.dashboard.stats.receiving.total.asn',
    defaultMessage: '收货通知总数',
  },
  toReceive: {
    id: 'cwm.dashboard.stats.receiving.to.receive',
    defaultMessage: '待收货数',
  },
  received: {
    id: 'cwm.dashboard.stats.receiving.received',
    defaultMessage: '收货完成数',
  },
  statsShipping: {
    id: 'cwm.dashboard.stats.shipping',
    defaultMessage: '发货统计',
  },
  totalSO: {
    id: 'cwm.dashboard.stats.shipping.total.so',
    defaultMessage: '发货订单总数',
  },
  toAllocate: {
    id: 'cwm.dashboard.stats.shipping.to.allocate',
    defaultMessage: '待分配数',
  },
  toPick: {
    id: 'cwm.dashboard.stats.shipping.to.pick',
    defaultMessage: '待拣货数',
  },
  pickingCompleted: {
    id: 'cwm.dashboard.stats.shipping.picking.completed',
    defaultMessage: '拣货完成数',
  },
  shippingCompleted: {
    id: 'cwm.dashboard.stats.shipping.completed',
    defaultMessage: '发货完成数',
  },
  statsTasks: {
    id: 'cwm.dashboard.stats.tasks',
    defaultMessage: '作业量统计',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
