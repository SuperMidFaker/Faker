import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Form, Input, Checkbox } from 'antd';
import { checkOwnerColumn, checkProductColumn, checkLocationColumn } from 'common/reducers/scvInventoryStock';
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
  { checkOwnerColumn, checkProductColumn, checkLocationColumn }
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
    this.props.onSearch(formData);
  }
  msg = formatMsg(this.props.intl);
  handleOwnerCheck = (field, checked) => {
    if (!this.props.displayedColumns.product_no) {
      this.props.checkOwnerColumn(field, checked);
    }
    if (!checked) {
      this.props.form.setFieldsValue({ [field]: null });
    }
  }
  handleProductCheck = (field, checked) => {
    this.props.checkProductColumn(checked);
    if (!checked) {
      this.props.form.setFieldsValue({ [field]: null });
    }
  }
  handleLocationCheck = (field, checked) => {
    this.props.checkLocationColumn(field, checked);
    if (!checked) {
      this.props.form.setFieldsValue({ [field]: null });
    }
  }
  render() {
    const { form: { getFieldDecorator }, displayedColumns } = this.props;
    return (
      <Form layout="vertical" className="left-sider-panel">
        <FormItem label={
          <CheckboxLabel field="owner" checked={displayedColumns.owner}
            label={this.msg('owner')} onChange={this.handleOwnerCheck}
          />}
        >
          {getFieldDecorator('owner')(<Input placeholder="货主名称" disabled={!displayedColumns.owner} />)}
        </FormItem>
        <FormItem label={
          <CheckboxLabel field="product_no" checked={displayedColumns.product_no}
            label={this.msg('product')} onChange={this.handleProductCheck}
          />}
        >
          {getFieldDecorator('product_no')(<Input placeholder="货号或者sku" disabled={!displayedColumns.product_no} />)}
        </FormItem>
        <FormItem label={<CheckboxLabel field="whse_location" checked={displayedColumns.whse_location}
          label={this.msg('whseLocation')} onChange={this.handleLocationCheck}
        />}
        >
          {getFieldDecorator('whse_location')(<Input placeholder="库位号" disabled={!displayedColumns.whse_location} />)}
        </FormItem>
        <FormItem>
          <Button type="primary" size="large" onClick={this.handleStockSearch} style={{ width: '100%' }}>{this.msg('query')}</Button>
        </FormItem>
      </Form>
    );
  }
}
