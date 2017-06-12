import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { Select } from 'antd';

const Option = Select.Option;

@injectIntl

export default class CreatorSelect extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onChange: PropTypes.func.isRequired,
    onInitialize: PropTypes.func,
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
      const fieldsValue = JSON.parse(window.localStorage.tmsAcceptanceShipmentCreator || '{"creator": "all"}');
      if (this.props.onInitialize) {
        this.props.onInitialize(fieldsValue);
        this.saveFieldsValue(fieldsValue);
      }
      this.setState({ fieldsValue });
    }
  }
  saveFieldsValue = (fieldsValue) => {
    if (window.localStorage) {
      const fv = { ...JSON.parse(window.localStorage.tmsAcceptanceShipmentCreator || '{"creator": "all"}'), ...fieldsValue };
      window.localStorage.tmsAcceptanceShipmentCreator = JSON.stringify(fv);
      this.setState({ fieldsValue: fv });
    }
  }

  handleChange = (value) => {
    const fieldsValue = { creator: value };
    this.props.onChange(fieldsValue);
    this.saveFieldsValue(fieldsValue);
  }

  render() {
    const { fieldsValue } = this.state;
    return (
      <Select
        value={fieldsValue.creator ? fieldsValue.creator : ''}
        onChange={this.handleChange}
        style={{ width: 160 }}
        size={this.props.size}
      >
        <Option value="all">全部运单</Option>
        <Option value="me">我创建的运单</Option>
      </Select>
    );
  }
}
