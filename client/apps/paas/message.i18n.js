import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  paas: {
    id: 'paas',
    defaultMessage: '平台设置',
  },
  home: {
    id: 'paas.menu.home',
    defaultMessage: '平台主页',
  },
  integration: {
    id: 'paas.menu.integration',
    defaultMessage: '扩展与集成',
  },
  appStore: {
    id: 'paas.menu.app.store',
    defaultMessage: '应用市场',
  },
  installedPlugins: {
    id: 'paas.menu.installed.apps',
    defaultMessage: '已安装插件',
  },
  devApps: {
    id: 'paas.menu.dev.apps',
    defaultMessage: '自建应用',
  },
  dataAdapters: {
    id: 'paas.menu.adapters',
    defaultMessage: '数据适配器',
  },
  bizObject: {
    id: 'paas.menu.biz.object',
    defaultMessage: '业务对象',
  },
  stdObj: {
    id: 'paas.menu.biz.object.std',
    defaultMessage: '标准业务对象',
  },
  myObj: {
    id: 'paas.menu.biz.object.my',
    defaultMessage: '自定义业务对象',
  },
  field: {
    id: 'paas.menu.biz.object.field',
    defaultMessage: '通用字段',
  },
  purchaseOrder: {
    id: 'paas.menu.biz.object.purchase.order',
    defaultMessage: '采购订单',
  },
  commercialInvoice: {
    id: 'paas.menu.biz.object.commercial.invoice',
    defaultMessage: '商业发票',
  },
  shipmentOrder: {
    id: 'paas.menu.biz.object.shipment.order',
    defaultMessage: '货运订单',
  },
  customsDelegation: {
    id: 'paas.menu.biz.object.customs.delegation',
    defaultMessage: '报关委托',
  },
  customsManifest: {
    id: 'paas.menu.biz.object.customs.manifest',
    defaultMessage: '报关清单',
  },
  customsDeclaration: {
    id: 'paas.menu.biz.object.customs.declaration',
    defaultMessage: '报关单',
  },
  receivingNotice: {
    id: 'paas.menu.biz.object.receiving.notice',
    defaultMessage: '收货通知',
  },
  shippingOrder: {
    id: 'paas.menu.biz.object.shipping.order',
    defaultMessage: '出货订单',
  },
  inboundOrder: {
    id: 'paas.menu.biz.object.inbound.order',
    defaultMessage: '入库单',
  },
  outboundOrder: {
    id: 'paas.menu.biz.object.outbound.order',
    defaultMessage: '出库单',
  },
  freightOrder: {
    id: 'paas.menu.biz.object.freight.order',
    defaultMessage: '运输单',
  },
  bizFlow: {
    id: 'paas.menu.biz.flow',
    defaultMessage: '业务流程',
  },
  flowDesign: {
    id: 'paas.menu.flow.design',
    defaultMessage: '流程定制',
  },
  flowMonitor: {
    id: 'paas.menu.flow.monitor',
    defaultMessage: '流程监控',
  },
  paramPrefs: {
    id: 'paas.menu.param.prefs',
    defaultMessage: '参数配置',
  },
  shipmentParams: {
    id: 'paas.menu.param.prefs.shipment',
    defaultMessage: '货运参数',
  },
  templates: {
    id: 'paas.menu.templates',
    defaultMessage: '模板定制',
  },
  printTempl: {
    id: 'paas.menu.templates.print',
    defaultMessage: '打印模板',
  },
  noticeTempl: {
    id: 'paas.menu.templates.notice',
    defaultMessage: '通知模板',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
