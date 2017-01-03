import { defineMessages } from 'react-intl';

const messages = defineMessages({
  slogan: {
    id: 'admin.container.slogan',
    defaultMessage: '微骆云台运营管理系统',
  },
  loginEmptyParam: {
    id: 'admin.login.empty.param',
    defaultMessage: '用户名或密码为空',
  },
  pwdErrorParam: {
    id: 'admin.login.error.param',
    defaultMessage: '密码有误',
  },
  loginUserNotFound: {
    id: 'admin.login.user.notfound',
    defaultMessage: '用户{username}不存在',
  },
  loginExceptionError: {
    id: 'admin.login.error.exception',
    defaultMessage: '登录异常',
  },
  invalidPhone: {
    id: 'admin.forgot.invalid.phone',
    defaultMessage: '手机号码错误',
  },
  phoneNotfound: {
    id: 'admin.forgot.notfound.phone',
    defaultMessage: '手机号不存在,请先添加',
  },
  requestCodeException: {
    id: 'admin.forgot.requestcode.exception',
    defaultMessage: '请求验证码异常',
  },
  invalidSmsCode: {
    id: 'admin.forgot.invalid.smscode',
    defaultMessage: '验证码错误',
  },
  smsCodeVerifyException: {
    id: 'admin.forgot.smscode.verify.exception',
    defaultMessage: '验证短信码异常',
  },
  subdomainNotFound: {
    id: 'admin.login.subdomain.notfound',
    defaultMessage: '当前子域未对应任何租户',
  },
  userPlaceholder: {
    id: 'admin.user.placeholder',
    defaultMessage: '用户名/手机号',
  },
  pwdPlaceholder: {
    id: 'admin.pwd.placeholder',
    defaultMessage: '密码',
  },
  login: {
    id: 'admin.login',
    defaultMessage: '登录',
  },
  forgotPwd: {
    id: 'admin.forgot.password',
    defaultMessage: '忘记密码',
  },
  remembered: {
    id: 'admin.login.remembered',
    defaultMessage: '记住我',
  },
  verifyCodeGuide: {
    id: 'admin.forgot.guide',
    defaultMessage: '点击获取验证码,我们将向该号码发送免费的短信验证码以重置密码.',
  },
  phonePlaceholder: {
    id: 'admin.forgot.phone.placeholder',
    defaultMessage: '登录手机号',
  },
  verifyObtatin: {
    id: 'admin.forgot.verify.obtain',
    defaultMessage: '获取验证码',
  },
  smsCodeSent: {
    id: 'admin.forgot.smscode.sent',
    defaultMessage: '验证码已经发送到您的手机:',
  },
  smsCode: {
    id: 'admin.forgot.smscode',
    defaultMessage: '短信验证码',
  },
  newPwdPlaceholder: {
    id: 'admin.forgot.newPwd.placeholder',
    defaultMessage: '新密码',
  },
  finishVerify: {
    id: 'admin.forgot.finishVerify',
    defaultMessage: '完成验证',
  },
});

export default messages;
