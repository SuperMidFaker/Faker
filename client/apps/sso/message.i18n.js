import { defineMessages } from 'react-intl';

const messages = defineMessages({
  slogan: {
    id: 'sso.login.slogan',
    defaultMessage: '数字化跨境供应链',
  },
  loading: {
    id: 'sso.login.loading',
    defaultMessage: '系统加载中...',
  },
  loginEmptyParam: {
    id: 'sso.login.empty.param',
    defaultMessage: '用户名或密码为空',
  },
  pwdErrorParam: {
    id: 'sso.login.error.param',
    defaultMessage: '密码有误',
  },
  loginUserNotFound: {
    id: 'sso.login.user.notfound',
    defaultMessage: '用户{username}不存在',
  },
  loginExceptionError: {
    id: 'sso.login.error.exception',
    defaultMessage: '登录异常',
  },
  invalidPhone: {
    id: 'sso.forgot.invalid.phone',
    defaultMessage: '手机号码错误',
  },
  phoneNotfound: {
    id: 'sso.forgot.notfound.phone',
    defaultMessage: '手机号不存在,请先添加',
  },
  requestCodeException: {
    id: 'sso.forgot.requestcode.exception',
    defaultMessage: '请求验证码异常',
  },
  invalidSmsCode: {
    id: 'sso.forgot.invalid.smscode',
    defaultMessage: '验证码错误',
  },
  smsCodeVerifyException: {
    id: 'sso.forgot.smscode.verify.exception',
    defaultMessage: '验证短信码异常',
  },
  subdomainNotFound: {
    id: 'sso.login.subdomain.notfound',
    defaultMessage: '当前子域未对应任何租户',
  },
  userPlaceholder: {
    id: 'sso.user.placeholder',
    defaultMessage: '用户名/手机号',
  },
  pwdPlaceholder: {
    id: 'sso.pwd.placeholder',
    defaultMessage: '密码',
  },
  login: {
    id: 'sso.login',
    defaultMessage: '登录',
  },
  forgotPwd: {
    id: 'sso.forgot.password',
    defaultMessage: '忘记密码',
  },
  rememberMe: {
    id: 'sso.login.remember.me',
    defaultMessage: '记住我',
  },
  verifyCodeGuide: {
    id: 'sso.forgot.guide',
    defaultMessage: '点击获取验证码,我们将向该号码发送免费的短信验证码以重置密码.',
  },
  phonePlaceholder: {
    id: 'sso.forgot.phone.placeholder',
    defaultMessage: '登录手机号',
  },
  verifyObtatin: {
    id: 'sso.forgot.verify.obtain',
    defaultMessage: '获取验证码',
  },
  smsCodeSent: {
    id: 'sso.forgot.smscode.sent',
    defaultMessage: '验证码已经发送到您的手机:',
  },
  smsCode: {
    id: 'sso.forgot.smscode',
    defaultMessage: '短信验证码',
  },
  newPwdPlaceholder: {
    id: 'sso.forgot.newPwd.placeholder',
    defaultMessage: '新密码',
  },
  finishVerify: {
    id: 'sso.forgot.finishVerify',
    defaultMessage: '完成验证',
  },
});

export default messages;
