import React from 'react';
import PropTypes from 'prop-types';
import { Form, Select } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

export default class AutoCompletionSelectItem extends React.Component {
  static propTypes = {
    labelName: PropTypes.string,
    field: PropTypes.string.isRequired,
    colSpan: PropTypes.number,
    formhoc: PropTypes.object,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    allowClear: PropTypes.bool,
    rules: PropTypes.array,
    onSelect: PropTypes.func,
    optionData: PropTypes.array,
    optionField: PropTypes.string,
    optionValue: PropTypes.string,
    optionKey: PropTypes.string,
    filterFields: PropTypes.array, // 优先筛选判断的字段名称列表
    initialValue: PropTypes.string,
    getValueFromEvent: PropTypes.func,
  }
  getComboFilter = (input, option) => {
    const { filterFields = [], optionField } = this.props;
    const optFields = [...filterFields, optionField]; // fallback to optionField
    for (let i = 0; i < optFields.length; i++) {
      const fld = optFields[i];
      const found = option.props.datalink[fld].toLowerCase().indexOf(input.toLowerCase()) !== -1;
      if (found) {
        return true;
      }
    }
    return false;
  }
  handleComboSelect= (value) => {
    if (this.props.onSelect) {
      this.props.onSelect(value);
    }
  }
  render() {
    const {
      labelName, field, colSpan, placeholder, required, rules,
      formhoc: { getFieldError, getFieldDecorator }, optionData,
      optionField, optionKey, optionValue,
      allowClear, onChange, initialValue, getValueFromEvent,
    } = this.props;
    return (
      <FormItem label={labelName} labelCol={{ span: colSpan }} required={required}
        wrapperCol={{ span: 24 - colSpan }} help={getFieldError(field)}
      >
        {getFieldDecorator(field, {
 onChange,
          rules,
          initialValue: initialValue || '',
          getValueFromEvent,
})(<Select
  mode="combobox"
  filterOption={this.getComboFilter}
  placeholder={placeholder}
  onSelect={this.handleComboSelect}
  allowClear={allowClear}
>
  {
          optionData.map(od =>
                (<Option datalink={od} value={od[optionValue]} key={od[optionKey]}>
                  {od[optionField]}
                </Option>))
        }
</Select>)}
      </FormItem>);
  }
}

