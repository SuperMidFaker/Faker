import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  adaptorNotFound: {
    id: 'component.import.data.panel.adaptor.not.found',
    defaultMessage: '尚未配置数据适配器',
  },
  handlingDuplicated: {
    id: 'component.import.data.panel.handling.duplicated',
    defaultMessage: '重复数据处理方式',
  },
  overwrite: {
    id: 'component.import.data.panel.overwrite',
    defaultMessage: '覆盖导入',
  },
  ignore: {
    id: 'component.import.data.panel.ignore',
    defaultMessage: '忽略不导入',
  },
});
export default messages;
export const formatMsg = formati18n(messages);
