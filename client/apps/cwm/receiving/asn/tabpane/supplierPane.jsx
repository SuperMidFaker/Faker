/* eslint react/no-multi-comp: 0 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Card, Col, Row, Input } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);
const FormItem = Form.Item;

@injectIntl
export default class SupplierPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    editable: PropTypes.bool,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { form: { getFieldDecorator } } = this.props;
    return (
      <Card title="预约信息" className="secondary-card">
        <Row gutter={16}>
          <Col sm={24}>
            <FormItem label="车号" >
              {getFieldDecorator('hs_code', {
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24}>
            <FormItem label="司机" >
              {getFieldDecorator('chinese_desc', {
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24}>
            <FormItem label="月台号" >
              {getFieldDecorator('chinese_desc', {
              })(<Input />)}
            </FormItem>
          </Col>
          <Col sm={24}>
            <FormItem label={this.msg('model')} >
              {getFieldDecorator('model', {
              })(<Input.TextArea autosize={{ minRows: 2, maxRows: 6 }} />)}
            </FormItem>
          </Col>
        </Row>
      </Card>
    );
  }
}
