import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  search: {
    id: 'component.action.search',
    defaultMessage: '搜索',
  },
  userAccount: {
    id: 'component.user.account',
    defaultMessage: '帐号设置',
  },
  userProfile: {
    id: 'component.user.profile',
    defaultMessage: '个人资料',
  },
  securitySetting: {
    id: 'component.user.security.setting',
    defaultMessage: '安全设置',
  },
  userPreference: {
    id: 'component.user.preference',
    defaultMessage: '偏好设置',
  },
  userActivities: {
    id: 'component.user.activities',
    defaultMessage: '我的动态',
  },
  userLogout: {
    id: 'component.user.logout',
    defaultMessage: '退出登录',
  },
  defaultCascaderRegion: {
    id: 'component.region.default.cascader.region',
    defaultMessage: '省/市/区',
  },
  selectCountry: {
    id: 'component.region.select.country',
    defaultMessage: '选择国家或地区',
  },
  appEditorTitle: {
    id: 'component.appEditor.title',
    defaultMessage: '设置开通的应用',
  },
  appEditorNameCol: {
    id: 'component.appEditor.nameCol',
    defaultMessage: '应用名称',
  },
  appEditorSetCol: {
    id: 'component.appEditor.setCol',
    defaultMessage: '开通状态',
  },
  detail: {
    id: 'component.popover.detail',
    defaultMessage: '详情',
  },
  notification: {
    id: 'component.popover.notification',
    defaultMessage: '通知提醒',
  },
  seeAll: {
    id: 'component.popover.notification.seeall',
    defaultMessage: '查看所有通知',
  },
  helpcenter: {
    id: 'component.popover.helpcenter',
    defaultMessage: '帮助中心',
  },
  online: {
    id: 'component.popover.helpcenter.online',
    defaultMessage: '在线客服',
  },
  feedback: {
    id: 'component.popover.helpcenter.feedback',
    defaultMessage: '意见反馈',
  },
  guide: {
    id: 'component.popover.helpcenter.guide',
    defaultMessage: '快速上手',
  },
  back: {
    id: 'component.nav.back',
    defaultMessage: '返回',
  },
  close: {
    id: 'component.nav.close',
    defaultMessage: '关闭',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
