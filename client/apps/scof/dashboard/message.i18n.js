import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  dashboard: {
    id: 'scof.dashboard',
    defaultMessage: '工作台',
  },
  orderStats: {
    id: 'scof.dashboard.order.stats',
    defaultMessage: '订单统计',
  },
  totalOrders: {
    id: 'scof.dashboard.order.total',
    defaultMessage: '订单总量',
  },
  pending: {
    id: 'scof.dashboard.order.pending',
    defaultMessage: '待处理',
  },
  processing: {
    id: 'scof.dashboard.order.processing',
    defaultMessage: '进行中',
  },
  urgent: {
    id: 'scof.dashboard.order.urgent',
    defaultMessage: '紧急',
  },
  completed: {
    id: 'scof.dashboard.order.completed',
    defaultMessage: '已完成',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
