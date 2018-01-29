import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  adapter: {
    id: 'hub.adapter',
    defaultMessage: '数据适配器',
  },
  searchTip: {
    id: 'hub.adapter.search.tip',
    defaultMessage: '搜索适配器',
  },
  create: {
    id: 'hub.adapter.create',
    defaultMessage: '新建',
  },
  createAdapter: {
    id: 'hub.adapter.create.adapter',
    defaultMessage: '新建数据适配器',
  },
  config: {
    id: 'hub.adapter.config',
    defaultMessage: '配置',
  },
  configAdapter: {
    id: 'hub.adapter.config.adapter',
    defaultMessage: '配置数据适配器',
  },
  save: {
    id: 'hub.adapter.save',
    defaultMessage: '保存',
  },
  adapterName: {
    id: 'hub.adapter.name',
    defaultMessage: '适配器名称',
  },
  adapterBizModel: {
    id: 'hub.adapter.biz.model',
    defaultMessage: '适配数据对象',
  },
  relatedPartner: {
    id: 'hub.adapter.related.partner',
    defaultMessage: '关联客户',
  },
  profile: {
    id: 'hub.adapter.profile',
    defaultMessage: '基本信息',
  },
  params: {
    id: 'hub.adapter.params',
    defaultMessage: '参数设置',
  },
  startLine: {
    id: 'hub.adapter.params.start.line',
    defaultMessage: '起始行',
  },
  more: {
    id: 'hub.adapter.more',
    defaultMessage: '更多',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
