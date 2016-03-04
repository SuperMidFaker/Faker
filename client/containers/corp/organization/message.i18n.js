import React, { PropTypes } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';

const messages = defineMessages({
  editTitle: {
    id: 'organization.edit.title',
    defaultMessage: '添加部门或分支机构'
  }
});

const Msg = props =>
  <FormattedMessage {...messages[props.s]} values={props.values} />;
Msg.propTypes = {
  s: PropTypes.string.isRequired,
  values: PropTypes.string
};
export default Msg;
