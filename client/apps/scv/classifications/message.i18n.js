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
  warehouseLocation: {
    id: 'scv.resources.warehouse.location',
    defaultMessage: '位置',
  },
  opColumn: {
    id: 'scv.resources.warehouse.opColumn',
    defaultMessage: '操作',
  },
  whseEdit: {
    id: 'scv.resources.warehouse.edit',
    defaultMessage: '修改',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
