import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Form, Input, Col, Radio, Row, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { updateQuickpassApp } from 'common/reducers/hubIntegration';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    app: state.hubIntegration.quickpassApp,
  }),
  { updateQuickpassApp }
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
        this.props.updateQuickpassApp({ ...values, uuid: app.uuid }).then((result) => {
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
            <FormItem label={this.msg('部署模式')}>
              {getFieldDecorator('deploy_mode', {
            initialValue: app.deploy_mode,
            rules: [{ required: true, message: this.msg('parameterRequired') }],
          })(<RadioGroup>
            <RadioButton value="host">私有主机</RadioButton>
            <RadioButton value="cloud">公有云</RadioButton>
          </RadioGroup>)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label={this.msg('连接方式')}>
              {getFieldDecorator('connect_type', {
            initialValue: app.connect_type,
            rules: [{ required: true, message: this.msg('parameterRequired') }],
          })(<RadioGroup>
            <RadioButton value="ftp">FTP</RadioButton>
            <RadioButton value="mq">MQ</RadioButton>
            <RadioButton value="api">API</RadioButton>
          </RadioGroup>)}
            </FormItem>
          </Col>
          <Col span={24}>
            <FormItem label={this.msg('主机地址')}>
              {getFieldDecorator('host_address', {
            initialValue: app.host_address,
            rules: [{ required: true, message: this.msg('parameterRequired') }],
          })(<Input placeholder="主机IP地址或域名" />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label={this.msg('username')}>
              {getFieldDecorator('username', {
            initialValue: app.username,
            rules: [{ required: true, message: this.msg('parameterRequired') }],
          })(<Input />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label={this.msg('password')}>
              {getFieldDecorator('password', {
            initialValue: app.password,
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
