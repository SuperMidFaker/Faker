import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  settings: {
    id: 'cms.settings',
    defaultMessage: '设置',
  },
  resources: {
    id: 'cms.settings.resources',
    defaultMessage: '客户设置',
  },
  brokers: {
    id: 'cms.settings.brokers',
    defaultMessage: '代理设置',
  },
  preferences: {
    id: 'cms.settings.preferences',
    defaultMessage: '参数设定',
  },
  cancel: {
    id: 'cms.settings.cancel',
    defaultMessage: '取消',
  },
  save: {
    id: 'cms.settings.save',
    defaultMessage: '保存',
  },
  edit: {
    id: 'cms.settings.edit',
    defaultMessage: '修改',
  },
  view: {
    id: 'cms.settings.view',
    defaultMessage: '查看',
  },
  tenantName: {
    id: 'cms.settings.billTemplate.tenantName',
    defaultMessage: '企业名称',
  },
});
export default messages;
export const formatMsg = formati18n(messages);
