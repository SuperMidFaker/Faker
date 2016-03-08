import { defineMessages } from 'react-intl';

const messages = defineMessages({
  appEditorTitle: {
    id: 'component.appEditor.title',
    defaultMessage: '设置开通的应用'
  },
  appEditorNameCol: {
    id: 'component.appEditor.nameCol',
    defaultMessage: '应用名称'
  }
});

function formatMsg(intl, msgKey, predefinedMessages) {
  return intl.formatMessage((predefinedMessages || messages)[msgKey]);
}
export default formatMsg;
