import React, { PropTypes } from 'react';
import { Form, Input } from 'antd';

const FormItem = Form.Item;

export default class InputItem extends React.Component {
  static propTypes = {
    labelName: PropTypes.oneOfType([PropTypes.string, React.Element]),
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
    fieldProps: PropTypes.object,
    readOnly: PropTypes.bool,
    colon: PropTypes.bool,
  }
  render() {
    const {
      labelName, field, colSpan, placeholder, required, rules, fieldProps,
      addonBefore, addonAfter, disabled = false, hasFeedback = false,
      type = 'text', formhoc: { getFieldProps }, readOnly, colon,
    } = this.props;
    const hocFieldProps = getFieldProps(field, { rules, ...fieldProps });
    return (
      <FormItem label={labelName} labelCol={{ span: colSpan }} wrapperCol={{ span: 24 - colSpan }}
        hasFeedback={hasFeedback} required={required} colon={colon}
      >
        <Input type={type} placeholder={placeholder} addonBefore={addonBefore}
          disabled={disabled} addonAfter={addonAfter} readOnly={readOnly}
          {...hocFieldProps}
        />
      </FormItem>
    );
  }
}

