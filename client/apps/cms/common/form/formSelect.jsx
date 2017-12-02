/* eslint react/no-multi-comp: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { Col, Form, Select, Input } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

export class FormLocalSearchSelect extends React.Component {
  static propTypes = {
    outercol: PropTypes.number,
    label: PropTypes.any,
    col: PropTypes.number,
    field: PropTypes.string,
    placeholder: PropTypes.string,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    rules: PropTypes.array,
    fieldProps: PropTypes.object,
    getFieldDecorator: PropTypes.func.isRequired,
    formData: PropTypes.object,
    options: PropTypes.array,
    searchKeyFn: PropTypes.func,
  }

  render() {
    const {
      outercol, label, col, field, required, disabled,
      getFieldDecorator, rules, fieldProps, formData, options = [],
      searchKeyFn, placeholder,
    } = this.props;
    const initialValue = formData && formData[field];
    const filterOpt = options.filter(opt => opt.value === initialValue)[0];
    return (
      <Col span={outercol}>
        <FormItem labelCol={{ span: col }} wrapperCol={{ span: 24 - col }} colon={false} label={label}
          required={required}
        >
          { disabled ? <Input disabled value={filterOpt && filterOpt.text} /> :
            getFieldDecorator(field, { rules, initialValue, ...fieldProps })(
              <Select
                optionLabelProp="children"
                showSearch={!!searchKeyFn}
                showArrow
                allowClear
                optionFilterProp={searchKeyFn ? 'search' : undefined}
                placeholder={placeholder}
              >
                {
              options.map(opt => (
                <Option key={opt.value} search={searchKeyFn ? searchKeyFn(opt) : undefined}>
                  {opt.text}
                </Option>))
            }
              </Select>)}
        </FormItem>
      </Col>
    );
  }
}

export class FormRemoteSearchSelect extends React.Component {
  static propTypes = {
    outercol: PropTypes.number,
    label: PropTypes.any,
    col: PropTypes.number,
    field: PropTypes.string,
    disabled: PropTypes.bool,
    required: PropTypes.bool,
    rules: PropTypes.array,
    fieldProps: PropTypes.object,
    getFieldDecorator: PropTypes.func.isRequired,
    formData: PropTypes.object,
    options: PropTypes.array,
    onSearch: PropTypes.func,
  };

  handleSearch = (value) => {
    const { onSearch, field } = this.props;
    if (onSearch) {
      onSearch(field, value);
    }
  }
  handleSelect = (value) => {
    const { onSelect } = this.props;
    if (onSelect) {
      onSelect(value);
    }
  }
  render() {
    const {
      outercol, label, col, field, required, disabled,
      getFieldDecorator, rules, fieldProps, formData, options = [],
    } = this.props;
    const initialValue = formData && formData[field];
    const filterOpt = options.filter(opt => opt.value === initialValue)[0];
    return (
      <Col span={outercol}>
        <FormItem labelCol={{ span: col }} wrapperCol={{ span: 24 - col }} colon={false} label={label}
          required={required} style={{ marginBottom: 0 }}
        >
          {disabled ? <Input disabled value={filterOpt && filterOpt.text} /> :
            getFieldDecorator(field, { rules, initialValue, ...fieldProps })(
              <Select
                optionLabelProp="children"
                disabled={disabled}
                showSearch
                allowClear
                onSearch={this.handleSearch}
                optionFilterProp="children"
                onSelect={this.handleSelect}
              >
                {
              options.map(opt => <Option key={opt.value}>{opt.text}</Option>)
            }
              </Select>)}
        </FormItem>
      </Col>
    );
  }
}
