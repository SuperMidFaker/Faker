import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Input, Select, Row, Col, Icon, DatePicker, Radio } from 'antd';
import { checkOwnerColumn, checkProductColumn, checkLocationColumn, checkProductLocation, changeSearchType, clearList } from 'common/reducers/cwmInventoryStock';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    filter: state.cwmTransition.listFilter,
    owners: state.cwmContext.whseAttrs.owners,
  }),
  { checkOwnerColumn, checkProductColumn, checkLocationColumn, checkProductLocation, changeSearchType, clearList }
)
@Form.create()
export default class HeadForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
  }
  state = {
    expandForm: false,
  };
  handleFormReset = () => {
    this.props.form.resetFields();
  }
  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  }
  handleStockSearch = (ev) => {
    ev.preventDefault();
    this.props.form.validateFields((err) => {
      if (!err) {
        const formData = this.props.form.getFieldsValue();
        this.props.onSearch(formData);
      }
    });
  }

  render() {
    const { form: { getFieldDecorator }, owners, filter } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    };
    return (
      <Form className="form-layout-compact">
        <Row gutter={16}>
          <Col span={5}>
            <FormItem {...formItemLayout} label="仓库">
              {getFieldDecorator('product_no', {
                initialValue: filter.product_no,
              })(<Select disabled />)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem {...formItemLayout} label="提货单位">
              {getFieldDecorator('owner', { initialValue: filter.owner,
                rules: [{ required: true, message: '提货单位必选' }],
              })(
                <Select placeholder="请选择提货单位" showSearch optionFilterProp="children" allowClear>
                  {owners.map(owner => (<Option value={owner.id} key={owner.id}>{owner.name}</Option>))}
                </Select>)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem {...formItemLayout} label="报关代理">
              {getFieldDecorator('asn_no', { initialValue: filter.asn_no })(
                <Select placeholder="请选择报关代理" />)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem {...formItemLayout} label="类型">
              {getFieldDecorator('external_lot_no', { initialValue: filter.external_lot_no })(
                <RadioGroup onChange={this.handleIetypeChange}>
                  <RadioButton value="import">进口</RadioButton>
                  <RadioButton value="export">出口</RadioButton>
                </RadioGroup>)}
            </FormItem>
          </Col>
          <Col span={1}>
            <FormItem>
              <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggleForm}>
                {this.state.expandForm ? '收起' : '展开'} <Icon type={this.state.expandForm ? 'up' : 'down'} />
              </a>
            </FormItem>
          </Col>
        </Row>
        {this.state.expandForm && <Row gutter={16}>
          <Col span={5}>
            <FormItem {...formItemLayout} label="出口日期">
              {getFieldDecorator('serial_no', {
                initialValue: filter.serial_no,
              })(<DatePicker />)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem {...formItemLayout} label="报关日期">
              {getFieldDecorator('trace_id', {
                initialValue: filter.trace_id,
              })(<DatePicker />)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem {...formItemLayout} label="预计出区日期">
              {getFieldDecorator('location', {
                initialValue: filter.location,
              })(<DatePicker size="large" />)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem {...formItemLayout} label="运输单位">
              {getFieldDecorator('virtual_whse', {
                initialValue: filter.virtual_whse,
              })(<Input placeholder="库别" />)}
            </FormItem>
          </Col>
        </Row>}
        {this.state.expandForm && <Row gutter={16}>
          <Col span={5}>
            <FormItem {...formItemLayout} label="合同发票号">
              {getFieldDecorator('attrib_1_string', {
                initialValue: filter.attrib_1_string,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem {...formItemLayout} label="目的地">
              {getFieldDecorator('attrib_2_string', {
                initialValue: filter.attrib_2_string,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem {...formItemLayout} label="封志">
              {getFieldDecorator('attrib_3_string', {
                initialValue: filter.attrib_3_string,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem {...formItemLayout} label="唛头">
              {getFieldDecorator('attrib_4_string', {
                initialValue: filter.attrib_4_string,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>}
      </Form>
    );
  }
}
