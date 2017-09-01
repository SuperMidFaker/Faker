/* eslint react/no-multi-comp: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import { connect } from 'react-redux';
import { loadLimitLocations } from 'common/reducers/cwmWarehouse';
const Option = Select.Option;

@connect(
  state => ({
    tenantId: state.account.tenantId,
    locations: state.cwmWarehouse.locations,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { loadLimitLocations }
)
export default class LocationSelect extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    size: PropTypes.string,
    style: PropTypes.object,
    onChange: PropTypes.func,
    onSelect: PropTypes.func,
    disabled: PropTypes.bool,
  }
  state = {
    options: [],
  }
  componentWillMount() {
    this.props.loadLimitLocations(this.props.defaultWhse.code, '', this.props.tenantId).then((result) => {
      if (!result.error) {
        this.setState({
          options: result.data,
        });
      }
    });
  }
  handleSearch = (value) => {
    this.props.loadLimitLocations(this.props.defaultWhse.code, '', this.props.tenantId, value).then((result) => {
      if (!result.error) {
        this.setState({
          options: result.data,
        });
      }
    });
  }
  render() {
    return (
      <Select showSearch allowClear onSearch={this.handleSearch} value={this.props.value} disabled={this.props.disabled} size={this.props.size}
        onChange={this.props.onChange} onSelect={this.props.onSelect} optionFilterProp="children" style={this.props.style || {}}
      >
        {
      this.state.options.map(opt => <Option value={opt.location} key={opt.location}>{opt.location}</Option>)
      }</Select>
    );
  }
}
