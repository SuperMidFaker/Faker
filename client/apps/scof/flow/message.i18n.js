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
    defaultMessage: '添加边',
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
    id: 'scof.flow.node.import',
    defaultMessage: '出口清关',
  },
  flowNodeTms: {
    id: 'scof.flow.node.tms',
    defaultMessage: '国内运输',
  },
  flowNodeCwm: {
    id: 'scof.flow.node.cwm',
    defaultMessage: '仓储协同',
  },
  saveFlow: {
    id: 'scof.flow.graph.save',
    defaultMessage: '保存流程',
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
  declCustoms: {
    id: 'scof.flow.biz.cms.declcustoms',
    defaultMessage: '申报地海关',
  },
  declWay: {
    id: 'scof.flow.biz.cms.declWay',
    defaultMessage: '申报方式',
  },
  transMode: {
    id: 'scof.flow.biz.cms.transMode',
    defaultMessage: '境内外运输模式',
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
  manifestTrading: {
    id: 'scof.flow.biz.cms.trading',
    defaultMessage: '收发货人',
  },
  manifestConsumer: {
    id: 'scof.flow.biz.cms.consumer',
    defaultMessage: '消费使用单位',
  },
  manifestProducer: {
    id: 'scof.flow.biz.cms.producer',
    defaultMessage: '生产消费单位',
  },
  manifestAgent: {
    id: 'scof.flow.biz.cms.agent',
    defaultMessage: '申报单位',
  },
  manifestTemplate: {
    id: 'scof.flow.biz.cms.manifest.template',
    defaultMessage: '清单模板',
  },
  nodeName: {
    id: 'scof.flow.biz.node.name',
    defaultMessage: '节点名称',
  },
  bizProperties: {
    id: 'scof.flow.biz.properites',
    defaultMessage: '属性',
  },
  bizEvents: {
    id: 'scof.flow.biz.events',
    defaultMessage: '触发事件',
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
    defaultMessage: '已生成',
  },
  onCustomsReviewed: {
    id: 'scof.flow.biz.event.cms.customs.reviewed',
    defaultMessage: '已审核',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
