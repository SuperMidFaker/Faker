import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  paas: {
    id: 'paas',
    defaultMessage: '平台服务',
  },
  integration: {
    id: 'paas.menu.integration',
    defaultMessage: '扩展与集成',
  },
  appStore: {
    id: 'paas.menu.app.store',
    defaultMessage: '应用市场',
  },
  installedApps: {
    id: 'paas.menu.installed.apps',
    defaultMessage: '已安装应用',
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
  bizFlow: {
    id: 'paas.menu.biz.flow',
    defaultMessage: '业务流程',
  },
  flowDesigner: {
    id: 'paas.menu.flow.designer',
    defaultMessage: '流程构建器',
  },
  flowMonitor: {
    id: 'paas.menu.flow.monitor',
    defaultMessage: '流程监控',
  },
  paramPrefs: {
    id: 'paas.menu.param.prefs',
    defaultMessage: '参数配置',
  },
  templates: {
    id: 'paas.menu.templates',
    defaultMessage: '模板',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
