import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Form, Input, Col, Row, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { updateEasipassApp } from 'common/reducers/openIntegration';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    app: state.openIntegration.easipassApp,
  }),
  { updateEasipassApp }
)
@Form.create()
export default class ParamsForm extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
  }
  msg = formatMsg(this.props.intl)
  handleSave = () => {
    const { app } = this.props;
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.updateEasipassApp({ ...values, uuid: app.uuid }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            message.success('保存成功');
            // this.context.router.goBack();
          }
        });
      }
    });
  }
  render() {
    const { form: { getFieldDecorator }, app } = this.props;
    return (
      <Form>
        <Row gutter={16}>
          <Col span={12}>
            <FormItem label={this.msg('epSendTradeCode')}>
              {getFieldDecorator('send_trade_code', {
                initialValue: app.send_trade_code,
                rules: [{ required: true, message: this.msg('parameterRequired') }],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label={this.msg('epRecvTradeCode')}>
              {getFieldDecorator('receive_trade_code', {
                initialValue: app.receive_trade_code,
                rules: [{ required: true, message: this.msg('parameterRequired') }],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label={this.msg('epUserCode')}>
              {getFieldDecorator('ep_user_code', {
                initialValue: app.ep_user_code,
                rules: [{ required: true, message: this.msg('parameterRequired') }],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label={this.msg('agentCustCode')}>
              {getFieldDecorator('agent_code', {
                initialValue: app.agent_code,
                rules: [{ required: true, message: this.msg('parameterRequired') }],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label={this.msg('FTPserver')}>
              {getFieldDecorator('ftp_server', {
                initialValue: app.ftp_server,
                rules: [{ required: true, message: this.msg('parameterRequired') }],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label={this.msg('FTPusername')}>
              {getFieldDecorator('username', {
                initialValue: app.username,
                rules: [{ required: true, message: this.msg('parameterRequired') }],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label={this.msg('FTPpassword')}>
              {getFieldDecorator('password', {
                initialValue: app.password,
                rules: [{ required: true, message: this.msg('parameterRequired') }],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label={this.msg('sendDirectory')}>
              {getFieldDecorator('send_dir', {
                initialValue: app.send_dir,
                rules: [{ required: true, message: this.msg('parameterRequired') }],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label={this.msg('recvDirectory')}>
              {getFieldDecorator('recv_dir', {
                initialValue: app.recv_dir,
                rules: [{ required: true, message: this.msg('parameterRequired') }],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem>
              <Button type="primary" icon="save" onClick={this.handleSave}>{this.msg('save')}</Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
