import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Form, Input, Col, Row, message } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { updateShftzApp } from 'common/reducers/openIntegration';
import { formatMsg } from '../../message.i18n';

const FormItem = Form.Item;

@injectIntl
@connect(
  state => ({
    app: state.openIntegration.shftzApp,
  }),
  { updateShftzApp }
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
        this.props.updateShftzApp({ ...values, uuid: app.uuid }).then((result) => {
          if (result.error) {
            message.error(result.error.message, 10);
          } else {
            message.success('保存成功');
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
          <Col span={24}>
            <FormItem label={this.msg('ftzserver')}>
              {getFieldDecorator('ftz_host', {
                initialValue: app.ftz_host,
                rules: [{ required: true, message: this.msg('parameterRequired') }],
              })(<Input addonBefore="http://" />)}
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
