import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  dashboard: {
    id: 'sof.dashboard',
    defaultMessage: '工作台',
  },
  orderStats: {
    id: 'sof.dashboard.order.stats',
    defaultMessage: '订单统计',
  },
  totalOrders: {
    id: 'sof.dashboard.order.total',
    defaultMessage: '订单总量',
  },
  pending: {
    id: 'sof.dashboard.order.pending',
    defaultMessage: '待处理',
  },
  processing: {
    id: 'sof.dashboard.order.processing',
    defaultMessage: '进行中',
  },
  urgent: {
    id: 'sof.dashboard.order.urgent',
    defaultMessage: '紧急',
  },
  completed: {
    id: 'sof.dashboard.order.completed',
    defaultMessage: '已完成',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
