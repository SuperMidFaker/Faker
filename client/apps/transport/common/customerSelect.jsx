import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Select } from 'antd';

const Option = Select.Option;
@connect(
  state => ({
    clients: state.shipment.formRequire.clients,
  }))
@injectIntl

export default class CustomerSelect extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
  }
  render() {
    const clients = [{
      name: '全部客户',
      partner_id: -1,
    }].concat(this.props.clients);
    return (
      <Select
        defaultValue={-1}
        onChange={this.props.onChange}
        style={{ ...this.props.style, width: 160 }}
        showSearch
        placeholder=""
        optionFilterProp="children"
        notFoundContent=""
      >
        {
          clients.map(pt => (
            <Option searched={`${pt.partner_code}${pt.name}`}
              value={pt.partner_id} key={pt.partner_id}
            >
              {pt.partner_code ? `${pt.partner_code} | ${pt.name}` : pt.name}
            </Option>)
          )
        }
      </Select>
    );
  }
}
