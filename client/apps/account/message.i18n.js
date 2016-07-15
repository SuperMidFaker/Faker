import { defineMessages } from 'react-intl';

const messages = defineMessages({
  pwdTitle: {
    id: 'account.password.title',
    defaultMessage: '密码修改',
  },
  pwdRequired: {
    id: 'account.password.required',
    defaultMessage: '请输入密码',
  },
  newPwdRule: {
    id: 'account.password.new.rule',
    defaultMessage: '请输入至少6位新密码',
  },
  pwdUnmatch: {
    id: 'account.password.unmatch',
    defaultMessage: '新密码两次输入不一致',
  },
  samePwd: {
    id: 'account.password.same',
    defaultMessage: '新旧密码不能相同',
  },
  oldPwd: {
    id: 'account.password.old',
    defaultMessage: '旧密码',
  },
  newPwd: {
    id: 'account.password.new',
    defaultMessage: '新密码',
  },
  confirmPwd: {
    id: 'account.password.confirm',
    defaultMessage: '确认密码',
  },
  incorretOldPwd: {
    id: 'account.password.incorret.old',
    defaultMessage: '旧密码有误',
  },
  invalidUser: {
    id: 'account.password.invalid.user',
    defaultMessage: '当前用户非法登录',
  },
  profileTitle: {
    id: 'account.profile.title',
    defaultMessage: '帐号设置',
  },
  avatarUpdate: {
    id: 'account.profile.avatar.update',
    defaultMessage: '点击更新',
  },
  messageCenter: {
    id: 'corp.messageList.messageCenter',
    defaultMessage: '消息中心',
  },
  notRead: {
    id: 'corp.messageList.notRead',
    defaultMessage: '未读',
  },
  read: {
    id: 'corp.messageList.read',
    defaultMessage: '已读',
  },
  clearAll: {
    id: 'corp.messageList.clearAll',
    defaultMessage: '全部清空',
  },
  markAll: {
    id: 'corp.messageList.markAll',
    defaultMessage: '全部标记已读',
  },
  content: {
    id: 'corp.messageList.content',
    defaultMessage: '消息内容',
  },
  from_name: {
    id: 'corp.messageList.from_name',
    defaultMessage: '来源',
  },
  time: {
    id: 'corp.messageList.time',
    defaultMessage: '时间',
  },
  goBack: {
    id: 'corp.messageList.goBack',
    defaultMessage: '返回',
  },
});

export default messages;
