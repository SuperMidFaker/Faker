import React, { PropTypes } from 'react';
import { Form, Select } from 'ant-ui';
const FormItem = Form.Item;
const Option = Select.Option;

export default function AutoCompletionSelectItem(props) {
  const {
    labelName, field, colSpan, placeholder, required, rules,
    formhoc: { getFieldError, getFieldProps }, optionData,
    optionField, optionKey, optionValue, filterFields = [],
    allowClear, onSelect, onChange, initialValue, getValueFromEvent,
  } = props;
  const getComboFilter = (input, option) => {
    const optFields = [ ...filterFields, optionField ]; // fallback to optionField
    for (let i = 0; i < optFields.length; i++) {
      const fld = optFields[i];
      const found = option.props.datalink[fld].toLowerCase().indexOf(input.toLowerCase()) !== -1;
      if (found) {
        return true;
      }
    }
    return false;
  };
  const handleComboSelect = (value) => {
    if (onSelect) {
      onSelect(value);
    }
  };
  return (
    <FormItem label={labelName} labelCol={{span: colSpan}} required={required}
      wrapperCol={{span: 24 - colSpan}} help={getFieldError(field)}
    >
      <Select combobox filterOption={getComboFilter} placeholder={placeholder}
        {...getFieldProps(field, { onChange, rules, initialValue, getValueFromEvent })}
        onSelect={handleComboSelect} allowClear={allowClear}
      >
        {
          optionData.map(
            od =>
            <Option datalink={od} value={od[optionValue]} key={od[optionKey]}>
            {od[optionField]}
            </Option>
          )
        }
      </Select>
    </FormItem>
  );
}

AutoCompletionSelectItem.propTypes = {
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
};
