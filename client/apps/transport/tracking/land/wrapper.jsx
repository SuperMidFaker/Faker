import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Radio } from 'antd';
import QueueAnim from 'rc-queue-anim';
import SearchBar from 'client/components/search-bar';
import AdvancedSearchBar from '../../common/advanced-search-bar';
import { changeStatusFilter } from 'common/reducers/trackingLandStatus';
import { changePodFilter } from 'common/reducers/trackingLandPod';
import { changeExcpFilter } from 'common/reducers/trackingLandException';
import { format } from 'client/common/i18n/helpers';
import connectNav from 'client/common/decorators/connect-nav';
import { setNavTitle } from 'common/reducers/navbar';

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
@connectNav((props, dispatch) => {
  dispatch(setNavTitle({
    depth: 2,
    moduleName: 'transport',
    withModuleLayout: false,
    goBackFn: null,
  }));
})
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
    radioValue: '',
    advancedSearchVisible: false,
  }
  componentWillMount() {
    const locName = this.props.location.pathname.split('/')[4];
    let propFilters = [];
    if (locName === 'status') {
      propFilters = this.props.statusfilters;
    } else if (locName === 'pod') {
      propFilters = this.props.podfilters;
    } else if (locName === 'exception') {
      propFilters = this.props.excpfilters;
    }
    let radioValue;
    let searchInput;
    const types = propFilters.filter(flt => flt.name === 'type');
    if (types.length === 1) {
      radioValue = types[0].value;
    }
    const nos = propFilters.filter(flt => flt.name === 'shipmt_no');
    if (nos.length === 1) {
      searchInput = nos[0].value;
    }
    this.setState({ radioValue, searchInput });
  }
  componentWillReceiveProps(nextProps) {
    const locName = nextProps.location.pathname.split('/')[4];
    let propFilters = [];
    if (locName === 'status') {
      propFilters = nextProps.statusfilters;
    } else if (locName === 'pod') {
      propFilters = nextProps.podfilters;
    } else if (locName === 'exception') {
      propFilters = nextProps.excpfilters;
    }
    let radioValue;
    const types = propFilters.filter(flt => flt.name === 'type');
    if (types.length === 1) {
      radioValue = types[0].value;
    }
    this.setState({ radioValue });
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  handleStatusNav = (ev) => {
    this.context.router.push(
      `/transport/tracking/road/status/${ev.target.value}`
    );
  }
  handlePodNav = (ev) => {
    this.context.router.push(
      `/transport/tracking/road/pod/${ev.target.value}`
    );
  }
  handleExcpNav = (ev) => {
    this.context.router.push(
      `/transport/tracking/road/exception/${ev.target.value}`
    );
  }
  handleSearchInput = (value) => {
    this.setState({ searchInput: value });
    this.props.changeStatusFilter('shipmt_no', value);
    this.props.changePodFilter('shipmt_no', value);
    this.props.changeExcpFilter('shipmt_no', value);
  }
  handleAdvancedSearch = (searchVals) => {
    Object.keys(searchVals).forEach((key) => {
      this.props.changeStatusFilter(key, searchVals[key]);
      this.props.changePodFilter(key, searchVals[key]);
      this.props.changeExcpFilter(key, searchVals[key]);
    });
    this.showAdvancedSearch(false);
  }
  toggleAdvancedSearch = () => {
    this.setState({ advancedSearchVisible: !this.state.advancedSearchVisible });
  }
  showAdvancedSearch = (advancedSearchVisible) => {
    this.setState({ advancedSearchVisible });
  }
  render() {
    const { radioValue, searchInput } = this.state;
    return (
      <QueueAnim animConfig={[{ opacity: [1, 0], translateY: [0, 50] },
            { opacity: [1, 0], translateY: [0, -50] }]}>
        <header className="top-bar" key="header">
          <div className="tools">
            <SearchBar placeholder={this.msg('searchShipmtPH')} onInputSearch={this.handleSearchInput}
              value={searchInput}
            />
            <span />
            <a onClick={this.toggleAdvancedSearch}>高级搜索</a>
          </div>
          <span>{this.msg('transportTracking')}</span>
          <RadioGroup onChange={this.handleStatusNav} value={radioValue}>
            <RadioButton value="all">{this.msg('allShipmt')}</RadioButton>
            <RadioButton value="pending">{this.msg('pendingShipmt')}</RadioButton>
            <RadioButton value="accepted">{this.msg('acceptedShipmt')}</RadioButton>
            <RadioButton value="dispatched">{this.msg('dispatchedShipmt')}</RadioButton>
            <RadioButton value="intransit">{this.msg('intransitShipmt')}</RadioButton>
            <RadioButton value="delivered">{this.msg('deliveredShipmt')}</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup onChange={this.handlePodNav} value={radioValue}>
            <RadioButton value="upload">{this.msg('uploadPOD')}</RadioButton>
            <RadioButton value="audit">{this.msg('auditPOD')}</RadioButton>
            <RadioButton value="passed">{this.msg('passedPOD')}</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup onChange={this.handleExcpNav} value={radioValue}>
            <RadioButton value="error">{this.msg('exceptionErr')}</RadioButton>
          </RadioGroup>
        </header>
        <div className="main-content" key="main">
          <AdvancedSearchBar visible={this.state.advancedSearchVisible} onSearch={this.handleAdvancedSearch} toggle={this.toggleAdvancedSearch} />
          {this.props.children}
        </div>
      </QueueAnim>
    );
  }
}
