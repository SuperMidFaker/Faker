import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Radio, Button, Form, Input, Select, Checkbox } from 'antd';
import { checkDisplayColumn } from 'common/reducers/scvInventoryStock';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;
const InputGroup = Input.Group;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function CheckboxLabel(props) {
  const { field, label, onChange, checked } = props;
  function handleCheck(ev) {
    onChange(field, ev.target.checked);
  }
  return (<span><Checkbox checked={checked} onChange={handleCheck} />{label}</span>);
}

CheckboxLabel.propTypes = {
  field: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  checked: PropTypes.bool.isRequired,
};

@injectIntl
@connect(
  state => ({
    searchOption: state.scvInventoryStock.searchOption,
    displayedColumns: state.scvInventoryStock.displayedColumns,
  }),
  { checkDisplayColumn }
)
@Form.create()
export default class InventoryStockSearchForm extends React.Component {
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
    lot_property_checked: false,
    lot_property: null,
  }
  handleStockSearch = (ev) => {
    ev.preventDefault();
    const formData = this.props.form.getFieldsValue();
    this.props.onSearch(formData, this.state.lot_property_checked, this.state.lot_property);
  }
  handleSearchClear = () => {
    this.props.form.resetFields();
  }
  msg = formatMsg(this.props.intl);
  handleColumnCheck = (field, checked) => {
    this.props.checkDisplayColumn(field, checked);
    if (!checked) {
      this.props.form.setFieldsValue({ [field]: null });
    }
  }
  handleLotPropertyCheck = (field, checked) => {
    this.setState({ lot_property_checked: checked, lot_property: null });
  }
  handleLotRadioChange = (ev) => {
    this.setState({ lot_property: ev.target.value });
  }
  handleFromPrice = (ev) => {
    const val = ev.target.value;
    if (!isNaN(parseFloat(val))) {
      const toprice = this.props.form.getFieldValue('price_to');
      if (isNaN(parseFloat(toprice))) {
        this.props.form.setFieldsValue({ price_to: val });
      }
    }
  }
  handleToPrice = (ev) => {
    const val = ev.target.value;
    if (!isNaN(parseFloat(val))) {
      const fromprice = this.props.form.getFieldValue('price_from');
      if (isNaN(parseFloat(fromprice))) {
        this.props.form.setFieldsValue({ price_from: val });
      }
    }
  }
  render() {
    const { form: { getFieldDecorator }, displayedColumns, searchOption: { categories } } = this.props;
    return (
      <Form layout="vertical" className="left-sider-panel">
        <FormItem label={this.msg('sku')}>
          {getFieldDecorator('sku_no')(<Input />)}
        </FormItem>
        <FormItem label={
          <CheckboxLabel field="product_no" checked={displayedColumns.product_no}
            label={this.msg('product')} onChange={this.handleColumnCheck}
          />}
        >
          {getFieldDecorator('product_no')(<Input placeholder={this.msg('productHint')} disabled={!displayedColumns.product_no} />)}
        </FormItem>
        <FormItem label={<CheckboxLabel field="product_category" checked={displayedColumns.product_category}
          label={this.msg('category')} onChange={this.handleColumnCheck}
        />}
        >
          {getFieldDecorator('product_category')(
            <Select allowClear showSearch disabled={!displayedColumns.product_category}
              placeholder={this.msg('categoryHint')} optionFilterProp="children"
              filterOption={(input, option) => option.props.value.toLowerCase().indexOf(input.toLowerCase()) >= 0}
            >
              {
                categories.map(categ => <Option key={categ.id} value={categ.category_no}>{categ.category_no}</Option>)
              }
            </Select>)}
        </FormItem>
        <FormItem label={<CheckboxLabel field="lot_property" label={this.msg('lotProperties')}
          checked={this.state.lot_property_checked} onChange={this.handleLotPropertyCheck}
        />}
        >
          <RadioGroup onChange={this.handleLotRadioChange} value={this.state.lot_property}
            disabled={!this.state.lot_property_checked}
          >
            <RadioButton value="lot_no">{this.msg('lotNo')}</RadioButton>
            <RadioButton value="serial_no">{this.msg('serialNo')}</RadioButton>
            <RadioButton value="unit_price">{this.msg('unitPrice')}</RadioButton>
          </RadioGroup>
        </FormItem>
        {
          this.state.lot_property === 'lot_no' &&
          <FormItem>
            {getFieldDecorator('lot_no')(<Input placeholder={this.msg('lotNo')} />)}
          </FormItem>
        }
        {
          this.state.lot_property === 'serial_no' &&
          <FormItem>
            {getFieldDecorator('serial_no')(<Input placeholder={this.msg('serialNo')} />)}
          </FormItem>
        }
        {
          this.state.lot_property === 'unit_price' &&
          <FormItem>
            <InputGroup compact>
              {getFieldDecorator('price_from', { onChange: this.handleFromPrice })(
                <Input style={{ width: '50%' }} placeholder={this.msg('priceFrom')} />)}
              {getFieldDecorator('price_to', { onChange: this.handleToPrice })(
                <Input style={{ width: '50%' }} placeholder={this.msg('priceTo')} />)}
            </InputGroup>
          </FormItem>
        }
        <FormItem>
          <Button type="primary" onClick={this.handleStockSearch} style={{ width: '100%' }}>{this.msg('query')}</Button>
        </FormItem>
      </Form>
    );
  }
}
