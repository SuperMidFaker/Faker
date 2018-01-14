import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Divider, Form, Input } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import AvatarUploader from 'client/components/AvatarUploader';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@Form.create()
export default class ProfileForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    app: PropTypes.shape({
      send_dir: PropTypes.string.isRequired,
    }),
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form: { getFieldDecorator }, app } = this.props;
    return (
      <Form>
        <FormItem label={this.msg('appLogo')}>
          {getFieldDecorator('app_logo', {
              initialValue: app.app_logo,
            })(<AvatarUploader />)}
        </FormItem>
        <FormItem label={this.msg('appName')}>
          {getFieldDecorator('app_name', {
              initialValue: app.app_name,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
        </FormItem>
        <FormItem label={this.msg('appDesc')}>
          {getFieldDecorator('app_desc', {
              initialValue: app.app_desc,
            })(<Input.TextArea placeholder="简要描述一下应用" />)}
        </FormItem>
        <FormItem>
          <Button type="primary" icon="save">{this.msg('save')}</Button>
        </FormItem>
        <Divider />
        <FormItem label={this.msg('appId')}>
          {getFieldDecorator('app_id', {
              initialValue: app.app_id,
            })(<Input disabled />)}
        </FormItem>
        <FormItem label={this.msg('appSecret')}>
          {getFieldDecorator('app_secret', {
              initialValue: app.app_secret,
            })(<Input disabled />)}
        </FormItem>
        <Divider />
        <FormItem>
          <Button type="danger" icon="delete">{this.msg('delete')}</Button>
        </FormItem>
      </Form>
    );
  }
}
