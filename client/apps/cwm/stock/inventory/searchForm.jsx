import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Form, Input, Checkbox } from 'antd';
import { checkDisplayColumn } from 'common/reducers/scvInventoryStock';
import { formatMsg } from '../message.i18n';

const FormItem = Form.Item;

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
    const { form: { getFieldDecorator }, displayedColumns } = this.props;
    return (
      <Form layout="vertical" className="left-sider-panel">
        <FormItem label={
          <CheckboxLabel field="owner" checked={displayedColumns.owner}
            label={this.msg('owner')} onChange={this.handleColumnCheck}
          />}
        >
          {getFieldDecorator('owner')(<Input />)}
        </FormItem>
        <FormItem label={
          <CheckboxLabel field="product_no" checked={displayedColumns.product_no}
            label={this.msg('product')} onChange={this.handleColumnCheck}
          />}
        >
          {getFieldDecorator('product_no')(<Input placeholder={this.msg('productHint')} disabled={!displayedColumns.product_no} />)}
        </FormItem>
        <FormItem label={<CheckboxLabel field="whse_location" checked={displayedColumns.whse_location}
          label={this.msg('whseLocation')} onChange={this.handleColumnCheck}
        />}
        >
          {getFieldDecorator('whse_location')(<Input />)}
        </FormItem>
        <FormItem>
          <Button type="primary" size="large" onClick={this.handleStockSearch} style={{ width: '100%' }}>{this.msg('query')}</Button>
        </FormItem>
      </Form>
    );
  }
}
