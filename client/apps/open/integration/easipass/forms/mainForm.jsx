/* eslint react/no-multi-comp: 0 */
import React, { Component, PropTypes } from 'react';
import { Form, Input, Col, Row } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;

@injectIntl
export default class MainForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl);
  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <Row gutter={16}>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('发送方协同ID号')} >
            {getFieldDecorator('send_trade_code', {
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('接收方协同ID号')} >
            {getFieldDecorator('receive_trade_code', {
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={24}>
          <FormItem label={this.msg('接收方用户ID(逗号分隔)')} >
            {getFieldDecorator('ep_user_code', {
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={24}>
          <FormItem label={this.msg('FTPserver')} >
            {getFieldDecorator('ftp_server', {
            })(<Input readOnly />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('FTPusername')} >
            {getFieldDecorator('username', {
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('FTPpassword')} >
            {getFieldDecorator('password', {
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('sendDirectory')} >
            {getFieldDecorator('send_dir', {
              initialValue: 'send',
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('recvDirectory')} >
            {getFieldDecorator('recv_dir', {
              initialValue: 'recv',
            })(<Input />)}
          </FormItem>
        </Col>
      </Row>
    );
  }
}
