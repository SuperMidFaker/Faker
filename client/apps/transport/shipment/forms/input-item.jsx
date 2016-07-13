import React, { PropTypes } from 'react';
import { Form, Input } from 'antd';
const FormItem = Form.Item;

export default function InputItem(props) {
  const {
    labelName, field, colSpan, placeholder, required, rules, fieldProps,
    addonBefore, addonAfter, disabled = false, hasFeedback = false,
    type = 'text', formhoc: { getFieldProps }
  } = props;
  const hocFieldProps = getFieldProps(field, {rules, ...fieldProps});
  return (
    <FormItem label={labelName} labelCol={{span: colSpan}} wrapperCol={{span: 24 - colSpan}}
      hasFeedback={hasFeedback} required={required}
    >
      <Input type={type} placeholder={placeholder} addonBefore={addonBefore}
        disabled={disabled} addonAfter={addonAfter}
        {...hocFieldProps}
      />
    </FormItem>
  );
}

InputItem.propTypes = {
    labelName: PropTypes.string,
    colSpan: PropTypes.number,
    formhoc: PropTypes.object.isRequired,
    field: PropTypes.string,
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
