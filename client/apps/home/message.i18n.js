import { defineMessages } from 'react-intl';

const messages = defineMessages({
  apps: {
    id: 'home.apps',
    defaultMessage: '业务应用',
  },
  paas: {
    id: 'home.paas',
    defaultMessage: '平台设置',
  },
  corpAdmin: {
    id: 'home.corp.admin',
    defaultMessage: '企业后台',
  },
  notFound: {
    id: 'home.not.found',
    defaultMessage: '未找到该页',
  },
  notFoundDesc: {
    id: 'home.not.found.desc',
    defaultMessage: '您访问的页面正在开发中...请耐心等待！',
  },
  notification: {
    id: 'home.notification',
    defaultMessage: '消息通知',
  },
  emptyNew: {
    id: 'home.notification.empty.new',
    defaultMessage: '没有新的消息通知',
  },
  markAllRead: {
    id: 'home.notification.mark.all.read',
    defaultMessage: '标记全部已读',
  },
  deleteAllRead: {
    id: 'home.notification.delete.all.read',
    defaultMessage: '清空已读消息',
  },
  confirmDeleteAllRead: {
    id: 'home.notification.confirm.delete.all.read',
    defaultMessage: '清空所有已读消息?',
  },
  preference: {
    id: 'home.preference',
    defaultMessage: '偏好设置',
  },
  preferenceLanguage: {
    id: 'home.preference.language',
    defaultMessage: '语言',
  },
  labelChooseLanguage: {
    id: 'home.preference.language.label.choose',
    defaultMessage: '选择界面语言',
  },
  preferenceNotification: {
    id: 'home.preference.notification',
    defaultMessage: '通知',
  },
  labelDesktopPush: {
    id: 'home.preference.notification.label.desktop.push',
    defaultMessage: '桌面通知',
  },
  descDesktopPush: {
    id: 'home.preference.notification.desc.desktop.push',
    defaultMessage: '开启后，有新消息时浏览器会向你推送动态通知',
  },
  activities: {
    id: 'home.activities',
    defaultMessage: '我的动态',
  },
  emptyActivities: {
    id: 'home.activities.empty',
    defaultMessage: '没有最近的动态',
  },
});
export default messages;
