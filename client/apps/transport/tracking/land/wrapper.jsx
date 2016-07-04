import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Radio } from 'ant-ui';
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
  })
)
export default class TrackingLandWrapper extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    statusfilters: PropTypes.array,
    podfilters: PropTypes.array,
    excpfilters: PropTypes.array,
    children: PropTypes.object.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
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
          <div className="tools">
            <NavLink to="">
              <Button icon="export" type="primary">
                <span>{formatGlobalMsg(intl, 'export')}</span>
              </Button>
            </NavLink>
          </div>
          <RadioGroup onChange={this.handleStatusNav} value={radioValue} size="large">
            <RadioButton value="all">{this.msg('allShipmt')}</RadioButton>
            <RadioButton value="pending">{this.msg('pendingShipmt')}</RadioButton>
            <RadioButton value="accepted">{this.msg('acceptedShipmt')}</RadioButton>
            <RadioButton value="dispatched">{this.msg('dispatchedShipmt')}</RadioButton>
            <RadioButton value="intransit">{this.msg('intransitShipmt')}</RadioButton>
            <RadioButton value="delivered">{this.msg('deliveredShipmt')}</RadioButton>
          </RadioGroup>
          <span style={{marginLeft: '10px'}} />
          <RadioGroup onChange={this.handlePodNav} value={radioValue} size="large">
            <RadioButton value="uploaded">{this.msg('uploadedPOD')}</RadioButton>
            <RadioButton value="submitted">{this.msg('submittedPOD')}</RadioButton>
            <RadioButton value="passed">{this.msg('passedPOD')}</RadioButton>
          </RadioGroup>
          <span style={{marginLeft: '10px'}} />
          <RadioGroup onChange={this.handleExcpNav} value={radioValue} size="large">
            <RadioButton value="warning">{this.msg('exceptionWarn')}</RadioButton>
            <RadioButton value="error">{this.msg('exceptionErr')}</RadioButton>
            <RadioButton value="loss">{this.msg('exceptionLoss')}</RadioButton>
          </RadioGroup>
        </div>
        { this.props.children }
      </div>
    );
  }
}
