import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'antd';

const FormItem = Form.Item;

export default class InputItem extends React.Component {
  static propTypes = {
    labelName: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
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
      labelName, field, placeholder, required, rules, fieldProps,
      addonBefore, addonAfter, disabled = false, hasFeedback = false,
      type = 'text', formhoc: { getFieldDecorator }, readOnly, colon,
    } = this.props;
    const fieldHOC = getFieldDecorator(field, { rules, ...fieldProps });
    return (
      <FormItem label={labelName}
        hasFeedback={hasFeedback} required={required} colon={colon}
      >
        {
          fieldHOC(<Input type={type} placeholder={placeholder} addonBefore={addonBefore}
            disabled={disabled} addonAfter={addonAfter} readOnly={readOnly}
          />)
        }
      </FormItem>
    );
  }
}

