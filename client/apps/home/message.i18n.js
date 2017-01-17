import { defineMessages } from 'react-intl';

const messages = defineMessages({
  applications: {
    id: 'container.applications',
    defaultMessage: '开通应用',
  },
  activities: {
    id: 'container.activities',
    defaultMessage: '动态',
  },
  corp: {
    id: 'container.corp',
    defaultMessage: '管理后台',
  },
  notFound: {
    id: 'container.not.found',
    defaultMessage: '抱歉，无法找到该页',
  },
  notFoundDesc: {
    id: 'container.not.found.desc',
    defaultMessage: '您正在访问的页面可能已经删除、更名或暂时不可用。 请确认网址拼写是否正确或稍后尝试再次刷新。',
  },
});
export default messages;
