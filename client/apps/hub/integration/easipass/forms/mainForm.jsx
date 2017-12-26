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
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
    easipass: PropTypes.shape({
      send_dir: PropTypes.string.isRequired,
    }),
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form: { getFieldDecorator }, easipass } = this.props;
    return (
      <Row gutter={16}>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('epSendTradeCode')}>
            {getFieldDecorator('send_trade_code', {
              initialValue: easipass.send_trade_code,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('epRecvTradeCode')}>
            {getFieldDecorator('receive_trade_code', {
              initialValue: easipass.receive_trade_code,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('epUserCode')}>
            {getFieldDecorator('ep_user_code', {
              initialValue: easipass.ep_user_code,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('agentCustCode')}>
            {getFieldDecorator('agent_code', {
              initialValue: easipass.agent_code,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={24}>
          <FormItem label={this.msg('FTPserver')}>
            {getFieldDecorator('ftp_server', {
              initialValue: easipass.ftp_server,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('FTPusername')}>
            {getFieldDecorator('username', {
              initialValue: easipass.username,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('FTPpassword')}>
            {getFieldDecorator('password', {
              initialValue: easipass.password,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('sendDirectory')}>
            {getFieldDecorator('send_dir', {
              initialValue: easipass.send_dir,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('recvDirectory')}>
            {getFieldDecorator('recv_dir', {
              initialValue: easipass.recv_dir,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
      </Row>
    );
  }
}
