import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Modal, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
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
    installSFExpressApp,
    installArCtmApp,
    installShftzApp,
    installEasipassApp,
    toggleInstallAppModal,
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
        const { type } = this.props;
        let installApp = null;
        let appType = null;
        if (type === 'SFEXPRESS') {
          installApp = this.props.installSFExpressApp;
          appType = 'sfexpress';
        } else if (type === 'ARCTM') {
          installApp = this.props.installArCtmApp;
          appType = 'arctm';
        } else if (type === 'SHFTZ') {
          installApp = this.props.installShftzApp;
          appType = 'shftz';
        } else {
          installApp = this.props.installEasipassApp;
          appType = 'easipass';
        }
        installApp({
          ...values, app_type: type, tenant_id: this.props.tenantId,
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            this.handleCancel();
            const { uuid } = result.data;
            this.context.router.push(`/paas/integration/${appType}/config/${uuid}`);
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
