import React, { PropTypes, Component } from 'react';
import { connect } from 'react-redux';
import { Form, Card } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import messages from '../message.i18n';
import { format } from 'client/common/i18n/helpers';
const formatMsg = format(messages);

function noop() {}

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
)
@Form.create()
export default class ExtraDock extends Component {
  static PropTypes = {
    intl: intlShape.isRequired,
    onClose: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    this.onClose = this.props.onClose || noop;
  }
  msg = key => formatMsg(this.props.intl, key);

  render() {
    const { visible } = this.props;

    const closer = (
      <button
        onClick={this.onClose}
        aria-label="Close"
        className="ant-modal-close"
      >
        <span className="ant-modal-close-x" />
      </button>);
    return (
      <div className={`dock-panel ${visible ? 'inside' : ''}`}>
        <div className="panel-content">
          <div className="header">
            <span className="title">title</span>
            <div className="pull-right">
              {closer}
            </div>
          </div>
          <div className="body">
            <Card>card content</Card>
          </div>
        </div>
      </div>
    );
  }
}
