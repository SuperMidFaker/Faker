export const INTEGRATION_APPS = [
  {
    app_type: 'SW',
    title: '『单一窗口』货物申报',
    category: 'catCus',
    link: '/paas/integration/singlewindow/install',
    description: '国际贸易单一窗口',
  },
  {
    app_type: 'QP',
    title: 'QP海关预录入系统',
    category: 'catCus',
    link: '/paas/integration/quickpass/install',
    description: 'QuickPass 海关预录入系统',
  },
  {
    app_type: 'EASIPASS',
    title: '亿通EDI海关申报系统',
    category: 'catCus',
    link: '/paas/integration/easipass/install',
    description: '亿通公司就针对海关通关管理系统',
  },
  {
    app_type: 'SHFTZ',
    title: '上海自贸区监管系统',
    category: 'catSup',
    link: '/paas/integration/shftz/install',
    description: '上海自贸区监管系统',
  },
  {
    app_type: 'ARCTM',
    title: 'Amber Road CTM',
    category: 'catEnt',
    link: '/paas/integration/arctm/install',
    description: 'Amber Road 中国贸易管理（CTM）系统',
  },
  {
    app_type: 'SFEXPRESS',
    title: '顺丰速运',
    category: 'catLog',
    link: '/paas/integration/sfexpress/install',
    description: '获取顺丰快递单号以打印快递单',
  },
];

export const PAAS_BIZ_OBJECTS = [
  {
    key: 'purchaseOrder',
    link: '/paas/objects/purchaseorder',
  },
  {
    key: 'commercialInvoice',
    link: '/paas/objects/comminvoice',
  },
  {
    key: 'shipmentOrder',
    link: '/paas/objects/shipment',
  },
  {
    key: 'customsDelegation',
    link: '/paas/objects/delegation',
  },
];

export const PAAS_PARAM_PREFS = [
  {
    key: 'shipmentParams',
    link: '/paas/prefs/shipment',
  },
  {
    key: 'currencies',
    link: '/paas/prefs/currencies',
  },
  {
    key: 'feeItems',
    link: '/paas/prefs/feeitems',
  },
  {
    key: 'taxes',
    link: '/paas/prefs/taxes',
  },
];

export const PAAS_TEMPLATES = [
  {
    key: 'notify',
    link: '/paas/templates/notify',
  },
];
