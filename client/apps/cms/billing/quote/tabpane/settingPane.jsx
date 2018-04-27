import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Checkbox, Form, Row, Col, Input, Select, InputNumber } from 'antd';
import FormPane from 'client/components/FormPane';
import { INVOICE_TYPE } from 'common/constants';
import { formatMsg, formatGlobalMsg } from '../../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;

@injectIntl
@connect(state => ({
  formData: state.cmsQuote.quoteData,
}))
export default class SettingPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  render() {
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      colon: false,
    };
    const {
      form: { getFieldDecorator }, formData, readOnly,
    } = this.props;
    return (
      <FormPane>
        <Card>
          <Row>
            <Col span={6}>
              <FormItem label="报价名称" {...formItemLayout} required>
                {getFieldDecorator('quote_name', {
                  rules: [{ required: true }],
                  initialValue: formData.quote_name,
                })(<Input disabled={readOnly} />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card title={this.msg('billingParams')}>
          <Row>
            <Col span={6}>
              <FormItem label="开票类型" {...formItemLayout}>
                {getFieldDecorator('invoice_type', {
                  initialValue: formData.invoice_type,
                  rules: [{ required: true, message: '开票类型必选' }],
                })(<Select style={{ width: '100%' }} disabled={readOnly}>
                  {
                      INVOICE_TYPE.map(inv =>
                        <Option value={inv.value} key={inv.value}>{inv.text}</Option>)
                    }
                </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="报关单品项数量" {...formItemLayout}>
                {getFieldDecorator('cus_item_per_sheet', {
                  initialValue: Number(formData.cus_item_per_sheet),
                  rules: [{ required: true, message: '品项数必填' }],
                })(<InputNumber style={{ width: '100%' }} disabled={readOnly} />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="报检单品项数量" {...formItemLayout}>
                {getFieldDecorator('ciq_item_per_sheet', {
                  initialValue: Number(formData.ciq_item_per_sheet),
                  rules: [{ required: true, message: '品项数必填' }],
                })(<InputNumber style={{ width: '100%' }} disabled={readOnly} />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="允许特殊费用" {...formItemLayout}>
                {getFieldDecorator('special_fee_allowed', {
                })(<Checkbox
                  disabled={readOnly}
                  defaultChecked={formData.special_fee_allowed || false}
                />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
      </FormPane>
    );
  }
}
