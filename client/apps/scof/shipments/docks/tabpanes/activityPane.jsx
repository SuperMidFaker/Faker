import React from 'react';
// import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
// import moment from 'moment';
// import { Timeline, Card } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);

// const timeFormat = 'YYYY-MM-DD HH:mm';

@injectIntl

export default class ActivityPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    return <span>ActivityPane</span>;
  }
}
