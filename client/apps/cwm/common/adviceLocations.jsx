import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import { connect } from 'react-redux';
import { loadLimitLocations } from 'common/reducers/cwmWarehouse';
import { loadAdviceLocations } from 'common/reducers/cwmReceive';
const Option = Select.Option;

@connect(
  state => ({
    tenantId: state.account.tenantId,
    locations: state.cwmWarehouse.locations,
    defaultWhse: state.cwmContext.defaultWhse,
  }),
  { loadLimitLocations, loadAdviceLocations }
)
export default class AdviceLocations extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    size: PropTypes.string,
    style: PropTypes.object,
    onChange: PropTypes.func,
    onSelect: PropTypes.func,
    disabled: PropTypes.bool,
    productNo: PropTypes.string.isRequired,
  }
  state = {
    options: [],
    location: '',
  }
  componentWillMount() {
    this.props.loadAdviceLocations(this.props.productNo, this.props.tenantId, this.props.defaultWhse.code).then((result) => {
      if (!result.error) {
        this.setState({ options: result.data });
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.productNo !== this.props.productNo) {
      this.props.loadAdviceLocations(nextProps.productNo, this.props.tenantId, this.props.defaultWhse.code).then((result) => {
        if (!result.error) {
          this.setState({ options: result.data });
        }
      });
    }
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
  handleChange = (value) => {
    this.setState({ location: value });
    if (this.props.onChange) {
      const location = this.state.options.filter(loc => loc.location === value)[0];
      this.props.onChange(value, location);
    }
  }
  handleSelect = (value) => {
    this.setState({ location: value });
    if (this.props.onSelect) {
      const location = this.state.options.filter(loc => loc.location === value)[0];
      this.props.onSelect(value, location);
    }
  }
  render() {
    return (
      <Select showSearch allowClear onSearch={this.handleSearch} value={this.state.location} disabled={this.props.disabled} size={this.props.size}
        onChange={this.handleChange} onSelect={this.handleSelect} optionFilterProp="children" style={this.props.style || {}}
      >
        {this.state.options.map(opt => <Option value={opt.location} key={opt.location}>{opt.location}</Option>)}
      </Select>
    );
  }
}
