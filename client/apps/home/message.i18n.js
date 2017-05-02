import { defineMessages } from 'react-intl';

const messages = defineMessages({
  applications: {
    id: 'home.applications',
    defaultMessage: '应用',
  },
  activities: {
    id: 'home.activities',
    defaultMessage: '动态',
  },
  network: {
    id: 'home.network',
    defaultMessage: '协作网络',
  },
  openPlatform: {
    id: 'home.open.platform',
    defaultMessage: '开放平台',
  },
  corp: {
    id: 'home.corp',
    defaultMessage: '管理后台',
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
});
export default messages;
