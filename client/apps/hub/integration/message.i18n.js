import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  openPlatform: {
    id: 'hub.integration.parent',
    defaultMessage: '协作平台',
  },
  integration: {
    id: 'hub.integration',
    defaultMessage: '整合管理',
  },
  integrationDesc: {
    id: 'hub.integration.desc',
    defaultMessage: '微骆平台提供了与主流关务软件、口岸信息平台的对接能力，企业用户可以通过配置对接参数，快速实现系统整合。',
  },
  appsStore: {
    id: 'hub.integration.apps.store',
    defaultMessage: '系统整合',
  },
  installedApps: {
    id: 'hub.integration.installed.apps',
    defaultMessage: '已安装应用',
  },
  appAmberRoadCTM: {
    id: 'hub.integration.app.arctm',
    defaultMessage: 'AmberRoad CTM',
  },
  appQuickPass: {
    id: 'hub.integration.app.quickpass',
    defaultMessage: 'QP预录入',
  },
  appEasipassEDI: {
    id: 'hub.integration.app.easipass',
    defaultMessage: '亿通海关EDI申报',
  },
  appSHFTZ: {
    id: 'hub.integration.app.shftz',
    defaultMessage: '上海自贸区监管',
  },
  appSFExpress: {
    id: 'hub.integration.app.sfexpress',
    defaultMessage: '顺丰快递',
  },
  interfaceConfig: {
    id: 'hub.integration.interface.config',
    defaultMessage: '接口配置',
  },
  integrationName: {
    id: 'hub.integration.name',
    defaultMessage: '接口名称',
  },
  integrationAppType: {
    id: 'hub.integration.app',
    defaultMessage: '整合应用类型',
  },
  incomingStatus: {
    id: 'hub.integration.incoming.status',
    defaultMessage: '接口输入状态',
  },
  outgoingStatus: {
    id: 'hub.integration.outgoing.status',
    defaultMessage: '接口输出状态',
  },
  opColumn: {
    id: 'hub.integration.opcolumn',
    defaultMessage: '操作',
  },
  installApp: {
    id: 'hub.integration.install.app',
    defaultMessage: '安装',
  },
  saveApp: {
    id: 'hub.integration.save.app',
    defaultMessage: '保存',
  },
  cancel: {
    id: 'hub.integration.cancel',
    defaultMessage: '取消',
  },
  integrationNameRequired: {
    id: 'hub.integration.name.required',
    defaultMessage: '应用接口名称必填',
  },
  parameterRequired: {
    id: 'hub.integration.paramter.required',
    defaultMessage: '接口参数必填',
  },
  epSendTradeCode: {
    id: 'hub.integration.easipass.sendTradeCode',
    defaultMessage: '发送方协同ID号',
  },
  epRecvTradeCode: {
    id: 'hub.integration.easipass.recvTradeCode',
    defaultMessage: '接收方协同ID号',
  },
  epUserCode: {
    id: 'hub.integration.easipass.epUserCode',
    defaultMessage: '接收方用户ID(多个逗号分隔)',
  },
  agentCustCode: {
    id: 'hub.integration.easipass.agent.custcode',
    defaultMessage: '申报单位十位编码',
  },
  FTPserver: {
    id: 'hub.integration.easipass.ftp.server',
    defaultMessage: 'FTP地址',
  },
  FTPusername: {
    id: 'hub.integration.easipass.ftp.username',
    defaultMessage: '用户名',
  },
  FTPpassword: {
    id: 'hub.integration.easipass.ftp.password',
    defaultMessage: '密码',
  },
  sendDirectory: {
    id: 'hub.integration.easipass.ftp.send.directory',
    defaultMessage: '发送目录',
  },
  recvDirectory: {
    id: 'hub.integration.easipass.ftp.recv.directory',
    defaultMessage: '接收目录',
  },
  AmberRoadCTMParam: {
    id: 'hub.integration.arctm.title.params',
    defaultMessage: 'AmberRoad CTM参数',
  },
  customerNo: {
    id: 'hub.integration.arctm.customerNo',
    defaultMessage: 'CTM客户',
  },
  username: {
    id: 'hub.integration.arctm.username',
    defaultMessage: '用户名',
  },
  password: {
    id: 'hub.integration.arctm.password',
    defaultMessage: '密码',
  },
  hookUrl: {
    id: 'hub.integration.arctm.hook.url',
    defaultMessage: '输入接口',
  },
  webserviceUrl: {
    id: 'hub.integration.arctm.webservice.url',
    defaultMessage: 'web service接口',
  },
  apiConfig: {
    id: 'hub.integration.shftz.api.config',
    defaultMessage: '监管接口配置',
  },
  ftzserver: {
    id: 'hub.integration.shftz.host.url',
    defaultMessage: '监管接口地址',
  },
  config: {
    id: 'hub.integration.config',
    defaultMessage: '配置',
  },
  sfexpressUrl: {
    id: 'hub.integration.sfexpress.url',
    defaultMessage: 'HTTP服务url',
  },
  sfexpressCheckword: {
    id: 'hub.integration.sfexpress.checkword',
    defaultMessage: '密钥',
  },
  sfexpressAccesscode: {
    id: 'hub.integration.sfexpress.accesscode',
    defaultMessage: '接入编码',
  },
  sfexpressCustid: {
    id: 'hub.integration.sfexpress.custid',
    defaultMessage: '月结卡号',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
