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

export default class AppCreateModal extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    appName: '',
  }
  msg = formatMsg(this.props.intl);
  handleCancel = () => {
    this.props.toggleAppCreateModal(false);
  }
  handleOk = () => {
    const { appName } = this.state;
    if (!appName) {
      message.warn('应用名称不能为空');
      return;
    }
    this.props.createApp(appName).then((result) => {
      if (!result.error) {
        this.props.loadDevApps();
        this.handleCancel();
      }
    });
  }
  handleChange = (e) => {
    this.setState({
      appName: e.target.value,
    });
  }
  render() {
    const { visible } = this.props;
    const { appName } = this.state;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Modal title="创建应用" visible={visible} onCancel={this.handleCancel} onOk={this.handleOk}>
        <FormItem {...formItemLayout} label="应用名称">
          <Input value={appName} onChange={this.handleChange} />
        </FormItem>
      </Modal>
    );
  }
}
