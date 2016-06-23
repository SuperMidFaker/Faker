import React, { PropTypes } from 'react';
import { Col, Form, DatePicker } from 'ant-ui';
const FormItem = Form.Item;

export default function FormDatePicker(props) {
  const {
    outercol, label, col, field, required, disabled,
    getFieldProps, rules, fieldProps, formData,
  } = props;
  let initialValue;
  if (formData && formData[field]) {
    if (typeof formData[field] === 'string') {
      initialValue = new Date(formData[field]);
    } else if (Object.prototype.toString.call(formData[field]) === '[object Date]') {
      initialValue = formData[field];
    }
  }
  return (
    <Col span={outercol}>
      <FormItem labelCol={{ span: col }} wrapperCol={{ span: 24 - col }} label={label}
        required={required}>
        <DatePicker disabled={disabled}
          {...getFieldProps(field, { rules, initialValue,
          ...fieldProps })} />
      </FormItem>
    </Col>
  );
}

FormDatePicker.propTypes = {
  outercol: PropTypes.number.isRequired,
  label: PropTypes.string,
  col: PropTypes.number.isRequired,
  field: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  rules: PropTypes.array,
  fieldProps: PropTypes.object,
  getFieldProps: PropTypes.func.isRequired,
  formData: PropTypes.object,
};
