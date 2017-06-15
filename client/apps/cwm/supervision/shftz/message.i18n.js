import { defineMessages } from 'react-intl';

const messages = defineMessages({
  ftzEntryReg: {
    id: 'cwm.supervision.shftz.entry.reg',
    defaultMessage: '进库备案',
  },
  ftzReleaseReg: {
    id: 'cwm.supervision.shftz.release.reg',
    defaultMessage: '出库备案',
  },
  ftzBatchReg: {
    id: 'cwm.supervision.shftz.batch.reg',
    defaultMessage: '集中报关申请',
  },
  ftzCargoReg: {
    id: 'cwm.supervision.shftz.cargo.reg',
    defaultMessage: '货物备案',
  },
  searchPlaceholder: {
    id: 'cms.supervision.shftz.search.placeholder',
    defaultMessage: 'ANS编号/海关编号/入库备案号',
  },
});

export default messages;
