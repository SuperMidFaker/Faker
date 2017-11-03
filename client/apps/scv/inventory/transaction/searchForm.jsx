import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Radio, Button, Form, Input, Select, Checkbox } from 'antd';
import { checkDisplayColumn } from 'common/reducers/scvInventoryStock';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;
const Option = Select.Option;
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
export default class InventoryTransactionSearchForm extends React.Component {
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
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.onSearch(values, this.state.lot_property_checked, this.state.lot_property);
      }
    });
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
    this.props.form.setFieldsValue({ [this.state.lot_property]: null });
    this.setState({ lot_property_checked: checked, lot_property: null });
    if (!checked) {
      this.props.checkDisplayColumn(this.state.lot_property, false);
      this.props.checkDisplayColumn('start_date', true);
      this.props.checkDisplayColumn('end_date', true);
      this.props.checkDisplayColumn('pre_stock', true);
      this.props.checkDisplayColumn('post_stock', true);
    } else {
      this.props.checkDisplayColumn('start_date', false);
      this.props.checkDisplayColumn('end_date', false);
      this.props.checkDisplayColumn('pre_stock', false);
      this.props.checkDisplayColumn('post_stock', false);
    }
  }
  handleLotRadioChange = (ev) => {
    this.props.form.setFieldsValue({ [this.state.lot_property]: null });
    this.setState({ lot_property: ev.target.value });
    if (ev.target.value === 'lot_no') {
      this.props.checkDisplayColumn('lot_no', true);
      this.props.checkDisplayColumn('serial_no', false);
    } else {
      this.props.checkDisplayColumn('lot_no', false);
      this.props.checkDisplayColumn('serial_no', true);
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
        <FormItem label={<CheckboxLabel field="lot_property" label={this.msg('transTracking')}
          checked={this.state.lot_property_checked} onChange={this.handleLotPropertyCheck}
        />}
        >
          <RadioGroup onChange={this.handleLotRadioChange} value={this.state.lot_property}
            disabled={!this.state.lot_property_checked}
          >
            <RadioButton value="lot_no">{this.msg('trackingByLotNo')}</RadioButton>
            <RadioButton value="serial_no">{this.msg('trackingBySerialNo')}</RadioButton>
          </RadioGroup>
        </FormItem>
        {
          this.state.lot_property === 'lot_no' &&
          <FormItem>
            {getFieldDecorator('lot_no', { rules: [{ required: true, message: this.msg('lotNoRequired') }] })(<Input placeholder={this.msg('lotNo')} />)}
          </FormItem>
        }
        {
          this.state.lot_property === 'serial_no' &&
          <FormItem>
            {getFieldDecorator('serial_no', { rules: [{ required: true, message: this.msg('serialNoRequired') }] })(<Input placeholder={this.msg('serialNo')} />)}
          </FormItem>
        }
        <FormItem>
          <Button type="primary" onClick={this.handleStockSearch} style={{ width: '100%' }}>{this.msg('query')}</Button>
        </FormItem>
      </Form>
    );
  }
}
