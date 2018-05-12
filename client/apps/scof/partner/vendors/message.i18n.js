import { defineMessages } from 'react-intl';
import { formati18n } from 'client/common/i18n/helpers';
import globalMessages from 'client/common/root.i18n';
import moduleMessages from '../message.i18n';

const messages = defineMessages({
  partnerNameRequired: {
    id: 'sof.partner.name.required',
    defaultMessage: '企业名称必填',
  },
  uscCode18len: {
    id: 'sof.partner.scccode.len18',
    defaultMessage: '18位统一社会信用代码',
  },
  customsCode10len: {
    id: 'sof.partner.customs.code.len10',
    defaultMessage: '10位海关编码',
  },
  qichachaCorpSearch: {
    id: 'sof.partner.qichacha.search',
    defaultMessage: '输入企业名称搜索',
  },
  vendorBusinessTypeRequired: {
    id: 'sof.vendor.busitype.required',
    defaultMessage: '请选择服务商业务类型',
  },
});

export default messages;
export const formatMsg = formati18n({ ...globalMessages, ...moduleMessages, ...messages });
