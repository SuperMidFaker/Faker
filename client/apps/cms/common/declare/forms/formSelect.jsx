import React, { PropTypes } from 'react';
import { Col, Form, Select } from 'ant-ui';
const FormItem = Form.Item;
const Option = Select.Option;

export default function FormSelect(props) {
  const {
    outercol, label, col, field, required, disabled,
    getFieldProps, rules, fieldProps, formData, options = [],
  } = props;
  return (
    <Col span={outercol}>
      <FormItem labelCol={{ span: col }} wrapperCol={{ span: 24 - col }} label={label}
        required={required}>
        <Select disabled={disabled} showSearch
          {...getFieldProps(field, { rules, initialValue: formData && formData[field],
          ...fieldProps })}>
          {
            options.map(opt => <Option key={opt.value}>{opt.text}</Option>)
          }
        </Select>
      </FormItem>
    </Col>
  );
}

FormSelect.propTypes = {
  outercol: PropTypes.number,
  label: PropTypes.string,
  col: PropTypes.number,
  field: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  rules: PropTypes.array,
  fieldProps: PropTypes.object,
  getFieldProps: PropTypes.func.isRequired,
  formData: PropTypes.object,
  options: PropTypes.array,
};
