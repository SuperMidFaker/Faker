import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  flowName: {
    id: 'scof.flow.name',
    defaultMessage: '流程',
  },
  createFlow: {
    id: 'scof.flow.create',
    defaultMessage: '创建流程',
  },
  flowCustomer: {
    id: 'scof.flow.customer',
    defaultMessage: '客户',
  },
  customerTracking: {
    id: 'scof.flow.customer.tracking',
    defaultMessage: '客户追踪表',
  },
  flowRelationGraph: {
    id: 'scof.flow.relation.graph',
    defaultMessage: '流程关系图',
  },
  addFlowNode: {
    id: 'scof.flow.node.add',
    defaultMessage: '添加节点',
  },
  addFlowEdge: {
    id: 'scof.flow.edge.add',
    defaultMessage: '添加边界',
  },
  flowEdge: {
    id: 'scof.flow.graph.edge',
    defaultMessage: '节点边界',
  },
  sourceNode: {
    id: 'scof.flow.edge.source',
    defaultMessage: '源节点',
  },
  targetNode: {
    id: 'scof.flow.edge.target',
    defaultMessage: '目的节点',
  },
  edgeCondition: {
    id: 'scof.flow.edge.condition',
    defaultMessage: '边界条件',
  },
  flowNodeImport: {
    id: 'scof.flow.node.import',
    defaultMessage: '进口清关',
  },
  flowNodeExport: {
    id: 'scof.flow.node.export',
    defaultMessage: '出口清关',
  },
  flowNodeTMS: {
    id: 'scof.flow.node.tms',
    defaultMessage: '运输',
  },
  flowNodeCWM: {
    id: 'scof.flow.node.cwm',
    defaultMessage: '仓储',
  },
  flowNodeTerminal: {
    id: 'scof.flow.node.terminal',
    defaultMessage: '流程终结点',
  },
  saveFlow: {
    id: 'scof.flow.graph.save',
    defaultMessage: '保存',
  },
  bizObject: {
    id: 'scof.flow.biz.object',
    defaultMessage: '业务对象',
  },
  cmsDelegation: {
    id: 'scof.flow.biz.cms.delegation',
    defaultMessage: '委托',
  },
  cmsDeclManifest: {
    id: 'scof.flow.biz.cms.decl.manifest',
    defaultMessage: '清单',
  },
  cmsCustomsDecl: {
    id: 'scof.flow.biz.cms.customs.decl',
    defaultMessage: '报关单',
  },
  tmsShipment: {
    id: 'scof.flow.biz.tms.shipment',
    defaultMessage: '运单',
  },
  cwmReceiving: {
    id: 'scof.flow.biz.cwm.receiving',
    defaultMessage: '入库单',
  },
  cwmShipping: {
    id: 'scof.flow.biz.cwm.shipping',
    defaultMessage: '出库单',
  },
  declCustoms: {
    id: 'scof.flow.biz.cms.declcustoms',
    defaultMessage: '申报地海关',
  },
  declWay: {
    id: 'scof.flow.biz.cms.declWay',
    defaultMessage: '报关类型',
  },
  transMode: {
    id: 'scof.flow.biz.cms.transMode',
    defaultMessage: '运输方式',
  },
  customsBroker: {
    id: 'scof.flow.biz.cms.customs.broker',
    defaultMessage: '报关行',
  },
  ciqBroker: {
    id: 'scof.flow.biz.cms.ciq.broker',
    defaultMessage: '报检商',
  },
  quoteNo: {
    id: 'scof.flow.biz.cms.quote.no',
    defaultMessage: '报价编号',
  },
  manifestTemplate: {
    id: 'scof.flow.biz.cms.manifest.template',
    defaultMessage: '清单模板',
  },
  consigner: {
    id: 'scof.flow.biz.tms.consigner',
    defaultMessage: '发货人',
  },
  consignee: {
    id: 'scof.flow.biz.tms.consignee',
    defaultMessage: '收货人',
  },
  transitMode: {
    id: 'scof.flow.biz.tms.transit.mode',
    defaultMessage: '运输模式',
  },
  cargoType: {
    id: 'scof.flow.biz.tms.cargo.type',
    defaultMessage: '货物类型',
  },
  podType: {
    id: 'scof.flow.biz.tms.pod.type',
    defaultMessage: '回单',
  },
  locationType: {
    id: 'scof.flow.biz.tms.location.type',
    defaultMessage: '地点类型',
  },
  locationName: {
    id: 'scof.flow.biz.tms.location.name',
    defaultMessage: '地点名称',
  },
  locationProvince: {
    id: 'scof.flow.biz.tms.location.province',
    defaultMessage: '省/市/区',
  },
  locationAddress: {
    id: 'scof.flow.biz.tms.location.address',
    defaultMessage: '具体地址',
  },
  locationContact: {
    id: 'scof.flow.biz.tms.location.contact',
    defaultMessage: '联系人/电话/邮箱',
  },
  newStartLocation: {
    id: 'scof.flow.biz.tms.newStartLocation',
    defaultMessage: '新起始地',
  },
  nodeName: {
    id: 'scof.flow.biz.node.name',
    defaultMessage: '节点名称',
  },
  nodeResponsible: {
    id: 'scof.flow.biz.node.responsible',
    defaultMessage: '责任人',
  },
  bizProperties: {
    id: 'scof.flow.biz.properites',
    defaultMessage: '属性',
  },
  nodeEvents: {
    id: 'scof.flow.node.events',
    defaultMessage: '节点事件',
  },
  bizEvents: {
    id: 'scof.flow.biz.events',
    defaultMessage: '业务事件',
  },
  nodeOnEnter: {
    id: 'scof.flow.biz.node.onenter',
    defaultMessage: '进入节点',
  },
  nodeOnExit: {
    id: 'scof.flow.biz.node.onexit',
    defaultMessage: '离开节点',
  },
  onCreated: {
    id: 'scof.flow.biz.event.created',
    defaultMessage: '已创建',
  },
  onDelgDeclared: {
    id: 'scof.flow.biz.event.cms.declared',
    defaultMessage: '已申报',
  },
  onDelgInspected: {
    id: 'scof.flow.biz.event.cms.inspected',
    defaultMessage: '已查验',
  },
  onDelgReleased: {
    id: 'scof.flow.biz.event.cms.released',
    defaultMessage: '已放行',
  },
  onManifestGenerated: {
    id: 'scof.flow.biz.event.cms.manifest.generated',
    defaultMessage: '已生成报关建议书',
  },
  onCustomsReviewed: {
    id: 'scof.flow.biz.event.cms.customs.reviewed',
    defaultMessage: '已审核',
  },
  onShipmtAccepted: {
    id: 'scof.flow.biz.event.tms.shipmt.accepted',
    defaultMessage: '已接单',
  },
  onShipmtDispatched: {
    id: 'scof.flow.biz.event.tms.shipmt.dispatched',
    defaultMessage: '已调度',
  },
  onPickedUp: {
    id: 'scof.flow.biz.event.tms.shipment.pickedup',
    defaultMessage: '已提货',
  },
  onDelivered: {
    id: 'scof.flow.biz.event.tms.shipment.delivered',
    defaultMessage: '已送货',
  },
  onPod: {
    id: 'scof.flow.biz.event.tms.shipment.pod',
    defaultMessage: '已回单',
  },
  triggerActions: {
    id: 'scof.flow.trigger',
    defaultMessage: '事件触发器',
  },
  addTrigger: {
    id: 'scof.flow.trigger.add',
    defaultMessage: '添加触发器',
  },
  triggerMode: {
    id: 'scof.flow.trigger.mode',
    defaultMessage: '触发方式',
  },
  triggerTimer: {
    id: 'scof.flow.trigger.timer',
    defaultMessage: '定时器',
  },
  triggerAction: {
    id: 'scof.flow.trigger.action',
    defaultMessage: '触发动作',
  },
  timerWait: {
    id: 'scof.flow.trigger.timer.wait',
    defaultMessage: '等待',
  },
  instantTrigger: {
    id: 'scof.flow.trigger.instant',
    defaultMessage: '立即触发',
  },
  scheduledTrigger: {
    id: 'scof.flow.trigger.scheduled',
    defaultMessage: '定时触发',
  },
  actionCreate: {
    id: 'scof.flow.trigger.action.create',
    defaultMessage: '创建业务对象',
  },
  actionNotify: {
    id: 'scof.flow.trigger.action.notify',
    defaultMessage: '发送通知',
  },
  meantime: {
    id: 'scof.flow.trigger.action.instant.meantime',
    defaultMessage: '时立即',
  },
  timerMinutes: {
    id: 'scof.flow.trigger.action.scheduled.minutes',
    defaultMessage: '分钟',
  },
  deleteConfirm: {
    id: 'scof.flow.trigger.action.confirm.delete',
    defaultMessage: '确定删除该动作',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
