import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Input } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { changeCancelCharge } from 'common/reducers/crmBilling';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  { changeCancelCharge }
)
export default class CancelChargeModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loginId: PropTypes.number.isRequired,
    loginName: PropTypes.string.isRequired,
    billingId: PropTypes.number.isRequired,
    fromId: PropTypes.number.isRequired,
    totalCharge: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    handleOk: PropTypes.func.isRequired,
    changeCancelCharge: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    cancelCharge: 0,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleOk = () => {
    const { billingId, loginId, tenantId, loginName } = this.props;
    this.props.changeCancelCharge({ tenantId, loginId, loginName, billingId, cancelCharge: this.state.cancelCharge }).then(() => {
      this.props.toggle();
      this.props.handleOk();
    });
  }
  handleCancel = () => {
    this.props.toggle();
  }

  handleChange = (e) => {
    this.setState({ cancelCharge: e.target.value });
  }
  render() {
    const { visible, totalCharge } = this.props;
    return (
      <div>
        <Modal maskClosable={false} style={{ width: '680px' }} visible={visible}
          title={`核销金额 (账单总金额: ${totalCharge.toFixed(2)})`} onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <div style={{ width: 300, margin: '0 auto' }}>
            <Input
              type="number"
              onChange={this.handleChange}
              addonAfter="元"
              placeholder="请输入核销金额"
            />
          </div>

        </Modal>
      </div>
    );
  }
}
