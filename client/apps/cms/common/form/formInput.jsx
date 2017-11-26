import React from 'react';
import PropTypes from 'prop-types';
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
    getFieldDecorator: PropTypes.func.isRequired,
    formData: PropTypes.object,
  }

  render() {
    const {
      outercol, label, col, field, required, hasFeedback, type = 'text', disabled,
      placeholder, getFieldDecorator, rules, addonBefore, addonAfter, fieldProps, formData = {},
    } = this.props;
    const initialValue = formData && formData[field] && String(formData[field]);
    return (
      <Col span={outercol}>
        <FormItem labelCol={{ span: col }} wrapperCol={{ span: 24 - col }} colon={false} label={label}
          hasFeedback={hasFeedback} required={required}
        >
          {disabled ?
            <Input type={type} disabled value={initialValue}
              addonBefore={addonBefore} addonAfter={addonAfter}
            /> :
            getFieldDecorator(field, { rules, initialValue, ...fieldProps })(
              <Input type={type} disabled={disabled} placeholder={placeholder}
                addonBefore={addonBefore} addonAfter={addonAfter}
              />)}
        </FormItem>
      </Col>
    );
  }
}
