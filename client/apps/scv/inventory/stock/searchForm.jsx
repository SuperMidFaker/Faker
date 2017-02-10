import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Form, Input, Select } from 'antd';
import { formatMsg } from './message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;
const Search = Input.Search;

@injectIntl
@connect(
  state => ({
    searchOption: state.scvInventoryStock.searchOption,
  }),
)
@Form.create()
export default class InventoryStockSearchForm extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    form: PropTypes.object.isRequired,
    searchOption: PropTypes.shape({
      warehouses: PropTypes.arrayOf(PropTypes.shape({ wh_no: PropTypes.string })),
      categories: PropTypes.arrayOf(PropTypes.shape({ category_no: PropTypes.string })),
    }),
    onSearch: PropTypes.func.isRequired,
  }
  handleStockSearch = (ev) => {
    ev.preventDefault();
    const formData = this.props.form.getFieldsValue();
    this.props.onSearch(formData);
  }
  handleSearchClear = () => {
    this.props.form.resetFields();
  }
  msg = formatMsg(this.props.intl);
  render() {
    const { form: { getFieldDecorator }, searchOption: { warehouses, categories } } = this.props;
    return (
      <Form vertical style={{ padding: 16 }}>
        <FormItem label="商品货号">
          {getFieldDecorator('product_no')(<Search placeholder="商品货号信息" />)}
        </FormItem>
        <FormItem label="商品分类">
          {getFieldDecorator('product_category')(
            <Select allowClear
              showSearch
              placeholder="选择分类"
              optionFilterProp="children"
              filterOption={(input, option) => option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {
                categories.map(categ => <Option key={categ.id} value={categ.category_no}>{categ.category_no}</Option>)
              }
            </Select>)}
        </FormItem>
        <FormItem label="仓库">
          {getFieldDecorator('wh_no')(
            <Select allowClear showSearch placeholder="选择仓库">
              {
                warehouses.map(whse => <Option key={whse.id} value={whse.wh_no}>{whse.wh_name}</Option>)
              }
            </Select>)}
        </FormItem>
        <FormItem>
          <Button type="primary" onClick={this.handleStockSearch}>查询</Button>
          <Button type="ghost" onClick={this.handleSearchClear}>清除选项</Button>
        </FormItem>
      </Form>
    );
  }
}
