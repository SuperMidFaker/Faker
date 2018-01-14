import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Divider, Form, Input } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

@injectIntl
@Form.create()
export default class OAuthForm extends Component {
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
        <FormItem label={this.msg('callbackUrl')}>
          {getFieldDecorator('callback_url', {
              initialValue: app.callback_url,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input placeholder="https://www.example.com/app-name/callback" />)}
        </FormItem>
        <FormItem>
          <Button type="primary" icon="save">{this.msg('save')}</Button>
        </FormItem>
        <Divider />
        <h6>OAuth 2 介绍</h6>
        <p>1、访问授权地址, 浏览器访问 https://account.teambition.com/oauth2/authorize?client_id=&redirect_uri=</p>
        <p>2、用户登录并授权，跳转至回调地址</p>
        <p>3、根据回调地址上携带的一次性授权码(code), 根据接口获取授权token(access_token)</p>
        <p>4、使用 access_token 即可调用接口</p>
      </Form>
    );
  }
}
