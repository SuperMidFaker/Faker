import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Modal, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { uuidWithoutDash } from 'client/common/uuid';
import { installSFExpressApp, installArCtmApp, installShftzApp, installEasipassApp, toggleInstallAppModal } from 'common/reducers/hubIntegration';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.hubIntegration.installAppModal.visible,
    type: state.hubIntegration.installAppModal.type,
    tenantId: state.account.tenantId,
  }),
  {
    installSFExpressApp, installArCtmApp, installShftzApp, installEasipassApp, toggleInstallAppModal,
  }
)
@Form.create()
export default class InstallAppModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleCancel = () => {
    this.props.toggleInstallAppModal(false);
  }
  handleOk = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const uuid = uuidWithoutDash();
        const { type } = this.props;
        let todo = null;
        let appType = null;
        if (type === 'SFEXPRESS') {
          todo = this.props.installSFExpressApp;
          appType = 'sfexpress';
        } else if (type === 'ARCTM') {
          todo = this.props.installArCtmApp;
          appType = 'arctm';
        } else if (type === 'SHFTZ') {
          todo = this.props.installShftzApp;
          appType = 'shftz';
        } else {
          todo = this.props.installEasipassApp;
          appType = 'easipass';
        }
        todo({
          ...values, uuid, app_type: type, tenant_id: this.props.tenantId,
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.handleCancel();
            this.context.router.push(`/hub/integration/${appType}/config/${uuid}`);
          }
        });
      }
    });
  }
  render() {
    const { visible, form: { getFieldDecorator } } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal title={this.msg('installApp')} visible={visible} onCancel={this.handleCancel} onOk={this.handleOk}>
        <FormItem {...formItemLayout} label={this.msg('appName')}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: this.msg('appNameRequired') }],
          })(<Input />)}
        </FormItem>
      </Modal>
    );
  }
}
