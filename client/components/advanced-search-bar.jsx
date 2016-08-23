import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Input, Row, Col, Button, DatePicker, Checkbox, Select, Breadcrumb } from 'antd';
import { format } from 'client/common/i18n/helpers';
import RegionCascade from 'client/components/region-cascade';
import './search-bar.less';
import messages from './message.i18n';
const formatMsg = format(messages);

const FormItem = Form.Item;
const RangePicker = DatePicker.RangePicker;
const Option = Select.Option;
@injectIntl
@connect(
  state => ({
    loginId: state.account.loginId,
  }),
  { })
@Form.create()
export default class AdvancedSearchBar extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    onSearch: PropTypes.func.isRequired,
    loginId: PropTypes.number.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      value: props.value || '',
      fieldsLabel: [],
    };
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  handleSubmit = (e) => {
    if (e) e.preventDefault();
    const fieldsValue = this.props.form.getFieldsValue();
    const result = {};
    Object.keys(fieldsValue).forEach(key => {
      if (key === 'creater_login_id' && fieldsValue[key] === true) {
        result[key] = this.props.loginId;
      } else if (key === 'creater_login_id' && fieldsValue[key] === false) {
        result[key] = '';
      } else if (typeof fieldsValue[key] === 'object') {
        result[key] = JSON.stringify(fieldsValue[key]);
      } else {
        result[key] = fieldsValue[key];
      }
    });
    this.handleShowFieldsLabel([...this.state.fieldsLabel]);
    this.props.onSearch(result);
  }
  handleReset = () => {
    this.props.form.resetFields();
    this.handleShowFieldsLabel([]);
  }
  handleShowFieldsLabel = (fieldsLabel) => {
    const fieldsValue = this.props.form.getFieldsValue();
    Object.keys(fieldsValue).forEach(key => {
      if (fieldsValue[key] !== '' && fieldsValue[key] !== false && fieldsValue[key] !== null && fieldsValue[key] !== undefined && fieldsLabel.indexOf(this.msg(key)) < 0) {
        fieldsLabel.push(this.msg(key));
      }
    });
    this.setState({ fieldsLabel });
  }
  render() {
    const { visible, form: { getFieldProps } } = this.props;
    return (
      <div>
        <div style={{ paddingBottom: 10, paddingLeft: 10 }}>
          <Breadcrumb>
          {this.state.fieldsLabel.map(item => <Breadcrumb.Item>{item}</Breadcrumb.Item>)}
          </Breadcrumb>
        </div>
        <Form horizontal className="ant-advanced-search-form"
          style={{ margin: '20px 100px 20px 0', display: visible ? 'block' : 'none' }}
          onSubmit={this.handleSubmit}
        >
          <Row gutter={16}>
            <Col sm={8}>
              <FormItem
                label="客户"
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 14 }}
              >
                <Input placeholder="请输入搜索名称" size="default" {...getFieldProps('customer_name', { initialValue: '' })} />
              </FormItem>
              <FormItem
                label="发货区域"
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 14 }}
              >
                <RegionCascade {...getFieldProps('consigner_region', { initialValue: '' })} />
              </FormItem>
              <FormItem
                label="预计提货时间"
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 14 }}
              >
                <RangePicker style={{ width: 200 }} {...getFieldProps('pickup_est_date', { initialValue: '' })} />
              </FormItem>
              <FormItem
                label="实际提货时间"
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 14 }}
              >
                <RangePicker style={{ width: 200 }} {...getFieldProps('pickup_act_date', { initialValue: '' })} />
              </FormItem>
            </Col>
            <Col sm={8}>
              <FormItem
                label="承运商"
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 14 }}
              >
                <Input placeholder="请输入搜索名称" size="default" {...getFieldProps('sp_name', { initialValue: '' })} />
              </FormItem>
              <FormItem
                label="收获区域"
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 14 }}
              >
                <RegionCascade {...getFieldProps('consignee_region', { initialValue: '' })} />
              </FormItem>
              <FormItem
                label="预计交货时间"
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 14 }}
              >
                <RangePicker style={{ width: 200 }} {...getFieldProps('deliver_est_date', { initialValue: '' })} />
              </FormItem>
              <FormItem
                label="实际交货时间"
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 14 }}
              >
                <RangePicker style={{ width: 200 }} {...getFieldProps('deliver_act_date', { initialValue: '' })} />
              </FormItem>
              <FormItem
                label="与我相关"
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 14 }}
              >
                <Checkbox {...getFieldProps('creater_login_id', { initialValue: '', valuePropName: 'checked' })} />
              </FormItem>
            </Col>
            <Col sm={8}>
              <FormItem
                label="运输模式"
                labelCol={{ span: 10 }}
                wrapperCol={{ span: 14 }}
              >
                <Select size="large" style={{ width: 200 }} {...getFieldProps('transport_mode_code', { initialValue: '' })} >
                  <Option value="LTL">零担</Option>
                  <Option value="FTL">整车</Option>
                  <Option value="EXP">快递快运</Option>
                  <Option value="CTN">集装箱</Option>
                  <Option value="TNK">槽罐</Option>
                  <Option value="AIR">空运</Option>
                  <Option value="SEA">海运</Option>
                  <Option value="RWY">铁运</Option>
                </Select>
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12} offset={12} style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit" style={{ marginRight: 30 }}>搜索</Button>
              <Button onClick={this.handleReset}>清除条件</Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
