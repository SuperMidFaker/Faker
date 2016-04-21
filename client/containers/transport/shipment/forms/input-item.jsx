import React, { PropTypes } from 'react';
import { Form, Input } from 'ant-ui';
const FormItem = Form.Item;

export default function InputItem(props) {
  const {
    labelName, field, colSpan, placeholder, required, rules, fieldProps,
    addonBefore, addonAfter,
    type = 'text', formhoc: { getFieldProps, getFieldError }
  } = props;
  return (
    <FormItem label={labelName} labelCol={{span: colSpan}} wrapperCol={{span: 24 - colSpan}}
      help={rules && getFieldError(field)} hasFeedback required={required}
    >
      <Input type={type} placeholder={placeholder} addonBefore={addonBefore}
        addonAfter={addonAfter} {...getFieldProps(field, {rules, ...fieldProps})}
      />
    </FormItem>
  );
}

InputItem.propTypes = {
    labelName: PropTypes.string.isRequired,
    field: PropTypes.string.isRequired,
    colSpan: PropTypes.number.isRequired,
    formhoc: PropTypes.object.isRequired,
    type: PropTypes.string,
    placeholder: PropTypes.string,
    required: PropTypes.bool,
    rules: PropTypes.array,
    fieldProps: PropTypes.object
};
