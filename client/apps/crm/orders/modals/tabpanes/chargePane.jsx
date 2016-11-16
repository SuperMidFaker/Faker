import React from 'react';
// import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
// import { Row, Col, Card, Table, Checkbox } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
const formatMsg = format(messages);

@injectIntl

export default class ChargePanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)


  render() {
    return (
      <div className="pane-content tab-pane" />
    );
  }
}
