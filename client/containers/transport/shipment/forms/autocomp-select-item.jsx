import React, { PropTypes } from 'react';
import { Form, Select } from 'ant-ui';
const FormItem = Form.Item;
const Option = Select.Option;

export default function AutoCompletionSelectItem(props) {
  const {
    labelName, field, colSpan, placeholder, required, rules,
    formhoc: { getFieldError, getFieldProps }, optionData,
    optionField, optionKey
  } = props;
  const getComboFilter = (input, option) =>
    option.props.datalink[optionField].toLowerCase().indexOf(input.toLowerCase()) !== -1;
  const handleComboChange = (value, label) => {
    console.log('value', value, 'label', label);
  };
  const handleComboSelect = (value) => {
    console.log('value', value);
  };
  return (
    <FormItem label={labelName} labelCol={{span: colSpan}} required={required}
      wrapperCol={{span: 24 - colSpan}} help={getFieldError(field)}
    >
      <Select combobox filterOption={getComboFilter} placeholder={placeholder}
        value="aa" onChange={handleComboChange} {...getFieldProps(field, { rules })}
        onSelect={handleComboSelect}
      >
        {
          optionData.map(
            od =>
            <Option datalink={od} value={od[optionKey]} key={od[optionKey]}>
            {od[optionField]}
            </Option>
          )
        }
      </Select>
    </FormItem>
  );
}

AutoCompletionSelectItem.propTypes = {
    labelName: PropTypes.string.isRequired,
    field: PropTypes.string.isRequired,
    colSpan: PropTypes.number.isRequired,
    formhoc: PropTypes.object,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    rules: PropTypes.array,
    optionData: PropTypes.array,
    optionField: PropTypes.string,
    optionKey: PropTypes.string
};
