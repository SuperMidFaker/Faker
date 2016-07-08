import React, { PropTypes } from 'react';
import { Col, Form, Select } from 'ant-ui';
const FormItem = Form.Item;
const Option = Select.Option;

export function FormLocalSearchSelect(props) {
  const {
    outercol, label, col, field, required, disabled,
    getFieldProps, rules, fieldProps, formData, options = [],
    searchKeyFn,
  } = props;
  return (
    <Col span={outercol}>
      <FormItem labelCol={{ span: col }} wrapperCol={{ span: 24 - col }} label={label}
        required={required}>
        <Select disabled={disabled} showSearch={!!searchKeyFn} showArrow
          {...getFieldProps(field, { rules, initialValue: formData && formData[field],
          ...fieldProps })} optionFilterProp={searchKeyFn ? 'search' : undefined}
        >
          {
            options.map(opt => (<Option key={opt.value}
              search={searchKeyFn ? searchKeyFn(opt) : undefined}>
              {opt.text}</Option>))
          }
        </Select>
      </FormItem>
    </Col>
  );
}

FormLocalSearchSelect.propTypes = {
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
  searchKeyFn: PropTypes.func,
};

export function FormRemoteSearchSelect(props) {
  const {
    outercol, label, col, field, required, disabled,
    getFieldProps, rules, fieldProps, formData, options = [],
    onSearch,
  } = props;
  function handleSearch(value) {
    if (onSearch) {
      onSearch(field, value);
    }
  }
  return (
    <Col span={outercol}>
      <FormItem labelCol={{ span: col }} wrapperCol={{ span: 24 - col }} label={label}
        required={required}
      >
        <Select disabled={disabled} showSearch onSearch={handleSearch}
          {...getFieldProps(field, { rules, initialValue: formData && formData[field],
          ...fieldProps })}
        >
          {
            options.map(opt => <Option key={opt.value}>{opt.text}</Option>)
          }
        </Select>
      </FormItem>
    </Col>
  );
}

FormRemoteSearchSelect.propTypes = {
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
  onSearch: PropTypes.func,
};
