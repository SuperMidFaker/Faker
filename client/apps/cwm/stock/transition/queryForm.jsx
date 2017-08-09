import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Form, Input, Select, Row, Col, Icon, DatePicker, Switch } from 'antd';
import { checkOwnerColumn, checkProductColumn, checkLocationColumn, checkProductLocation, changeSearchType, clearList } from 'common/reducers/cwmInventoryStock';
import { formatMsg } from '../message.i18n';
import LocationSelect from 'client/apps/cwm/common/locationSelect';

const FormItem = Form.Item;
const Option = Select.Option;
const { RangePicker } = DatePicker;

@injectIntl
@connect(
  state => ({
    searchOption: state.cwmInventoryStock.searchOption,
    displayedColumns: state.cwmInventoryStock.displayedColumns,
    filter: state.cwmInventoryStock.listFilter,
    owners: state.cwmContext.whseAttrs.owners,
    defaultWhse: state.cwmContext.defaultWhse,
    tenantId: state.account.tenantId,
  }),
  { checkOwnerColumn, checkProductColumn, checkLocationColumn, checkProductLocation, changeSearchType, clearList }
)
@Form.create()
export default class QueryForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    searchOption: PropTypes.shape({
      categories: PropTypes.arrayOf(PropTypes.shape({ category_no: PropTypes.string })),
    }),
    displayedColumns: PropTypes.shape({ product_no: PropTypes.bool }),
    onSearch: PropTypes.func.isRequired,
  }
  state = {
    expandForm: false,
  };
  onChange = (e) => {
    this.props.changeSearchType(e.target.value);
    this.props.clearList();
  }
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
  checkOwners = () => {
    this.props.checkOwnerColumn();
  }
  checkProduct = () => {
    this.props.checkProductColumn();
  }
  checkLocation = () => {
    this.props.checkLocationColumn();
  }
  checkProductLocation = () => {
    this.props.checkProductLocation();
  }
  msg = formatMsg(this.props.intl);
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
            <FormItem {...formItemLayout} label="货主">
              {getFieldDecorator('owner', {
                initialValue: filter.owner,
              })(
                <Select showSearch optionFilterProp="children" onChange={this.handleOwnerChange} allowClear >
                  {owners.map(owner => (<Option value={owner.id} key={owner.id}>{owner.name}</Option>))}
                </Select>
          )}
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem {...formItemLayout} label="货品">
              {getFieldDecorator('product_no', {
                initialValue: filter.product_no,
              })(<Input placeholder="商品货号/SKU" />)}
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem {...formItemLayout} label="入库单号">
              <Input placeholder="ASN/监管入库单号" />
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem {...formItemLayout} label="批次号">
              <Input placeholder="批次号" />
            </FormItem>
          </Col>
          <Col span={4}>
            <FormItem>
              <Button type="primary" size="large" onClick={this.handleStockSearch}>{this.msg('inquiry')}</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
              <a style={{ marginLeft: 8, fontSize: 12 }} onClick={this.toggleForm}>
                {this.state.expandForm ? '收起' : '展开'} <Icon type={this.state.expandForm ? 'up' : 'down'} />
              </a>
            </FormItem>
          </Col>
        </Row>
        {this.state.expandForm && <Row gutter={16}>
          <Col span={5}>
            <FormItem {...formItemLayout} label="序列号">
              <Input placeholder="序列号" />
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem {...formItemLayout} label="追踪ID">
              <Input placeholder="" />
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem {...formItemLayout} label="库位">
              {getFieldDecorator('whse_location', {
                initialValue: filter.whse_location,
              })(
                <LocationSelect size="large" />
          )}
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem {...formItemLayout} label="库别">
              <Input placeholder="库别" />
            </FormItem>
          </Col>
        </Row>}
        {this.state.expandForm && <Row gutter={16}>
          <Col span={5}>
            <FormItem {...formItemLayout} label="包装情况">
              <Input placeholder="" />
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem {...formItemLayout} label="入库日期" >
              <RangePicker />
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem {...formItemLayout} label="失效日期" >
              <RangePicker />
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem {...formItemLayout} label="是否冻结" >
              <Switch checkedChildren="已冻结" unCheckedChildren="未冻结" />
            </FormItem>
          </Col>
        </Row>}
        {this.state.expandForm && <Row gutter={16}>
          <Col span={5}>
            <FormItem {...formItemLayout} label="扩展属性1">
              <Input />
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem {...formItemLayout} label="扩展属性2">
              <Input />
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem {...formItemLayout} label="扩展属性3">
              <Input />
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem {...formItemLayout} label="扩展属性4">
              <Input />
            </FormItem>
          </Col>
        </Row>}
        {this.state.expandForm && <Row gutter={16}>
          <Col span={5}>
            <FormItem {...formItemLayout} label="扩展属性5">
              <Input />
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem {...formItemLayout} label="扩展属性6">
              <Input />
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem {...formItemLayout} label="扩展属性7">
              <Input />
            </FormItem>
          </Col>
          <Col span={5}>
            <FormItem {...formItemLayout} label="扩展属性8">
              <Input />
            </FormItem>
          </Col>
        </Row>}
      </Form>
    );
  }
}
