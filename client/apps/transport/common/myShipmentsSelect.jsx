import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { Select } from 'antd';

const Option = Select.Option;

@injectIntl

export default class MyShipmentsSelect extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onChange: PropTypes.func.isRequired,
    size: PropTypes.string,
  }
  state = {
    fieldsValue: {},
  }
  componentDidMount() {
    this.initializeFieldsValue();
  }
  initializeFieldsValue = () => {
    if (window.localStorage) {
      const fieldsValue = JSON.parse(window.localStorage.tmsAdvancedSearchFieldsValue || '{ "viewStatus": "all" }');
      this.props.onChange(fieldsValue);
      this.setState({ fieldsValue });
    }
  }
  saveFieldsValue = (fieldsValue) => {
    if (window.localStorage) {
      const fv = { ...JSON.parse(window.localStorage.tmsAdvancedSearchFieldsValue), ...fieldsValue };
      window.localStorage.tmsAdvancedSearchFieldsValue = JSON.stringify(fv);
      this.setState({ fieldsValue: fv });
    }
  }

  handleChange = (value) => {
    const fieldsValue = { viewStatus: value };
    this.props.onChange(fieldsValue);
    this.saveFieldsValue(fieldsValue);
  }

  render() {
    const { fieldsValue } = this.state;
    return (
      <Select
        value={fieldsValue.viewStatus ? fieldsValue.viewStatus : ''}
        onChange={this.handleChange}
        style={{ width: 160 }}
        size={this.props.size}
      >
        <Option value="my">我负责的运单</Option>
        <Option value="all">全部运单</Option>
      </Select>
    );
  }
}
