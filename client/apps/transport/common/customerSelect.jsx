import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Select } from 'antd';

const Option = Select.Option;
@connect(state => ({
  clients: state.shipment.formRequire.clients,
}))
@injectIntl

export default class CustomerSelect extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onChange: PropTypes.func.isRequired,
    clients: PropTypes.array.isRequired,
    style: PropTypes.object,
    size: PropTypes.string,
  }
  handleChange = (value) => {
    const client = this.props.clients.find(item => item.partner_id === Number(value));
    this.props.onChange(Number(value), client ? client.tid : -2);
  }
  render() {
    const clients = [{
      name: '全部客户',
      partner_id: -1,
    }].concat(this.props.clients);
    return (
      <Select
        defaultValue="-1"
        onChange={this.handleChange}
        style={{ ...this.props.style, width: 160 }}
        showSearch
        placeholder=""
        optionFilterProp="children"
        notFoundContent=""
        dropdownMatchSelectWidth={false}
        size={this.props.size}
      >
        {
          clients.map(pt => (
            <Option searched={`${pt.partner_code}${pt.name}`}
              value={String(pt.partner_id)} key={pt.partner_id}
            >
              {pt.partner_code ? `${pt.partner_code} | ${pt.name}` : pt.name}
            </Option>))
        }
      </Select>
    );
  }
}
