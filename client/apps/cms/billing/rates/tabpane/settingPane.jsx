import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Checkbox, Form, Row, Col, Input, Select } from 'antd';
import { setClientForm } from 'common/reducers/sofOrders';
import FormPane from 'client/components/FormPane';
import { INVOICE_TYPE } from 'common/constants';
import { formatMsg, formatGlobalMsg } from '../../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;

@injectIntl
@connect(
  state => ({
    formData: state.sofOrders.formData,
  }),
  { setClientForm }
)
export default class SettingPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
  }
  state = {
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
      form: { getFieldDecorator }, quoteNo, quoteName, requester, provider,
    } = this.props;
    // todo required
    return (
      <FormPane>
        <Card>
          <Row>
            <Col span={6}>
              <FormItem label="报价编号" {...formItemLayout}>
                <Input value={quoteNo} onChange={this.handleChange} disabled />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="报价名称" {...formItemLayout} required>
                <Input value={quoteName} onChange={this.handleChange} />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="服务需求方" {...formItemLayout}>
                <Input value={requester} onChange={this.handleChange} disabled />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="报价提供方" {...formItemLayout}>
                <Input value={provider} onChange={this.handleChange} disabled />
              </FormItem>
            </Col>
          </Row>
        </Card>
        <Card title={this.msg('billingParams')}>
          <Row>
            <Col span={6}>
              <FormItem label="开票类型" {...formItemLayout}>
                {getFieldDecorator('invoice_type', {
                  rules: [{ required: true, message: '开票类型必选', type: 'number' }],
                })(<Select style={{ width: '100%' }} >
                  {
                      INVOICE_TYPE.map(inv =>
                        <Option value={inv.value} key={inv.value}>{inv.text}</Option>)
                    }
                </Select>)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="报关单品项数量" {...formItemLayout}>
                {getFieldDecorator('decl_item_per_sheet', {
                  rules: [{ required: true, message: '品项数必填', type: 'number' }],
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="报检单品项数量" {...formItemLayout}>
                {getFieldDecorator('ciq_item_per_sheet', {
                  rules: [{ required: true, message: '品项数必填', type: 'number' }],
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem label="允许特殊费用" {...formItemLayout}>
                {getFieldDecorator('allow_spcial_charges', {
                })(<Checkbox />)}
              </FormItem>
            </Col>
          </Row>
        </Card>
      </FormPane>
    );
  }
}
