import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  searchTip: {
    id: 'paas.integration.search.tip',
    defaultMessage: '搜索已安装应用',
  },
  allApps: {
    id: 'paas.integration.all.apps',
    defaultMessage: '全部应用',
  },
  categories: {
    id: 'paas.integration.categories',
    defaultMessage: '应用分类',
  },
  catEnt: {
    id: 'paas.integration.cat.ent',
    defaultMessage: '企业关务',
  },
  catCus: {
    id: 'paas.integration.cat.cus',
    defaultMessage: '海关申报',
  },
  catSup: {
    id: 'paas.integration.cat.sup',
    defaultMessage: '辅助监管',
  },
  catLog: {
    id: 'paas.integration.cat.log',
    defaultMessage: '物流平台',
  },
  appsStore: {
    id: 'paas.integration.apps.store',
    defaultMessage: '应用市场',
  },
  installedPlugins: {
    id: 'paas.integration.installed.plugins',
    defaultMessage: '已安装插件',
  },
  appName: {
    id: 'paas.integration.app.name',
    defaultMessage: '应用名称',
  },
  appAmberRoadCTM: {
    id: 'paas.integration.app.arctm',
    defaultMessage: 'AmberRoad CTM',
  },
  appQuickPass: {
    id: 'paas.integration.app.quickpass',
    defaultMessage: 'QP预录入',
  },
  appEasipassEDI: {
    id: 'paas.integration.app.easipass',
    defaultMessage: '亿通海关EDI申报',
  },
  appSHFTZ: {
    id: 'paas.integration.app.shftz',
    defaultMessage: '上海自贸区监管',
  },
  appSFExpress: {
    id: 'paas.integration.app.sfexpress',
    defaultMessage: '顺丰快递',
  },
  interfaceConfig: {
    id: 'paas.integration.interface.config',
    defaultMessage: '接口配置',
  },
  integrationName: {
    id: 'paas.integration.name',
    defaultMessage: '接口名称',
  },
  integrationAppType: {
    id: 'paas.integration.app',
    defaultMessage: '整合应用类型',
  },
  incomingStatus: {
    id: 'paas.integration.incoming.status',
    defaultMessage: '接口输入状态',
  },
  outgoingStatus: {
    id: 'paas.integration.outgoing.status',
    defaultMessage: '接口输出状态',
  },
  opColumn: {
    id: 'paas.integration.opcolumn',
    defaultMessage: '操作',
  },
  install: {
    id: 'paas.integration.install',
    defaultMessage: '安装',
  },
  save: {
    id: 'paas.integration.save',
    defaultMessage: '保存',
  },
  close: {
    id: 'paas.integration.close',
    defaultMessage: '关闭',
  },
  enable: {
    id: 'paas.integration.enable',
    defaultMessage: '启用',
  },
  disable: {
    id: 'paas.integration.disable',
    defaultMessage: '停用',
  },
  installApp: {
    id: 'paas.integration.install.app',
    defaultMessage: '安装应用',
  },
  deleteApp: {
    id: 'paas.integration.delete.app',
    defaultMessage: '删除应用',
  },
  integrationNameRequired: {
    id: 'paas.integration.name.required',
    defaultMessage: '应用接口名称必填',
  },
  parameterRequired: {
    id: 'paas.integration.paramter.required',
    defaultMessage: '接口参数必填',
  },
  epSendTradeCode: {
    id: 'paas.integration.easipass.sendTradeCode',
    defaultMessage: '发送方协同ID号',
  },
  epRecvTradeCode: {
    id: 'paas.integration.easipass.recvTradeCode',
    defaultMessage: '接收方协同ID号',
  },
  epUserCode: {
    id: 'paas.integration.easipass.epUserCode',
    defaultMessage: '接收方用户ID(多个逗号分隔)',
  },
  agentCustCode: {
    id: 'paas.integration.easipass.agent.custcode',
    defaultMessage: '申报单位十位编码',
  },
  FTPserver: {
    id: 'paas.integration.easipass.ftp.server',
    defaultMessage: 'FTP地址',
  },
  FTPusername: {
    id: 'paas.integration.easipass.ftp.username',
    defaultMessage: '用户名',
  },
  FTPpassword: {
    id: 'paas.integration.easipass.ftp.password',
    defaultMessage: '密码',
  },
  sendDirectory: {
    id: 'paas.integration.easipass.ftp.send.directory',
    defaultMessage: '发送目录',
  },
  recvDirectory: {
    id: 'paas.integration.easipass.ftp.recv.directory',
    defaultMessage: '接收目录',
  },
  AmberRoadCTMParam: {
    id: 'paas.integration.arctm.title.params',
    defaultMessage: 'AmberRoad CTM参数',
  },
  customerNo: {
    id: 'paas.integration.arctm.customerNo',
    defaultMessage: 'CTM客户',
  },
  username: {
    id: 'paas.integration.arctm.username',
    defaultMessage: '用户名',
  },
  password: {
    id: 'paas.integration.arctm.password',
    defaultMessage: '密码',
  },
  hookUrl: {
    id: 'paas.integration.arctm.hook.url',
    defaultMessage: '输入接口',
  },
  webservice303Url: {
    id: 'paas.integration.arctm.webservice.303.url',
    defaultMessage: '303回执发送地址',
  },
  webservice305Url: {
    id: 'paas.integration.arctm.webservice.305.url',
    defaultMessage: '305回执发送地址',
  },
  apiConfig: {
    id: 'paas.integration.shftz.api.config',
    defaultMessage: '监管接口配置',
  },
  ftzserver: {
    id: 'paas.integration.shftz.host.url',
    defaultMessage: '监管接口地址',
  },
  config: {
    id: 'paas.integration.config',
    defaultMessage: '配置',
  },
  sfexpressUrl: {
    id: 'paas.integration.sfexpress.url',
    defaultMessage: 'HTTP服务url',
  },
  sfexpressCheckword: {
    id: 'paas.integration.sfexpress.checkword',
    defaultMessage: '密钥',
  },
  sfexpressAccesscode: {
    id: 'paas.integration.sfexpress.accesscode',
    defaultMessage: '接入编码',
  },
  sfexpressCustid: {
    id: 'paas.integration.sfexpress.custid',
    defaultMessage: '月结卡号',
  },
  appEnabled: {
    id: 'paas.integration.msg.app.enabled',
    defaultMessage: '已启用',
  },
  appDisabled: {
    id: 'paas.integration.msg.app.disabled',
    defaultMessage: '已停用',
  },
  appDeleted: {
    id: 'paas.integration.msg.app.deleted',
    defaultMessage: '应用已删除',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
