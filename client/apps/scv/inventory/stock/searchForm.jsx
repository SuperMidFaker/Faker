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
      <Form vertical className="left-sider-panel">
        <FormItem label={this.msg('sku')}>
          {getFieldDecorator('sku_no')(<Input />)}
        </FormItem>
        <FormItem label={this.msg('product')}>
          {getFieldDecorator('product_no')(<Input placeholder={this.msg('productHint')} />)}
        </FormItem>
        <FormItem label={this.msg('category')}>
          {getFieldDecorator('product_category')(
            <Select allowClear
              showSearch
              placeholder={this.msg('categoryHint')}
              optionFilterProp="children"
              filterOption={(input, option) => option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {
                categories.map(categ => <Option key={categ.id} value={categ.category_no}>{categ.category_no}</Option>)
              }
            </Select>)}
        </FormItem>
        <FormItem label={this.msg('lot')}>
          {getFieldDecorator('lot_no')(<Input />)}
        </FormItem>
        <FormItem label={this.msg('serial')}>
          {getFieldDecorator('serial_no')(<Input />)}
        </FormItem>
        <FormItem label={this.msg('unitPrice')}>
          <InputGroup compact>
            <Input style={{ width: '50%' }} placeholder={this.msg('priceFrom')} />
            <Input style={{ width: '50%' }} placeholder={this.msg('priceTo')} />
          </InputGroup>
        </FormItem>
        <FormItem>
          <Button type="primary" size="large" onClick={this.handleStockSearch} style={{ width: '100%' }}>{this.msg('query')}</Button>
        </FormItem>
      </Form>
    );
  }
}
