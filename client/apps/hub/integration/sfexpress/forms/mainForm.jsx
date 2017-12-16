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
    config: PropTypes.shape({
      url: PropTypes.string,
      checkword: PropTypes.string,
      accesscode: PropTypes.string,
      custid: PropTypes.string,
    }).isRequired,
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { form: { getFieldDecorator }, config } = this.props;
    // url, checkword, accessCode, custid
    return (
      <Row gutter={16}>
        <Col sm={24} lg={24}>
          <FormItem label={this.msg('sfexpressUrl')}>
            {getFieldDecorator('url', {
              initialValue: config.url,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('sfexpressCheckword')}>
            {getFieldDecorator('checkword', {
              initialValue: config.checkword,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('sfexpressAccesscode')}>
            {getFieldDecorator('accesscode', {
              initialValue: config.accesscode,
              rules: [{ required: true, message: this.msg('parameterRequired') }],
            })(<Input />)}
          </FormItem>
        </Col>
        <Col sm={24} lg={12}>
          <FormItem label={this.msg('sfexpressCustid')}>
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
