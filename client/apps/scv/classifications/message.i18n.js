import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  masterConfig: {
    id: 'scv.classification.master.config',
    defaultMessage: '主库配置',
  },
  slaveConfig: {
    id: 'scv.classification.slave.config',
    defaultMessage: '从库同步',
  },
  classifySourceRepo: {
    id: 'scv.classification.slave.source.repo',
    defaultMessage: '来源物料集',
  },
  classifyAudit: {
    id: 'scv.classification.slave.audit',
    defaultMessage: '审核方式',
  },
  classifyShareScope: {
    id: 'scv.classification.slave.share.scope',
    defaultMessage: '共享范围',
  },
  opColumn: {
    id: 'scv.classification.opColumn',
    defaultMessage: '操作',
  },
  whseEdit: {
    id: 'scv.classification.edit',
    defaultMessage: '修改',
  },
  addSlave: {
    id: 'scv.classification.slave.add',
    defaultMessage: '添加从库',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
