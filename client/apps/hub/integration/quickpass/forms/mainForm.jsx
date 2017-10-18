import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Radio, Col, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
export default class MainForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    quickpass: PropTypes.shape({
      send_dir: PropTypes.string.isRequired,
    }),
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form: { getFieldDecorator }, quickpass } = this.props;
    return (
      <Row gutter={16}>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('部署模式')}>
            {getFieldDecorator('deploy_mode', {
              initialValue: quickpass.deploy_mode,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<RadioGroup>
              <RadioButton value="host">私有主机</RadioButton>
              <RadioButton value="cloud">公有云</RadioButton>
            </RadioGroup>)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('连接方式')}>
            {getFieldDecorator('connect_type', {
              initialValue: quickpass.connect_type,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<RadioGroup>
              <RadioButton value="ftp">FTP</RadioButton>
              <RadioButton value="mq">MQ</RadioButton>
              <RadioButton value="api">API</RadioButton>
            </RadioGroup>)}
          </FormItem>
        </Col>
        <Col sm={24} lg={24}>
          <FormItem label={this.msg('主机地址')}>
            {getFieldDecorator('host_address', {
              initialValue: quickpass.host_address,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input placeholder="主机IP地址或域名" />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('username')}>
            {getFieldDecorator('username', {
              initialValue: quickpass.username,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('password')}>
            {getFieldDecorator('password', {
              initialValue: quickpass.password,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
      </Row>
    );
  }
}
