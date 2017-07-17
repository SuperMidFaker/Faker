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
    shftz: PropTypes.shape({
      ftz_host: PropTypes.string.isRequired,
    }),
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form: { getFieldDecorator }, shftz } = this.props;
    return (
      <Row gutter={16}>
        <Col sm={24} lg={24}>
          <FormItem label={this.msg('ftzserver')}>
            {getFieldDecorator('ftz_host', {
              initialValue: shftz.ftz_host,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input addonBefore="http://" />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('username')}>
            {getFieldDecorator('username', {
              initialValue: shftz.username,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('password')}>
            {getFieldDecorator('password', {
              initialValue: shftz.password,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
      </Row>
    );
  }
}
