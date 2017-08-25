import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Form, Input, Select, Row, Col, Icon, DatePicker } from 'antd';
import { checkOwnerColumn, checkProductColumn, checkLocationColumn, checkProductLocation, changeSearchType, clearList } from 'common/reducers/cwmInventoryStock';
import LocationSelect from 'client/apps/cwm/common/locationSelect';

const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;

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
            <FormItem {...formItemLayout} label="收货单位">
              {getFieldDecorator('owner', { initialValue: filter.owner,
                rules: [{ required: true, message: '收货单位必选' }],
              })(
                <Select placeholder="请选择收货单位" showSearch optionFilterProp="children" allowClear>
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
                <Select placeholder="请选择报关申请类型" defaultValue="0">
                  <Option value="0" key="0">普通报关申请单</Option>
                  <Option value="1" key="1">跨关区报关申请单</Option>
                  <Option value="2" key="2">保展报关申请单</Option>
                </Select>)}
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
            <FormItem {...formItemLayout} label="序列号">
              {getFieldDecorator('serial_no', {
                initialValue: filter.serial_no,
              })(<Input placeholder="序列号" />)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem {...formItemLayout} label="追踪ID">
              {getFieldDecorator('trace_id', {
                initialValue: filter.trace_id,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem {...formItemLayout} label="库位">
              {getFieldDecorator('location', {
                initialValue: filter.location,
              })(<LocationSelect size="large" />)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem {...formItemLayout} label="库别">
              {getFieldDecorator('virtual_whse', {
                initialValue: filter.virtual_whse,
              })(<Input placeholder="库别" />)}
            </FormItem>
          </Col>
        </Row>}
        {this.state.expandForm && <Row gutter={16}>
          <Col span={5}>
            <FormItem {...formItemLayout} label="扩展属性1">
              {getFieldDecorator('attrib_1_string', {
                initialValue: filter.attrib_1_string,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem {...formItemLayout} label="扩展属性2">
              {getFieldDecorator('attrib_2_string', {
                initialValue: filter.attrib_2_string,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem {...formItemLayout} label="扩展属性3">
              {getFieldDecorator('attrib_3_string', {
                initialValue: filter.attrib_3_string,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem {...formItemLayout} label="扩展属性4">
              {getFieldDecorator('attrib_4_string', {
                initialValue: filter.attrib_4_string,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>}
        {this.state.expandForm && <Row gutter={16}>
          <Col span={5}>
            <FormItem {...formItemLayout} label="扩展属性5">
              {getFieldDecorator('attrib_5_string', {
                initialValue: filter.attrib_5_string,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem {...formItemLayout} label="扩展属性6">
              {getFieldDecorator('attrib_6_string', {
                initialValue: filter.attrib_6_string,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem {...formItemLayout} label="扩展属性7">
              {getFieldDecorator('attrib_7_date', {
                initialValue: filter.attrib_7_date,
              })(<RangePicker />)}
            </FormItem>
          </Col>
          <Col span={5} offset={1}>
            <FormItem {...formItemLayout} label="扩展属性8">
              {getFieldDecorator('attrib_8_date', {
                initialValue: filter.attrib_8_date,
              })(<RangePicker />)}
            </FormItem>
          </Col>
        </Row>}
      </Form>
    );
  }
}
