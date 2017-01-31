import { defineMessages } from 'react-intl';

const messages = defineMessages({
  home: {
    id: 'container.home',
    defaultMessage: '首页',
  },
  applications: {
    id: 'container.applications',
    defaultMessage: '应用',
  },
  activities: {
    id: 'container.activities',
    defaultMessage: '动态',
  },
  network: {
    id: 'container.network',
    defaultMessage: '协作网络',
  },
  openPlatform: {
    id: 'container.open.platform',
    defaultMessage: '开放平台',
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
