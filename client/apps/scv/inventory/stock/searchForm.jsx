import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Form, Input, Select } from 'antd';
import { formatMsg } from './message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;

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
      categories: PropTypes.arrayOf(PropTypes.shape({ categ_no: PropTypes.string })),
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
    const { form: { getFieldDecorator } } = this.props;
    return (
      <Form vertical style={{ padding: 16 }}>
        <FormItem label="商品货号">
          {getFieldDecorator('product_no')(<Input placeholder="商品货号名称" />)}
        </FormItem>
        <FormItem label="商品分类">
          {getFieldDecorator('product_category')(
            <Select
              showSearch
              placeholder="选择分类"
              optionFilterProp="children"
              filterOption={(input, option) => option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              <Option value="jack">Jack</Option>
              <Option value="lucy">Lucy</Option>
              <Option value="tom">Tom</Option>
            </Select>)}
        </FormItem>
        <FormItem label="仓库">
          {getFieldDecorator('wh_no')(
            <Select
              showSearch
              placeholder="选择仓库"
              optionFilterProp="children"
              filterOption={(input, option) => option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              <Option value="all">全部仓库</Option>
              <Option value="jack">物流大道仓库</Option>
              <Option value="lucy">希雅路仓库</Option>
              <Option value="tom">富特路仓库</Option>
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
