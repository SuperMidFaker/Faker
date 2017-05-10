import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';

const messages = defineMessages({
  clearance: {
    id: 'scv.clearance',
    defaultMessage: '清关管理',
  },
  clearanceImport: {
    id: 'scv.clearance.import',
    defaultMessage: '进口',
  },
  clearanceExport: {
    id: 'scv.clearance.export',
    defaultMessage: '出口',
  },
  declCDF: {
    id: 'scv.clearance.decl.cdf',
    defaultMessage: '报关单',
  },
  declFTZ: {
    id: 'scv.clearance.decl.ftz',
    defaultMessage: '备案清单',
  },
  declManifest: {
    id: 'scv.clearance.manifest',
    defaultMessage: '报关清单',
  },
  customsDecl: {
    id: 'scv.clearance.customs.decl',
    defaultMessage: '报关单管理',
  },
  filterAll: {
    id: 'cms.clearance.filter.all',
    defaultMessage: '全部',
  },
  filterWIP: {
    id: 'cms.clearance.filter.manifest.wip',
    defaultMessage: '制单中',
  },
  filterGenerated: {
    id: 'cms.clearance.filter.manifest.generated',
    defaultMessage: '制单完成',
  },
  maniSearchPlaceholder: {
    id: 'scv.clearance.manifest.search.placeholder',
    defaultMessage: '搜索委托号',
  },
  billSeqNo: {
    id: 'scv.clearance.manifest.bill.seqno',
    defaultMessage: '清单编号',
  },
});

export default messages;
export const formatMsg = formati18n(messages);
