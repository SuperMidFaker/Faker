/* eslint react/no-multi-comp: 0 */
import React from 'react';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import { connect } from 'react-redux';
const Option = Select.Option;

@connect(
  state => ({
    locations: state.cwmWarehouse.locations,
  }),
  { }
)
export default class LocationSelect extends React.Component {
  static propTypes = {
    value: PropTypes.string,
    style: PropTypes.object,
    onChange: PropTypes.func,
    onSelect: PropTypes.func,
    disabled: PropTypes.bool,
  }
  state = {
    options: [],
  }
  componentWillMount() {
    this.setState({
      options: this.props.locations.slice(0, 19),
    });
  }
  handleSearch = (value) => {
    const options = this.props.locations.filter((item) => {
      if (value) {
        const reg = new RegExp(value);
        return reg.test(item.location);
      } else {
        return true;
      }
    });
    this.setState({ options });
  }
  render() {
    return (
      <Select showSearch allowClear onSearch={this.handleSearch} value={this.props.value} disabled={this.props.disabled}
        onChange={this.props.onChange} onSelect={this.props.onSelect} optionFilterProp="children" style={this.props.style || {}}
      >
        {
      this.state.options.map(opt => <Option value={opt.location} key={opt.location}>{opt.location}</Option>)
      }</Select>
    );
  }
}
