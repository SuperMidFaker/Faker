import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Modal, Button, Input, message } from 'ant-ui';
import { hideInviteModal, sendInvitation } from '../../universal/redux/reducers/partner';
import './partner-modal.less';

@connect(
  state => ({
    tenantId: state.partner.inviteModal.tenantId,
    partnerName: state.partner.inviteModal.partnerName,
    step: state.partner.inviteModal.step,
    visible: state.partner.inviteModal.visible
  }),
  { hideInviteModal, sendInvitation }
)
export default class PartnerInviteDialog extends React.Component {
  static propTypes = {
    hideInviteModal: PropTypes.func.isRequired,
    sendInvitation: PropTypes.func.isRequired,
    tenantId: PropTypes.number.isRequired,
    partnerName: PropTypes.string.isRequired,
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
      return message.error('请输入联系方式');
    }
    this.props.sendInvitation(
      this.state.contact, this.props.tenantId, this.props.partnerName
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
          发送邀请
        </Button>,
        <Button key="cancel" onClick={this.handleCancel}>
          取消
        </Button>
      ];
    } else if (step === 2) {
      footer = [
        <Button key="send-invite" type="primary" size="large" onClick={this.handleCancel}>
          知道了
        </Button>
      ];
    }
    return (
      <Modal title="邀请合作伙伴" visible={visible} closable={false} footer={footer}
        className="partner-modal"
      >
        <div className={`partner-modal-offline-body${step === 1 ? '' : ' hide'}`}>
          <i className="anticon anticon-info-circle" />
          <span>
            请填写邀请合作伙伴"{ partnerName }"的联系方式
          </span>
          <div className="partner-modal-content">
            <Input placeholder="输入邮箱/手机号码" onChange={this.handleContactInputChange}
              value={contact}
            />
          </div>
        </div>
        <div className={`partner-modal-confirm-body${step === 2 ? '' : ' hide'}`}>
          <i className="anticon anticon-info-circle" />
          <span className="partner-modal-title">已发送邀请</span>
        </div>
      </Modal>
    );
  }
}
