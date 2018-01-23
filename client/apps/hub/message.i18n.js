import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  hub: {
    id: 'hub',
    defaultMessage: '协作平台',
  },
  integration: {
    id: 'hub.menu.integration',
    defaultMessage: '扩展与集成',
  },
  appStore: {
    id: 'hub.menu.app.store',
    defaultMessage: '应用市场',
  },
  installedApps: {
    id: 'hub.menu.installed.apps',
    defaultMessage: '已安装应用',
  },
  devApps: {
    id: 'hub.menu.dev.apps',
    defaultMessage: '自建应用',
  },
  dataAdapters: {
    id: 'hub.menu.adapters',
    defaultMessage: '数据适配器',
  },
  collab: {
    id: 'hub.menu.collab',
    defaultMessage: '协作',
  },
  invitations: {
    id: 'hub.menu.collab.invitations',
    defaultMessage: '协作邀请',
  },
  templates: {
    id: 'hub.menu.collab.templates',
    defaultMessage: '通知模板',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
