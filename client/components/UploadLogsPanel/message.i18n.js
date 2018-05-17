import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';

const messages = defineMessages({
  uploadLogs: {
    id: 'component.upload.logs',
    defaultMessage: '历史导入日志',
  },
  id: {
    id: 'component.upload.logs.panel.id',
    defaultMessage: '导入编号',
  },
  status: {
    id: 'component.upload.logs.panel.status',
    defaultMessage: '状态',
  },
  successQty: {
    id: 'component.upload.logs.panel.success.qty',
    defaultMessage: '成功数',
  },
  ignoredQty: {
    id: 'component.upload.logs.panel.ignored.qty',
    defaultMessage: '忽略数',
  },
  totalQty: {
    id: 'component.upload.logs.panel.total.qty',
    defaultMessage: '成功/忽略/总数',
  },
  fileSize: {
    id: 'component.upload.logs.panel.file.size',
    defaultMessage: '文件大小',
  },
  fileType: {
    id: 'component.upload.logs.panel.file.type',
    defaultMessage: '文件类型',
  },
  uploadedDate: {
    id: 'component.upload.logs.panel.uploaded.date',
    defaultMessage: '上传时间',
  },
});
export default messages;
export const formatMsg = formati18n(messages);
export const formatGlobalMsg = formati18n(globalMessages);
