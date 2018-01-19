import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Divider, Form, Input, Modal, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { updateAppStatus, deleteApp, updateInteBasicInfo } from 'common/reducers/openIntegration';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const { confirm } = Modal;

@injectIntl
@connect(
  state => ({
    app: state.openIntegration.currentApp,
  }),
  { updateAppStatus, deleteApp, updateInteBasicInfo }
)
@Form.create()
export default class ProfileForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleEnableApp = () => {
    this.props.updateAppStatus({ uuid: this.props.app.uuid, enabled: true }).then((result) => {
      if (!result.error) {
        message.success(this.msg('appEnabled'));
      }
    });
  }
  handleDisableApp = () => {
    this.props.updateAppStatus({ uuid: this.props.app.uuid, enabled: false }).then((result) => {
      if (!result.error) {
        message.info(this.msg('appDisabled'));
      }
    });
  }
  handleDeleteApp = () => {
    const self = this;
    confirm({
      title: '确认删除此应用吗?',
      content: '删除应用后将不可恢复',
      okType: 'danger',
      onOk() {
        self.props.deleteApp(self.props.app.uuid).then((result) => {
          if (!result.error) {
            message.info(self.msg('appDeleted'));
            self.context.router.push('/hub/integration/installed');
          }
        });
      },
      onCancel() {
      },
    });
  }
  handleSave = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.updateInteBasicInfo({
          ...values, uuid: this.props.app.uuid,
        }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            message.success('更新成功');
          }
        });
      }
    });
  }
  render() {
    const { form: { getFieldDecorator }, app } = this.props;
    return (
      <Form>
        <FormItem label={this.msg('appName')}>
          {getFieldDecorator('name', {
            initialValue: app.name,
            rules: [{ required: true, message: this.msg('parameterRequired') }],
          })(<Input />)}
        </FormItem>
        <FormItem>
          <Button type="primary" icon="save" onClick={this.handleSave}>{this.msg('save')}</Button>
        </FormItem>
        <Divider />
        <FormItem>
          {app.enabled ? <Button icon="pause-circle-o" onClick={this.handleDisableApp}>{this.msg('disable')}</Button> :
          <Button icon="play-circle" onClick={this.handleEnableApp}>{this.msg('enable')}</Button>}
          <Button type="danger" icon="delete" style={{ marginLeft: 8 }} onClick={this.handleDeleteApp}>{this.msg('deleteApp')}</Button>
        </FormItem>
      </Form>
    );
  }
}
