import React, { PropTypes } from 'react';
import moment from 'moment';
import { Col, Form, DatePicker } from 'antd';

const FormItem = Form.Item;

export default class FormDatePicker extends React.Component {
  static propTypes = {
    outercol: PropTypes.number.isRequired,
    label: PropTypes.string,
    col: PropTypes.number.isRequired,
    field: PropTypes.string,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    rules: PropTypes.array,
    fieldProps: PropTypes.object,
    getFieldDecorator: PropTypes.func.isRequired,
    formData: PropTypes.object,
  }

  render() {
    const {
      outercol, label, col, field, required, disabled,
      getFieldDecorator, rules, fieldProps, formData,
    } = this.props;
    let initialValue;
    if (formData && formData[field]) {
      initialValue = moment(formData[field]);
    }
    return (
      <Col span={outercol}>
        <FormItem labelCol={{ span: col }} wrapperCol={{ span: 24 - col }} label={label}
          required={required}
        >
          {getFieldDecorator(field, { rules, initialValue, ...fieldProps })(<DatePicker disabled={disabled} style={{ width: '100%' }} />)}
        </FormItem>
      </Col>
    );
  }
}
