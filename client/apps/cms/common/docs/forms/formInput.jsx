import React, { PropTypes } from 'react';
import { Col, Form, Input } from 'antd';
const FormItem = Form.Item;

export default class FormInput extends React.Component {
  static propTypes = {
    outercol: PropTypes.number,
    label: PropTypes.string,
    col: PropTypes.number,
    field: PropTypes.string,
    type: PropTypes.string,
    placeholder: PropTypes.string,
    hasFeedback: PropTypes.bool,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    rules: PropTypes.array,
    addonBefore: PropTypes.string,
    addonAfter: PropTypes.string,
    fieldProps: PropTypes.object,
    getFieldProps: PropTypes.func.isRequired,
    formData: PropTypes.object,
  }

  render() {
    const {
      outercol, label, col, field, required, hasFeedback, type = 'text', disabled,
      placeholder, getFieldProps, rules, fieldProps, formData = {},
    } = this.props;
    return (
      <Col span={outercol}>
        <FormItem labelCol={{ span: col }} wrapperCol={{ span: 24 - col }} label={label}
          hasFeedback={hasFeedback} required={required}
        >
          <Input type={type} disabled={disabled} placeholder={placeholder}
            {...getFieldProps(field, { rules, initialValue:
                formData && formData[field] && String(formData[field]),
              ...fieldProps })}
          />
        </FormItem>
      </Col>
    );
  }
}
