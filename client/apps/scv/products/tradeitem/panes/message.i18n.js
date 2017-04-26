import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  masterConfig: {
    id: 'scv.products.master.config',
    defaultMessage: '主库配置',
  },
  slaveConfig: {
    id: 'scv.products.slave.config',
    defaultMessage: '从库同步',
  },
  classifySourceRepo: {
    id: 'scv.products.slave.source.repo',
    defaultMessage: '来源物料集',
  },
  classifyAudit: {
    id: 'scv.products.slave.audit',
    defaultMessage: '审核方式',
  },
  classifyShareScope: {
    id: 'scv.products.slave.share.scope',
    defaultMessage: '共享范围',
  },
  opColumn: {
    id: 'scv.products.opColumn',
    defaultMessage: '操作',
  },
  whseEdit: {
    id: 'scv.products.edit',
    defaultMessage: '修改',
  },
  addSlave: {
    id: 'scv.products.slave.add',
    defaultMessage: '添加从库',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
