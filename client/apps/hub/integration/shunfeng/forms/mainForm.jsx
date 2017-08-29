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
    config: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form: { getFieldDecorator }, config } = this.props;
    // url, checkword, accessCode, custid
    return (
      <Row gutter={16}>
        <Col sm={24} lg={24}>
          <FormItem label={this.msg('shunfengUrl')}>
            {getFieldDecorator('url', {
              initialValue: config.url,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('shunfengCheckword')}>
            {getFieldDecorator('checkword', {
              initialValue: config.checkword,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('shunfengAccesscode')}>
            {getFieldDecorator('accesscode', {
              initialValue: config.accesscode,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('shunfengCustid')}>
            {getFieldDecorator('custid', {
              initialValue: config.custid,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
      </Row>
    );
  }
}
