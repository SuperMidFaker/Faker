import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  flow: {
    id: 'scof.flow',
    defaultMessage: '流程',
  },
  add: {
    id: 'scof.flow.add',
    defaultMessage: '添加',
  },
  cmsFlowNode: {
    id: 'scof.flow.node.cms',
    defaultMessage: '清关节点',
  },
  bizObject: {
    id: 'scof.flow.biz.object',
    defaultMessage: '业务对象',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
