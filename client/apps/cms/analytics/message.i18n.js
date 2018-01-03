import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  analytics: {
    id: 'cms.analytics',
    defaultMessage: '统计',
  },
  delgAnalytics: {
    id: 'cms.analytics.delg',
    defaultMessage: '委托统计',
  },
  cusDeclAnalytics: {
    id: 'cms.analytics.cusdecl',
    defaultMessage: '报关单统计',
  },
  reportSetting: {
    id: 'cms.analytics.report.setting',
    defaultMessage: '报表设置',
  },
});
export default messages;
export const formatMsg = formati18n(messages);
