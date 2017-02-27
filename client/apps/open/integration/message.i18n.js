import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  openPlatform: {
    id: 'open.platform',
    defaultMessage: '开放平台',
  },
  integration: {
    id: 'open.platform.integration',
    defaultMessage: '应用整合',
  },
  integrationDesc: {
    id: 'open.platform.integration.desc',
    defaultMessage: '微骆平台提供了与主流关务软件、口岸信息平台的对接能力，企业用户可以通过配置对接参数，快速实现系统整合。',
  },
  appsStore: {
    id: 'open.platform.integration.apps.store',
    defaultMessage: '应用中心',
  },
  installedApps: {
    id: 'open.platform.integration.installed.apps',
    defaultMessage: '已安装应用',
  },
  appAmberRoadCTM: {
    id: 'open.platform.integration.app.arctm',
    defaultMessage: 'AmberRoad CTM',
  },
  appEasipassEDI: {
    id: 'open.platform.integration.app.easipass',
    defaultMessage: '亿通海关EDI申报',
  },
  integrationName: {
    id: 'open.platform.integration.name',
    defaultMessage: '接口名称',
  },
  integrationApp: {
    id: 'open.platform.integration.app',
    defaultMessage: '整合应用',
  },
  incomingStatus: {
    id: 'open.platform.integration.incoming.status',
    defaultMessage: '接口输入状态',
  },
  outgoingStatus: {
    id: 'open.platform.integration.outgoing.status',
    defaultMessage: '接口输出状态',
  },
  opColumn: {
    id: 'open.platform.integration.opcolumn',
    defaultMessage: '操作',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
