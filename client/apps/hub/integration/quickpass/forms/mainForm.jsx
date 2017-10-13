import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Col, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;

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
          <FormItem label={this.msg('epSendTradeCode')}>
            {getFieldDecorator('send_trade_code', {
              initialValue: quickpass.send_trade_code,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('epRecvTradeCode')}>
            {getFieldDecorator('receive_trade_code', {
              initialValue: quickpass.receive_trade_code,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={24}>
          <FormItem label={this.msg('FTPserver')}>
            {getFieldDecorator('ftp_server', {
              initialValue: quickpass.ftp_server,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('FTPusername')}>
            {getFieldDecorator('username', {
              initialValue: quickpass.username,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('FTPpassword')}>
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
