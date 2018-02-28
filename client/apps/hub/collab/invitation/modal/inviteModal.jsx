import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Alert, Modal, Form, Input } from 'antd';
import { inviteOfflinePartner, showInviteModal } from 'common/reducers/invitation';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    visible: state.invitation.inviteModal.visible,
    inviteeInfo: state.invitation.inviteModal.inviteeInfo,
  }),
  { showInviteModal, inviteOfflinePartner }
)
export default class InviteModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    inviteOfflinePartner: PropTypes.func.isRequired,
    showInviteModal: PropTypes.func.isRequired,
    inviteeInfo: PropTypes.object.isRequired,
  }
  state = {
    phone: '',
    email: '',
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.inviteeInfo) {
      this.setState({
        phone: nextProps.inviteeInfo.phone,
        email: nextProps.inviteeInfo.email,
      });
    }
  }

  handleCancel = () => {
    this.props.showInviteModal(false);
  }
  handleSave = () => {
    const { inviteeInfo } = this.props;
    const { phone, email } = this.state;
    this.props.inviteOfflinePartner({
      contactInfo: {
        phone, email,
      },
      inviteeInfo,
    }).then(() => {
      this.handleCancel();
    });
  }
  render() {
    const { phone, email } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 14 },
    };
    return (
      <Modal maskClosable={false} visible={this.props.visible} title="申请开通" onCancel={this.handleCancel} onOk={this.handleSave}>
        <Alert message="该合作伙伴为线下用户，申请开通平台租户帐号" type="info" showIcon />
        <FormItem {...formItemLayout} label="电话:">
          <Input value={phone} onChange={e => this.setState({ phone: e.target.value })} />
        </FormItem>
        <FormItem {...formItemLayout} label="邮箱:">
          <Input value={email} onChange={e => this.setState({ email: e.target.value })} />
        </FormItem>
      </Modal>
    );
  }
}
