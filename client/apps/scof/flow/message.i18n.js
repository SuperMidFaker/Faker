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
  flowNodeImport: {
    id: 'scof.flow.node.import',
    defaultMessage: '进口清关',
  },
  flowNodeExport: {
    id: 'scof.flow.node.import',
    defaultMessage: '出口清关',
  },
  flowNodeTms: {
    id: 'scof.flow.node.tms',
    defaultMessage: '国内运输',
  },
  flowNodeCwm: {
    id: 'scof.flow.node.cwm',
    defaultMessage: '仓储协同',
  },
  bizObject: {
    id: 'scof.flow.biz.object',
    defaultMessage: '业务对象',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
