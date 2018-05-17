import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  userNameRequired: {
    id: 'reusable.checker.username.required',
    defaultMessage: '用户名必填',
  },
  userNameNoSymbolAt: {
    id: 'reusable.checker.username.nosymbol.at',
    defaultMessage: '用户名不允许包含@',
  },
  userNameExist: {
    id: 'reusable.checker.username.exist',
    defaultMessage: '用户名已存在',
  },
  phoneRequired: {
    id: 'reusable.checker.phone.required',
    defaultMessage: '联系人手机号必填',
  },
  invalidPhone: {
    id: 'reusable.checker.invalid.phone',
    defaultMessage: '非法手机号',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
