import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Form, Input, Select } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const { Option } = Select;

@injectIntl
@Form.create()
@connect(
  state => ({
    customerPartners: state.partner.partners,
    currentFlow: state.scofFlow.currentFlow,
  }),
  { }
)
export default class InfoPane extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.shape({ getFieldDecorator: PropTypes.func.isRequired }).isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = formatMsg(this.props.intl)

  handleSave = () => {
    const data = this.props.form.getFieldsValue();
    this.props.updateBasicInfo(data.app_id, data.app_logo, data.app_desc, data.app_name);
  }
  render() {
    const { form: { getFieldDecorator }, currentFlow, customerPartners } = this.props;
    return (
      <Form>
        <FormItem label={this.msg('flowName')}>
          {
       getFieldDecorator('name', {
        initialValue: currentFlow.name,
         rules: [{ required: true, message: '流程名称必填' }],
       })(<Input />)
     }
        </FormItem>
        <FormItem label={this.msg('flowCustomer')}>
          {
       getFieldDecorator('customer', {
        initialValue: currentFlow.customer,
       })(<Select showSearch optionFilterProp="children" onSelect={this.handleCustomerSelect}>
         {customerPartners.map(data => (
           <Option key={data.id} value={data.id}>{data.partner_code ? `${data.partner_code} | ${data.name}` : data.name}</Option>))}
       </Select>)
      }
        </FormItem>

        <FormItem>
          <Button type="primary" icon="save" onClick={this.handleSave}>{this.msg('save')}</Button>
        </FormItem>
      </Form>
    );
  }
}
