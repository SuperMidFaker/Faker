import { defineMessages } from 'react-intl';

export default defineMessages({
  transportDashboard: {
    id: 'transport.dashboard',
    defaultMessage: '工作台',
  },
  accepted: {
    id: 'transport.dashboard.log.type.accepted',
    defaultMessage: '已受理运单',
  },
  sent: {
    id: 'transport.dashboard.log.type.sent',
    defaultMessage: '已调度运单',
  },
  pickedup: {
    id: 'transport.dashboard.log.type.pickedup',
    defaultMessage: '已提货运单',
  },
  delivered: {
    id: 'transport.dashboard.log.type.delivered',
    defaultMessage: '已交货运单',
  },
  completed: {
    id: 'transport.dashboard.log.type.completed',
    defaultMessage: '已完成运单',
  },
});
