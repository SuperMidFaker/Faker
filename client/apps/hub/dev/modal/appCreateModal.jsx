import React, { Component } from 'react';
import { Modal, Input, Form, message } from 'antd';
import { connect } from 'react-redux';
import { toggleAppCreateModal, createApp, loadDevApps } from 'common/reducers/devApp';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    visible: state.devApp.appCreateModal.visible,
  }),
  { toggleAppCreateModal, createApp, loadDevApps }
)
@Form.create()
export default class AppCreateModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  msg = formatMsg(this.props.intl);
  handleCancel = () => {
    this.props.toggleAppCreateModal(false);
  }
  handleOk = () => {
    this.props.form.validateFields((error, values) => {
      if (!error) {
        this.props.createApp(values.app_name).then((result) => {
          if (!result.error) {
            this.props.loadDevApps();
            this.handleCancel();
          } else {
            message.error(result.error.message, 10);
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
      <Modal title="创建应用" visible={visible} onCancel={this.handleCancel} onOk={this.handleOk} destroyOnClose>
        <Form>
          <FormItem {...formItemLayout} label="应用名称">
            {getFieldDecorator('app_name', {
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
