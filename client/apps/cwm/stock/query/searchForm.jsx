import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Form, Input, Select, Radio, Row } from 'antd';
import { checkOwnerColumn, checkProductColumn, checkLocationColumn, checkProAndLocation, changeSearchType, clearList } from 'common/reducers/cwmInventoryStock';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    searchOption: state.cwmInventoryStock.searchOption,
    displayedColumns: state.cwmInventoryStock.displayedColumns,
    filter: state.cwmInventoryStock.listFilter,
    owners: state.cwmContext.whseAttrs.owners,
  }),
  { checkOwnerColumn, checkProductColumn, checkLocationColumn, checkProAndLocation, changeSearchType, clearList }
)
@Form.create()
export default class StockQueryForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    searchOption: PropTypes.shape({
      categories: PropTypes.arrayOf(PropTypes.shape({ category_no: PropTypes.string })),
    }),
    displayedColumns: PropTypes.shape({ product_no: PropTypes.bool }),
    onSearch: PropTypes.func.isRequired,
  }
  onChange = (e) => {
    this.props.changeSearchType(e.target.value);
    this.props.clearList();
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
    return (
      <Form layout="vertical" className="left-sider-panel">
        <FormItem label="货主">
          {getFieldDecorator('owner', {
            initialValue: filter.owner,
            rules: [{
              required: filter.search_type === 1,
              message: 'Please select your owner',
            }],
          })(
            <Select showSearch optionFilterProp="children" onChange={this.handleOwnerChange}
              dropdownMatchSelectWidth={false} dropdownStyle={{ width: 360 }}
            >
              <Option key="all" value="">全部货主</Option>
              {owners.map(owner => (<Option value={owner.id} key={owner.name}>{owner.name}</Option>))}
            </Select>
          )}
        </FormItem>
        <FormItem label="货品">
          {getFieldDecorator('product_no', {
            initialValue: filter.product_no,
            rules: [{
              required: filter.search_type === 2 || filter.search_type === 4,
              message: 'Please input your product_no',
            }],
          })(<Input placeholder="货号" />)}
        </FormItem>
        <FormItem label="库位">
          {getFieldDecorator('whse_location', {
            initialValue: filter.whse_location,
            rules: [{
              required: filter.search_type === 3 || filter.search_type === 4,
              message: 'Please input your whse_location',
            }],
          })(<Input placeholder="库位号" />)}
        </FormItem>
        <FormItem>
          {getFieldDecorator('search_type', {
            initialValue: filter.search_type,
          })(
            <RadioGroup onChange={this.onChange}>
              <Row>
                <Radio value={1} onClick={this.checkOwners}>按货主查询</Radio>
                <Radio value={2} onClick={this.checkProduct}>按产品查询</Radio>
              </Row>
              <Row>
                <Radio value={3} onClick={this.checkLocation}>按库位查询</Radio>
                <Radio value={4} onClick={this.checkProAndLocation}>按产品/库位查询</Radio>
              </Row>
            </RadioGroup>
          )}
        </FormItem>
        <FormItem>
          <Button type="primary" size="large" onClick={this.handleStockSearch} style={{ width: '100%' }}>{this.msg('query')}</Button>
        </FormItem>
      </Form>
    );
  }
}
