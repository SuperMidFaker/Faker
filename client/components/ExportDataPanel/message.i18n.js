import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  export: {
    id: 'component.export.data.panel.export',
    defaultMessage: '导出',
  },
  dataObjects: {
    id: 'component.export.data.panel.data.objects',
    defaultMessage: '导出数据对象',
  },
  exportOptions: {
    id: 'component.export.data.panel.options',
    defaultMessage: '导出选项',
  },
  allData: {
    id: 'component.export.data.panel.all.data',
    defaultMessage: '全部数据',
  },
  specificPeriod: {
    id: 'component.export.data.panel.specific.period',
    defaultMessage: '指定时间段',
  },
  headerFields: {
    id: 'component.export.data.panel.header.fields',
    defaultMessage: '表头字段',
  },
  bodyFields: {
    id: 'component.export.data.panel.body.fields',
    defaultMessage: '表体字段',
  },
  exportFormat: {
    id: 'component.export.data.panel.export.format',
    defaultMessage: '导出文件格式',
  },
});
export default messages;
export const formatMsg = formati18n(messages);
