import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Input, Row, Col, Button, DatePicker, Checkbox, Select, Tag, Tooltip, Icon } from 'antd';
import moment from 'moment';
import { format } from 'client/common/i18n/helpers';
import RegionCascade from 'client/components/region-cascade';
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
    toggle: PropTypes.func.isRequired,
  }
  constructor(props) {
    super(props);
    this.state = {
      fields: [],
      consignerRegion: [],
      consigneeRegion: [],
    };
  }

  handleResetFields = () => {
    this.setState({ consignerRegion: [], consigneeRegion: [] });
    this.props.form.resetFields();
    this.handleShowFieldsLabel([], []);
  }
  handleCloseTag = (names) => {
    if (names[0] === 'consigner_region') {
      this.handleSearch([], this.state.consigneeRegion);
    } else if (names[0] === 'consignee_region') {
      this.handleSearch(this.state.consignerRegion, []);
    } else {
      this.props.form.resetFields(names);
      this.handleSearch(this.state.consignerRegion, this.state.consigneeRegion);
    }
  }
  handleSearch = (consignerRegion, consigneeRegion) => {
    const fieldsValue = this.props.form.getFieldsValue();
    if (consignerRegion.length !== 0) {
      fieldsValue.consigner_region = consignerRegion;
    } else {
      fieldsValue.consigner_region = '';
    }
    if (consigneeRegion.length !== 0) {
      fieldsValue.consignee_region = consigneeRegion;
    } else {
      fieldsValue.consignee_region = '';
    }
    const result = {};
    Object.keys(fieldsValue).forEach(key => {
      if (key === 'relatedToMe' && fieldsValue[key] === true) {
        result[key] = this.props.loginId;
      } else if (key === 'relatedToMe' && fieldsValue[key] === false) {
        result[key] = '';
      } else if (typeof fieldsValue[key] === 'object') {
        result[key] = JSON.stringify(fieldsValue[key]);
      } else {
        result[key] = fieldsValue[key];
      }
    });
    this.props.onSearch(result);
    this.setState({ consignerRegion, consigneeRegion });
    this.handleShowFieldsLabel(consignerRegion, consigneeRegion);
  }
  handleSubmit = (e) => {
    if (e) e.preventDefault();
    this.handleSearch(this.state.consignerRegion, this.state.consigneeRegion);
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  handleShowFieldsLabel = (consignerRegion, consigneeRegion) => {
    const fields = [];
    const fieldsValue = this.props.form.getFieldsValue();
    if (consignerRegion.length !== 0) {
      fieldsValue.consigner_region = consignerRegion;
    }
    if (consigneeRegion.length !== 0) {
      fieldsValue.consignee_region = consigneeRegion;
    }
    Object.keys(fieldsValue).forEach(key => {
      if (fieldsValue[key] && fieldsValue[key] !== '' && fieldsValue[key] !== false && fieldsValue[key] !== null && fieldsValue[key] !== undefined) {
        fields.push({
          key,
          value: fieldsValue[key],
          label: this.msg(key),
        });
      }
    });
    this.setState({ fields });
  }
  handleConsignerRegionValue = (region) => {
    region.shift();
    this.setState({ consignerRegion: region });
  }
  handleConsigneeRegionValue = (region) => {
    region.shift();
    this.setState({ consigneeRegion: region });
  }
  format = (item) => {
    if (item.key === 'customer_name' ||
      item.key === 'sp_name' ||
      item.key === 'transport_mode') {
      return `${item.label}: ${item.value}`;
    } else if (item.key === 'relatedToMe') {
      return item.label;
    } else if (item.key === 'pickup_est_date' ||
      item.key === 'pickup_act_date' ||
      item.key === 'deliver_est_date' ||
      item.key === 'deliver_act_date') {
      const value = item.value;
      const startDate = `${moment(value[0]).format('YYYY-MM-DD')} 00:00:00`;
      const endDate = `${moment(value[1]).format('YYYY-MM-DD')} 23:59:59`;
      return `${item.label}: ${startDate}~${endDate}`;
    } else if (item.key === 'consigner_region' ||
      item.key === 'consignee_region') {
      const value = [...item.value];
      return `${item.label}: ${value.join('-')}`;
    }
    return item.label;
  }
  render() {
    const { visible, form: { getFieldProps } } = this.props;
    const { fields } = this.state;
    return (
      <div>
        <div className="ant-alert ant-alert-info ant-alert-no-icon" style={{ display: fields.length === 0 ? 'none' : 'block' }}>
          {fields.map(item => <Tag closable color="blue" key={item.key} onClose={() => this.handleCloseTag([item.key])}>{this.format(item)}</Tag>)}
        </div>
        <Form horizontal className="ant-advanced-search-form"
          style={{ display: visible ? 'block' : 'none' }}
          onSubmit={this.handleSubmit}
        >
          <Row gutter={16}>
            <Col sm={8}>
              <FormItem
                label="客户"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
              >
                <Input placeholder="请输入客户名称" size="default" {...getFieldProps('customer_name', { initialValue: '' })} />
              </FormItem>
              <FormItem
                label="出发地"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
              >
                <RegionCascade region={this.state.consignerRegion} onChange={this.handleConsignerRegionValue} />
              </FormItem>
              <FormItem
                label="到达地"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
              >
                <RegionCascade region={this.state.consigneeRegion} onChange={this.handleConsigneeRegionValue} />
              </FormItem>
            </Col>
            <Col sm={8}>
              <FormItem
                label="承运商"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
              >
                <Input placeholder="请输入承运商名称" size="default" {...getFieldProps('sp_name', { initialValue: '' })} />
              </FormItem>
              <FormItem
                label="预计提货时间"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
              >
                <RangePicker style={{ width: '100%' }} {...getFieldProps('pickup_est_date', { initialValue: '' })} />
              </FormItem>

              <FormItem
                label="预计交货时间"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
              >
                <RangePicker style={{ width: '100%' }} {...getFieldProps('deliver_est_date', { initialValue: '' })} />
              </FormItem>
            </Col>
            <Col sm={8}>
              <FormItem
                label="运输模式"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
              >
                <Select size="large" style={{ width: '100%' }} {...getFieldProps('transport_mode', { initialValue: '' })} >
                  <Option value="零担">零担</Option>
                  <Option value="整车">整车</Option>
                  <Option value="快递快运">快递快运</Option>
                  <Option value="集装箱">集装箱</Option>
                  <Option value="槽罐">槽罐</Option>
                  <Option value="空运">空运</Option>
                  <Option value="海运">海运</Option>
                  <Option value="铁运">铁运</Option>
                </Select>
              </FormItem>
              <FormItem
                label="实际提货时间"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
              >
                <RangePicker style={{ width: '100%' }} {...getFieldProps('pickup_act_date', { initialValue: '' })} />
              </FormItem>
              <FormItem
                label="实际交货时间"
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
              >
                <RangePicker style={{ width: '100%' }} {...getFieldProps('deliver_act_date', { initialValue: '' })} />
              </FormItem>
              <FormItem
                label={<span>仅显示我的运单 <Tooltip title="由我新建的以及分配给我的运单"><Icon type="question-circle-o" /></Tooltip></span>}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 14 }}
              >
                <Checkbox {...getFieldProps('relatedToMe', { valuePropName: 'checked' })} />
              </FormItem>
            </Col>
          </Row>
          <Row>
            <Col span={12} offset={12} style={{ textAlign: 'right' }}>
              <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>搜索</Button>
              <Button onClick={() => this.handleResetFields()} style={{ marginRight: 16 }}>清除条件</Button>
              <a onClick={this.props.toggle}>收起</a>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
