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
  easipassConfig: {
    id: 'open.platform.integration.easipass.config',
    defaultMessage: '亿通配置',
  },
  integrationName: {
    id: 'open.platform.integration.name',
    defaultMessage: '接口名称',
  },
  integrationAppType: {
    id: 'open.platform.integration.app',
    defaultMessage: '整合应用类型',
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
  installApp: {
    id: 'open.platform.integration.install.app',
    defaultMessage: '安装',
  },
  saveApp: {
    id: 'open.platform.integration.save.app',
    defaultMessage: '保存',
  },
  cancel: {
    id: 'open.platform.integration.cancel',
    defaultMessage: '取消',
  },
  integrationNameRequired: {
    id: 'open.platform.integration.name.required',
    defaultMessage: '应用接口名称必填',
  },
  parameterRequired: {
    id: 'open.platform.integration.paramter.required',
    defaultMessage: '接口参数必填',
  },
  epSendTradeCode: {
    id: 'open.platform.integration.easipass.sendTradeCode',
    defaultMessage: '发送方协同ID号',
  },
  epRecvTradeCode: {
    id: 'open.platform.integration.easipass.recvTradeCode',
    defaultMessage: '接收方协同ID号',
  },
  epUserCode: {
    id: 'open.platform.integration.easipass.epUserCode',
    defaultMessage: '接收方用户ID(多个逗号分隔)',
  },
  FTPserver: {
    id: 'open.platform.integration.easipass.ftp.server',
    defaultMessage: 'FTP地址',
  },
  FTPusername: {
    id: 'open.platform.integration.easipass.ftp.username',
    defaultMessage: '用户名',
  },
  FTPpassword: {
    id: 'open.platform.integration.easipass.ftp.password',
    defaultMessage: '密码',
  },
  sendDirectory: {
    id: 'open.platform.integration.easipass.ftp.send.directory',
    defaultMessage: '发送目录',
  },
  recvDirectory: {
    id: 'open.platform.integration.easipass.ftp.recv.directory',
    defaultMessage: '接收目录',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
