import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  dev: {
    id: 'hub.dev',
    defaultMessage: '自建应用',
  },
  searchTip: {
    id: 'hub.dev.search.tip',
    defaultMessage: '搜索自建应用',
  },
  create: {
    id: 'hub.dev.create',
    defaultMessage: '新建应用',
  },
  delete: {
    id: 'hub.dev.delete',
    defaultMessage: '删除应用',
  },
  apiDocs: {
    id: 'hub.dev.api.docs',
    defaultMessage: 'API文档',
  },
  config: {
    id: 'hub.dev.config',
    defaultMessage: '配置',
  },
  save: {
    id: 'hub.dev.save',
    defaultMessage: '保存',
  },
  close: {
    id: 'hub.dev.close',
    defaultMessage: '关闭',
  },
  online: {
    id: 'hub.dev.online',
    defaultMessage: '上线',
  },
  offline: {
    id: 'hub.dev.offline',
    defaultMessage: '下线',
  },
  appLogo: {
    id: 'hub.dev.app.logo',
    defaultMessage: '图标',
  },
  appName: {
    id: 'hub.dev.app.name',
    defaultMessage: '名称',
  },
  appDesc: {
    id: 'hub.dev.app.desc',
    defaultMessage: '描述',
  },
  appId: {
    id: 'hub.dev.app.id',
    defaultMessage: 'Client ID',
  },
  appSecret: {
    id: 'hub.dev.app.secret',
    defaultMessage: 'Client Secret/密钥',
  },
  callbackUrl: {
    id: 'hub.dev.app.callback.url',
    defaultMessage: '回调地址',
  },
  hookUrl: {
    id: 'hub.dev.app.hook.url',
    defaultMessage: '触发调用地址',
  },
  homeEntranceUrl: {
    id: 'hub.dev.home.entrance.url',
    defaultMessage: '「首页」应用入口地址',
  },
  sofEntranceUrl: {
    id: 'hub.dev.sof.entrance.url',
    defaultMessage: '「订单中心」导航入口地址',
  },
  cmsEntranceUrl: {
    id: 'hub.dev.cms.entrance.url',
    defaultMessage: '「清关管理」导航入口地址',
  },
  bwmEntranceUrl: {
    id: 'hub.dev.bwm.entrance.url',
    defaultMessage: '「保税仓储」导航入口地址',
  },
  tmsEntranceUrl: {
    id: 'hub.dev.tms.entrance.url',
    defaultMessage: '「运输管理」导航入口地址',
  },
  bssEntranceUrl: {
    id: 'hub.dev.bss.entrance.url',
    defaultMessage: '「结算中心」导航入口地址',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
