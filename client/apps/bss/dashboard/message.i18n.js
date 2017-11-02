import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  dashboard: {
    id: 'bss.dashboard',
    defaultMessage: '工作台',
  },
  stats: {
    id: 'bss.dashboard.stats',
    defaultMessage: '数据统计',
  },
  totalInbound: {
    id: 'bss.dashboard.stats.inbound.total.asn',
    defaultMessage: '入库单总数',
  },
  toReceive: {
    id: 'bss.dashboard.stats.inbound.to.receive',
    defaultMessage: '待入库数',
  },
  received: {
    id: 'bss.dashboard.stats.inbound.received',
    defaultMessage: '入库完成数',
  },
  totalOutbound: {
    id: 'bss.dashboard.stats.outbound.total.so',
    defaultMessage: '出库单总数',
  },
  toAllocate: {
    id: 'bss.dashboard.stats.outbound.to.allocate',
    defaultMessage: '待分配数',
  },
  toPick: {
    id: 'bss.dashboard.stats.outbound.to.pick',
    defaultMessage: '待拣货数',
  },
  toShip: {
    id: 'bss.dashboard.stats.outbound.to.ship',
    defaultMessage: '待发货数',
  },
  shippingCompleted: {
    id: 'bss.dashboard.stats.outbound.completed',
    defaultMessage: '出库完成数',
  },
  tasksTotal: {
    id: 'bss.dashboard.stats.tasks.total',
    defaultMessage: '总量',
  },
  tasksCompleted: {
    id: 'bss.dashboard.stats.tasks.completed',
    defaultMessage: '完成量',
  },
  receipts: {
    id: 'bss.dashboard.stats.tasks.receipts',
    defaultMessage: '收货',
  },
  putaways: {
    id: 'bss.dashboard.stats.tasks.putaways',
    defaultMessage: '上架',
  },
  pickings: {
    id: 'bss.dashboard.stats.tasks.pickings',
    defaultMessage: '拣货',
  },
  shipments: {
    id: 'bss.dashboard.stats.tasks.shipments',
    defaultMessage: '发货',
  },
  replenishments: {
    id: 'bss.dashboard.stats.tasks.replenishments',
    defaultMessage: '补货',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
