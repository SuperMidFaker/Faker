import React, { PropTypes } from 'react';
import { Form, Input } from 'ant-ui';
const FormItem = Form.Item;

export default function InputItem(props) {
  const {
    labelName, field, colSpan, placeholder, required, rules, fieldProps,
    addonBefore, addonAfter, disabled = false, hasFeedback = true,
    type = 'text', formhoc: { getFieldProps }
  } = props;
  return (
    <FormItem label={labelName} labelCol={{span: colSpan}} wrapperCol={{span: 24 - colSpan}}
      hasFeedback={hasFeedback} required={required}
    >
      <Input type={type} placeholder={placeholder} addonBefore={addonBefore}
        disabled={disabled} addonAfter={addonAfter}
        {...getFieldProps(field, {rules, ...fieldProps})}
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
    hasFeedback: PropTypes.bool,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    rules: PropTypes.array,
    addonBefore: PropTypes.string,
    addonAfter: PropTypes.string,
    fieldProps: PropTypes.object
};
