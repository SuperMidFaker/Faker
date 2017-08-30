/* eslint react/no-multi-comp: 0 */
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
    loadLocations: PropTypes.func.isRequired,
    productNo: PropTypes.string.isRequired,
  }
  state = {
    options: [],
    receiveLocations: [],
  }
  componentWillMount() {
    this.props.loadAdviceLocations(this.props.productNo, this.props.tenantId, this.props.defaultWhse.code).then((result) => {
      if (!result.error) {
        if (result.data.length !== 0) {
          this.setState({
            receiveLocations: result.data,
            options: result.data,
          });
        } else {
          this.setState({
            options: this.props.locations.slice(0, 10),
          });
        }
      }
    });
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.productNo !== this.props.productNo) {
      this.props.loadAdviceLocations(nextProps.productNo, this.props.tenantId, this.props.defaultWhse.code).then((result) => {
        if (!result.error) {
          if (result.data.length !== 0) {
            this.setState({
              receiveLocations: result.data,
              options: result.data,
            });
          } else {
            this.setState({
              options: this.props.locations.slice(0, 10),
            });
          }
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
