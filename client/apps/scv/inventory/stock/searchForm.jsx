import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Form, Input, Select } from 'antd';
import { formatMsg } from './message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;
const InputGroup = Input.Group;

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
    const { form: { getFieldDecorator }, searchOption: { categories } } = this.props;
    return (
      <Form vertical style={{ padding: 16 }}>
        <FormItem label="SKU">
          {getFieldDecorator('sku_no')(<Input />)}
        </FormItem>
        <FormItem label="商品">
          {getFieldDecorator('product_no')(<Input placeholder="料号/品名" />)}
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
        <FormItem label="批次号">
          {getFieldDecorator('lot_no')(<Input />)}
        </FormItem>
        <FormItem label="序列号">
          {getFieldDecorator('serial_no')(<Input />)}
        </FormItem>
        <FormItem label="单价">
          <InputGroup compact>
            <Input style={{ width: '50%' }} placeholder="从" />
            <Input style={{ width: '50%' }} placeholder="到" />
          </InputGroup>
        </FormItem>
        <FormItem>
          <Button type="primary" size="large" onClick={this.handleStockSearch} style={{ width: '100%' }}>查询</Button>
        </FormItem>
      </Form>
    );
  }
}
