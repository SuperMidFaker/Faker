import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Form, Input, Select, Radio, Row, Col, Icon, DatePicker } from 'antd';
import { checkOwnerColumn, checkProductColumn, checkLocationColumn, checkProAndLocation, changeSearchType, clearList } from 'common/reducers/cwmInventoryStock';
import { loadLocations } from 'common/reducers/cwmWarehouse';
import { formatMsg } from '../message.i18n';
import { CWM_STOCK_SEARCH_TYPE } from 'common/constants';
import LocationSelect from 'client/apps/cwm/common/locationSelect';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
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
  { checkOwnerColumn, checkProductColumn, checkLocationColumn, checkProAndLocation, changeSearchType, clearList, loadLocations }
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
  componentWillMount() {
    this.props.loadLocations(this.props.defaultWhse.code, '', this.props.tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultWhse.code !== this.props.defaultWhse.code) {
      this.props.loadLocations(nextProps.defaultWhse.code, '', nextProps.tenantId);
    }
  }
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
  checkProAndLocation = () => {
    this.props.checkProAndLocation();
  }
  msg = formatMsg(this.props.intl);
  render() {
    const { form: { getFieldDecorator }, owners, filter } = this.props;
    const formItemLayout = {
      labelCol: { span: 5 },
      wrapperCol: { span: 19 },
    };
    return (
      <Form className="form-layout-compact">
        <Row gutter={16}>
          <Col span={6}>
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
          <Col span={6}>
            <FormItem {...formItemLayout} label="货品">
              {getFieldDecorator('product_no', {
                initialValue: filter.product_no,
              })(<Input placeholder="货号" />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem>
              {getFieldDecorator('search_type', {
                initialValue: filter.search_type,
              })(
                <RadioGroup onChange={this.onChange}>
                  <RadioButton value={CWM_STOCK_SEARCH_TYPE[1].value} onClick={this.checkProduct}>{CWM_STOCK_SEARCH_TYPE[1].text}</RadioButton>
                  <RadioButton value={CWM_STOCK_SEARCH_TYPE[0].value} onClick={this.checkOwners}>{CWM_STOCK_SEARCH_TYPE[0].text}</RadioButton>
                  <RadioButton value={CWM_STOCK_SEARCH_TYPE[3].value} onClick={this.checkProAndLocation}>{CWM_STOCK_SEARCH_TYPE[3].text}</RadioButton>
                  <RadioButton value={CWM_STOCK_SEARCH_TYPE[2].value} onClick={this.checkLocation}>{CWM_STOCK_SEARCH_TYPE[2].text}</RadioButton>
                </RadioGroup>
          )}
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
          <Col span={6}>
            <FormItem {...formItemLayout} label="库位">
              {getFieldDecorator('whse_location', {
                initialValue: filter.whse_location,
              })(
                <LocationSelect size="large" />
          )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem {...formItemLayout} label="入库日期" >
              <RangePicker />
            </FormItem>
          </Col>


        </Row>}
      </Form>
    );
  }
}