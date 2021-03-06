import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  settings: {
    id: 'cms.settings',
    defaultMessage: '设置',
  },
  brokers: {
    id: 'cms.settings.brokers',
    defaultMessage: '关检申报单位',
  },
  addBroker: {
    id: 'cms.settings.brokers.add',
    defaultMessage: '添加',
  },
  preferences: {
    id: 'cms.settings.preferences',
    defaultMessage: '偏好设定',
  },
  cancel: {
    id: 'cms.settings.cancel',
    defaultMessage: '取消',
  },
  save: {
    id: 'cms.settings.save',
    defaultMessage: '保存',
  },
  modify: {
    id: 'cms.settings.modify',
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
  events: {
    id: 'cms.setting.event',
    defaultMessage: '清关事件',
  },
});
export default messages;
export const formatMsg = formati18n(messages);
