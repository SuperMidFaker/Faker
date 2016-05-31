import React, { PropTypes } from 'react';
import { Form, Select } from 'ant-ui';
const FormItem = Form.Item;
const Option = Select.Option;

export default function AutoCompletionSelectItem(props) {
  const {
    labelName, field, colSpan, placeholder, required, rules,
    formhoc: { getFieldError, getFieldProps }, optionData,
    optionField, optionKey, optionValue, allowClear,
    onSelect, onChange,
  } = props;
  const getComboFilter = (input, option) =>
    option.props.datalink[optionField].toLowerCase().indexOf(input.toLowerCase()) !== -1;
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
        {...getFieldProps(field, { onChange, rules })} onSelect={handleComboSelect}
        allowClear={allowClear}
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
    optionKey: PropTypes.string
};
