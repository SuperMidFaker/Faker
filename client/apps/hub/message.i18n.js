import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  hub: {
    id: 'hub',
    defaultMessage: '协作平台',
  },
  integration: {
    id: 'hub.integration',
    defaultMessage: '扩展与集成',
  },
  appStore: {
    id: 'hub.integration.app.store',
    defaultMessage: '应用市场',
  },
  installedApps: {
    id: 'hub.integration.installed.apps',
    defaultMessage: '已安装应用',
  },
  devApps: {
    id: 'hub.dev.apps',
    defaultMessage: '自建应用',
  },
  dataAdapters: {
    id: 'hub.data.adapters',
    defaultMessage: '数据适配器',
  },
  collab: {
    id: 'hub.collab',
    defaultMessage: '协作',
  },
  invitations: {
    id: 'hub.collab.invitations',
    defaultMessage: '协作邀请',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
