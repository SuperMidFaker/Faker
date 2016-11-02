import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import { addCustomer } from 'common/reducers/crmCustomers';

const formatMsg = format(messages);

@injectIntl
@connect(
  () => ({

  }),
  { addCustomer }
)

export default class CustomerModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    addCustomer: PropTypes.func.isRequired,
  }

  msg = key => formatMsg(this.props.intl, key)
  handleCancel = () => {
    this.props.toggle();
  }
  handleOk = () => {
    // this.props.addCustomer
    this.props.toggle();
  }
  render() {
    const { visible } = this.props;
    return (
      <Modal visible={visible} title="新增客户" onCancel={this.handleCancel} onOk={this.handleOk}>
        456
      </Modal>
    );
  }
}
