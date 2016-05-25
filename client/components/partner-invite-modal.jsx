import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Modal, Button, Input, message } from 'ant-ui';
import { intlShape, injectIntl } from 'react-intl';
import { hideInviteModal, sendInvitation } from 'common/reducers/partner';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import globalMessages from 'client/common/root.i18n';
const formatMsg = format(messages);
const formatGlobalMsg = format(globalMessages);
import './partner-modal.less';

@injectIntl
@connect(
  state => ({
    tenantId: state.partner.inviteModal.tenantId,
    partnerName: state.partner.inviteModal.partnerName,
    partnerCode: state.partner.inviteModal.partnerCode,
    step: state.partner.inviteModal.step,
    visible: state.partner.inviteModal.visible
  }),
  { hideInviteModal, sendInvitation }
)
export default class PartnerInviteDialog extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    hideInviteModal: PropTypes.func.isRequired,
    sendInvitation: PropTypes.func.isRequired,
    tenantId: PropTypes.number.isRequired,
    partnerName: PropTypes.string.isRequired,
    partnerCode: PropTypes.string.isRequired,
    step: PropTypes.number.isRequired,
    visible: PropTypes.bool.isRequired
  }
  state = {
    contact: ''
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.visible) {
      this.setState({
        contact: ''
      });
    }
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleContactInputChange = (ev) => {
    this.setState({
      contact: ev.target.value
    });
  }
  handleCancel = () => {
    this.props.hideInviteModal();
  }
  handleInvite = () => {
    if (!this.state.contact) {
      return message.error(this.msg('contactMissing'));
    }
    this.props.sendInvitation(
      this.state.contact, this.props.tenantId, this.props.partnerCode, this.props.partnerName
    ).then(result => {
      if (result.error) {
        message.error(result.error.message, 10);
      }
    });
  }
  render() {
    const { contact } = this.state;
    const { step, visible, partnerName } = this.props;
    let footer;
    if (step === 1) {
      footer = [
        <Button key="offline-invite" type="primary" size="large" onClick={this.handleInvite}>
        {this.msg('sendInvitation')}
        </Button>,
        <Button key="cancel" onClick={this.handleCancel}>
        {formatGlobalMsg(this.props.intl, 'cancel')}
        </Button>
      ];
    } else if (step === 2) {
      footer = [
        <Button key="send-invite" type="primary" size="large" onClick={this.handleCancel}>
        {this.msg('iknow')}
        </Button>
      ];
    }
    return (
      <Modal title={this.msg('invitePartner')} visible={visible} closable={false} footer={footer}
        className="partner-modal"
      >
        <div className={`partner-modal-offline-body${step === 1 ? '' : ' hide'}`}>
          <i className="anticon anticon-info-circle" />
          <span>
          {this.msg('fillPartnerContact', { partnerName })}
          </span>
          <div className="partner-modal-content">
            <Input placeholder={this.msg('contactPlaceholder')} onChange={this.handleContactInputChange}
              value={contact}
            />
          </div>
        </div>
        <div className={`partner-modal-confirm-body${step === 2 ? '' : ' hide'}`}>
          <i className="anticon anticon-info-circle" />
          <span className="partner-modal-title">{this.msg('invitationSent')}</span>
        </div>
      </Modal>
    );
  }
}
