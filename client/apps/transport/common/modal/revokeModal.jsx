import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Modal, Input, message } from 'antd';
import { closeReModal, revokeShipment, rejectShipment } from
  'common/reducers/transport-acceptance';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    modalType: state.transportAcceptance.revokejectModal.type,
    visible: state.transportAcceptance.revokejectModal.visible,
    shipmtDispId: state.transportAcceptance.revokejectModal.dispId,
    shipmtNo: state.transportAcceptance.revokejectModal.shipmtNo,
  }),
  { closeReModal, revokeShipment, rejectShipment }
)
export default class RevokeModal extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    shipmtDispId: PropTypes.number.isRequired,
    shipmtNo: PropTypes.string.isRequired,
    modalType: PropTypes.string.isRequired,
    closeReModal: PropTypes.func.isRequired,
    revokeShipment: PropTypes.func.isRequired,
    rejectShipment: PropTypes.func.isRequired,
    reload: PropTypes.func.isRequired,
  }
  state = {
    reason: '',
  }
  handleReasonChange = (ev) => {
    this.setState({ reason: ev.target.value });
  }
  handleCancel = () => {
    this.props.closeReModal();
  }
  handleOk = () => {
    if (this.props.modalType === 'revoke') {
      this.props.revokeShipment(this.props.shipmtNo, this.props.shipmtDispId, this.state.reason).then(
        (result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.props.reload();
          }
        });
    } else {
      this.props.rejectShipment(this.props.shipmtNo, this.props.shipmtDispId, this.state.reason).then(
        (result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.props.reload();
          }
        });
    }
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { visible } = this.props;
    return (
      <Modal title={this.msg('revokejectModalTitle')} visible={visible}
        onOk={this.handleOk} onCancel={this.handleCancel}
      >
        <Input.TextArea rows="4" onBlur={this.handleReasonChange} />
      </Modal>
    );
  }
}
