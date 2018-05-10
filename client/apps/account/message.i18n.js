import { defineMessages } from 'react-intl';

const messages = defineMessages({
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
});

export default messages;
