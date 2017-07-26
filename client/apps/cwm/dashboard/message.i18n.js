import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  dashboard: {
    id: 'cwm.dashboard',
    defaultMessage: '工作台',
  },
  stats: {
    id: 'cwm.dashboard.stats',
    defaultMessage: '数据统计',
  },
  totalInbound: {
    id: 'cwm.dashboard.stats.inbound.total.asn',
    defaultMessage: '入库单总数',
  },
  toReceive: {
    id: 'cwm.dashboard.stats.inbound.to.receive',
    defaultMessage: '待入库数',
  },
  received: {
    id: 'cwm.dashboard.stats.inbound.received',
    defaultMessage: '入库完成数',
  },
  totalOutbound: {
    id: 'cwm.dashboard.stats.outbound.total.so',
    defaultMessage: '出库单总数',
  },
  toAllocate: {
    id: 'cwm.dashboard.stats.outbound.to.allocate',
    defaultMessage: '待分配数',
  },
  toPick: {
    id: 'cwm.dashboard.stats.outbound.to.pick',
    defaultMessage: '待拣货数',
  },
  toShip: {
    id: 'cwm.dashboard.stats.outbound.to.ship',
    defaultMessage: '待发货数',
  },
  shippingCompleted: {
    id: 'cwm.dashboard.stats.outbound.completed',
    defaultMessage: '出库完成数',
  },
  tasksTotal: {
    id: 'cwm.dashboard.stats.tasks.total',
    defaultMessage: '总量',
  },
  tasksCompleted: {
    id: 'cwm.dashboard.stats.tasks.completed',
    defaultMessage: '完成量',
  },
  receipts: {
    id: 'cwm.dashboard.stats.tasks.receipts',
    defaultMessage: '收货',
  },
  putaways: {
    id: 'cwm.dashboard.stats.tasks.putaways',
    defaultMessage: '上架',
  },
  pickings: {
    id: 'cwm.dashboard.stats.tasks.pickings',
    defaultMessage: '拣货',
  },
  shipments: {
    id: 'cwm.dashboard.stats.tasks.shipments',
    defaultMessage: '发货',
  },
  replenishments: {
    id: 'cwm.dashboard.stats.tasks.replenishments',
    defaultMessage: '补货',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
