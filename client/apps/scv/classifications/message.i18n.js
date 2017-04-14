import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  classifyBroker: {
    id: 'scv.classification.broker',
    defaultMessage: '归类报关行',
  },
  classifyAudit: {
    id: 'scv.classification.audit',
    defaultMessage: '审核方式',
  },
  classifyShare: {
    id: 'scv.classification.share',
    defaultMessage: '共享报关行范围',
  },
  isBonded: {
    id: 'scv.resources.warehouse.bonded',
    defaultMessage: '保税仓',
  },
  warehouseOperator: {
    id: 'scv.resources.warehouse.operator',
    defaultMessage: '经营者',
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
