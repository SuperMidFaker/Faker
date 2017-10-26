import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal, Input } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { changeCancelCharge } from 'common/reducers/cmsBilling';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { changeCancelCharge }
)
export default class CancelChargeModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    billingId: PropTypes.string.isRequired,
    fromId: PropTypes.number.isRequired,
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
    const { billingId, tenantId } = this.props;
    this.props.changeCancelCharge({ tenantId, billingId, cancelCharge: this.state.cancelCharge }).then(() => {
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
    const { visible } = this.props;
    return (
      <div>
        <Modal maskClosable={false} style={{ width: '680px' }} visible={visible}
          title={this.msg('cancelCharge')} onOk={this.handleOk}
          onCancel={this.handleCancel}
        >
          <div style={{ width: 300, margin: '0 auto' }}>
            <Input
              type="number"
              onChange={this.handleChange}
              addonAfter={this.msg('unit')}
              placeholder={this.msg('cancelPlaceholder')}
            />
          </div>

        </Modal>
      </div>
    );
  }
}
