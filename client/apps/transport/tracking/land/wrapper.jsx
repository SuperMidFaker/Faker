import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Layout, Radio } from 'antd';
import QueueAnim from 'rc-queue-anim';
import AdvancedSearchBar from '../../common/advanced-search-bar';
import PreviewPanel from '../../shipment/modals/preview-panel';
import { changeStatusFilter } from 'common/reducers/trackingLandStatus';
import { changePodFilter } from 'common/reducers/trackingLandPod';
import { changeExcpFilter } from 'common/reducers/trackingLandException';
import { format } from 'client/common/i18n/helpers';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege, { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import ExportExcel from './modals/export-excel';
import messages from './message.i18n';
const formatMsg = format(messages);
const { Header, Content } = Layout;
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
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
@withPrivilege({ module: 'transport', feature: 'tracking' })
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
    radioValue: '',
    advancedSearchVisible: false,
    stage: 'tracking',
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
    const types = propFilters.filter(flt => flt.name === 'type');
    if (types.length === 1) {
      radioValue = types[0].value;
    }
    this.setState({ radioValue });
  }
  componentWillReceiveProps(nextProps) {
    const locName = nextProps.location.pathname.split('/')[4];
    let propFilters = [];
    let stage = '';
    if (locName === 'status') {
      propFilters = nextProps.statusfilters;
      stage = 'tracking';
    } else if (locName === 'pod') {
      propFilters = nextProps.podfilters;
      stage = 'pod';
    } else if (locName === 'exception') {
      propFilters = nextProps.excpfilters;
      stage = 'exception';
    }
    let radioValue;
    const types = propFilters.filter(flt => flt.name === 'type');
    if (types.length === 1) {
      radioValue = types[0].value;
    }
    this.setState({ radioValue, stage });
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
    const { radioValue, stage } = this.state;
    let exportExcel = null;
    if (radioValue === 'all' || radioValue === 'pending' || radioValue === 'accepted' ||
      radioValue === 'dispatched' || radioValue === 'intransit' || radioValue === 'delivered') {
      exportExcel = (
        <PrivilegeCover module="transport" feature="tracking" action="create">
          <ExportExcel />
        </PrivilegeCover>
      );
    }
    return (
      <QueueAnim animConfig={[{ opacity: [1, 0], translateY: [0, 50] },
            { opacity: [1, 0], translateY: [0, -50] }]}
      >
        <Header className="top-bar">
          <span>{this.msg('transportTracking')}</span>
          <RadioGroup onChange={this.handleStatusNav} value={radioValue} size="large">
            <RadioButton value="all">{this.msg('allShipmt')}</RadioButton>
            <RadioButton value="pending">{this.msg('pendingShipmt')}</RadioButton>
            <RadioButton value="accepted">{this.msg('acceptedShipmt')}</RadioButton>
            <RadioButton value="dispatched">{this.msg('dispatchedShipmt')}</RadioButton>
            <RadioButton value="intransit">{this.msg('intransitShipmt')}</RadioButton>
            <RadioButton value="delivered">{this.msg('deliveredShipmt')}</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup onChange={this.handlePodNav} value={radioValue} size="large">
            <RadioButton value="upload">{this.msg('uploadPOD')}</RadioButton>
            <RadioButton value="audit">{this.msg('auditPOD')}</RadioButton>
            <RadioButton value="passed">{this.msg('passedPOD')}</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup onChange={this.handleExcpNav} value={radioValue} size="large">
            <RadioButton value="error">{this.msg('exceptionErr')}</RadioButton>
          </RadioGroup>
          <div className="top-bar-tools">
            {exportExcel}
            <span />
            <a onClick={this.toggleAdvancedSearch}>高级搜索</a>
          </div>
        </Header>
        <Content className="main-content" key="main">
          <AdvancedSearchBar visible={this.state.advancedSearchVisible} onSearch={this.handleAdvancedSearch} toggle={this.toggleAdvancedSearch} />
          {this.props.children}
        </Content>
        <PreviewPanel stage={stage} />
      </QueueAnim>
    );
  }
}
