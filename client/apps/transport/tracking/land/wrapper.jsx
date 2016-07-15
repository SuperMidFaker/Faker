import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Radio } from 'antd';
import SearchBar from 'client/components/search-bar';
import { changeStatusFilter } from 'common/reducers/trackingLandStatus';
import { changePodFilter } from 'common/reducers/trackingLandPod';
import { changeExcpFilter } from 'common/reducers/trackingLandException';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
const formatMsg = format(messages);

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

@injectIntl
@connect(
  state => ({
    statusfilters: state.trackingLandStatus.filters,
    podfilters: state.trackingLandPod.filters,
    excpfilters: state.trackingLandException.filters,
  }),
  { changeStatusFilter, changePodFilter, changeExcpFilter }
)
export default class TrackingLandWrapper extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    statusfilters: PropTypes.array,
    podfilters: PropTypes.array,
    excpfilters: PropTypes.array,
    children: PropTypes.object.isRequired,
    changeStatusFilter: PropTypes.func.isRequired,
    changePodFilter: PropTypes.func.isRequired,
    changeExcpFilter: PropTypes.func.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    searchInput: '',
  }
  msg = (descriptor) => formatMsg(this.props.intl, descriptor)
  handleStatusNav = (ev) => {
    this.context.router.push(
      `/transport/tracking/land/shipmt/status/${ev.target.value}`
    );
  }
  handlePodNav = (ev) => {
    this.context.router.push(
      `/transport/tracking/land/shipmt/pod/${ev.target.value}`
    );
  }
  handleExcpNav = (ev) => {
    this.context.router.push(
      `/transport/tracking/land/shipmt/exception/${ev.target.value}`
    );
  }
  handleSearchInput = value => {
    this.setState({ searchInput: value });
    this.props.changeStatusFilter('shipmt_no', value);
    this.props.changePodFilter('shipmt_no', value);
    this.props.changeExcpFilter('shipmt_no', value);
  }
  render() {
    const locName = this.props.location.pathname.split('/')[5];
    let propFilters = [];
    if (locName === 'status') {
      propFilters = this.props.statusfilters;
    } else if (locName === 'pod') {
      propFilters = this.props.podfilters;
    } else if (locName === 'exception') {
      propFilters = this.props.excpfilters;
    }
    let radioValue;
    const types = propFilters.filter(flt => flt.name === 'type');
    if (types.length === 1) {
      radioValue = types[0].value;
    }
    return (
      <div className="main-content">
        <div className="page-header">
          <RadioGroup onChange={this.handleStatusNav} value={radioValue} size="large">
            <RadioButton value="all">{this.msg('allShipmt')}</RadioButton>
            <RadioButton value="pending">{this.msg('pendingShipmt')}</RadioButton>
            <RadioButton value="accepted">{this.msg('acceptedShipmt')}</RadioButton>
            <RadioButton value="dispatched">{this.msg('dispatchedShipmt')}</RadioButton>
            <RadioButton value="intransit">{this.msg('intransitShipmt')}</RadioButton>
            <RadioButton value="delivered">{this.msg('deliveredShipmt')}</RadioButton>
          </RadioGroup>
          <span style={{ marginLeft: '8px' }} />
          <RadioGroup onChange={this.handlePodNav} value={radioValue} size="large">
            <RadioButton value="uploaded">{this.msg('uploadedPOD')}</RadioButton>
            <RadioButton value="submitted">{this.msg('submittedPOD')}</RadioButton>
            <RadioButton value="passed">{this.msg('passedPOD')}</RadioButton>
          </RadioGroup>
          <span style={{ marginLeft: '8px' }} />
          <RadioGroup onChange={this.handleExcpNav} value={radioValue} size="large">
            <RadioButton value="warning">{this.msg('exceptionWarn')}</RadioButton>
            <RadioButton value="error">{this.msg('exceptionErr')}</RadioButton>
            <RadioButton value="loss">{this.msg('exceptionLoss')}</RadioButton>
          </RadioGroup>
          <div className="tools">
            <SearchBar placeholder={this.msg('searchShipmtPH')} onInputSearch={this.handleSearchInput}
              value={this.state.searchInput}
            />
          </div>
        </div>
        {this.props.children}
      </div>
    );
  }
}
