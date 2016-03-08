import React, { PropTypes } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

const messages = defineMessages({
  editTitle: {
    id: 'organization.edit.title',
    defaultMessage: '添加部门或分支机构'
  },
  corpHead: {
    id: 'organization.edit.corpHead',
    defaultMessage: '负责人'
  },
  headPlaceholder: {
    id: 'organization.edit.headPlaceholder',
    defaultMessage: '请输入负责人名称'
  },
  headMessage: {
    id: 'organization.edit.headMessage',
    defaultMessage: '2位以上中英文'
  }
});

const Msg = props =>
  <FormattedMessage {...messages[props.s]} values={props.values} />;
Msg.propTypes = {
  s: PropTypes.string.isRequired,
  values: PropTypes.string
};
function formatMsg(intl, msgKey) {
  return intl.formatMessage(messages[msgKey]);
}
export default formatMsg;
