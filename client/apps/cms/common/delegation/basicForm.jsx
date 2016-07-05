import React, { Component, PropTypes } from 'react';
import { Form, Select, Input, Card, Col } from 'ant-ui';

const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: {span: 10},
  wrapperCol: {span: 14}
};

const clientData = [
  {code: '123', name: 'zank'},
  {code: 'yww', name: '叶伟伟'}
];
const tradeModes = ['1', '2', '3'];
const transModes = ['1', '2', '3'];
const declareWayModes = ['1', '2', '3'];

function generateOptions(arr) {
  return arr.map(item => <Option key={item} value={item}>{item}</Option>);
}

export default class BasicForm extends Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
  }
  render() {
    const { getFieldProps } = this.props.form;
    return (
      <Card title="基础信息">
        <Col sm={12}>
          <FormItem label="客户" {...formItemLayout} required>
            <Select combobox {...getFieldProps('client_name')}>
              {clientData.map(data => <Option key={data.code} value={data.name} datalink={data}>{data.name}</Option>)}
            </Select>
          </FormItem>
          <FormItem label="发票号" {...formItemLayout}>
            <Input {...getFieldProps('invoice_no')}/>
          </FormItem>
          <FormItem label="提运单号" {...formItemLayout}>
            <Input {...getFieldProps('bl_wb_no')}/>
          </FormItem>
          <FormItem label="备案号" {...formItemLayout}>
            <Input {...getFieldProps('ems_no')}/>
          </FormItem>
          <FormItem label="航名航次" {...formItemLayout}>
            <Input {...getFieldProps('voyage_no')}/>
          </FormItem>
          <FormItem label="件数" {...formItemLayout}>
            <Input {...getFieldProps('pieces')}/>
          </FormItem>
          <FormItem label="内部编号" {...formItemLayout}>
            <Input {...getFieldProps('internal_no')}/>
          </FormItem>
        </Col>
        <Col sm={12}>
          <FormItem label="报关类型" {...formItemLayout}>
            <Select {...getFieldProps('decl_way_code')}>
              {generateOptions(declareWayModes)}
            </Select>
          </FormItem>
          <FormItem label="合同号" {...formItemLayout}>
            <Input {...getFieldProps('contract_no')}/>
          </FormItem>
          <FormItem label="运输方式" {...formItemLayout}>
            <Select {...getFieldProps('trans_mode')}>
              {generateOptions(transModes)}
            </Select>
          </FormItem>
          <FormItem label="订单号" {...formItemLayout}>
            <Input {...getFieldProps('order_no')}/>
          </FormItem>
          <FormItem label="贸易方式" {...formItemLayout}>
            <Select {...getFieldProps('trade_mode')}>
              {generateOptions(tradeModes)}
            </Select>
          </FormItem>
          <FormItem label="重量" {...formItemLayout}>
            <Input {...getFieldProps('weight')}/>
          </FormItem>
        </Col>
      </Card>
    );
  }
}
