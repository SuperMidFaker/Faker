import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectFetch from 'client/common/decorators/connect-fetch';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Layout, Radio } from 'antd';
import QueueAnim from 'rc-queue-anim';
import { format } from 'client/common/i18n/helpers';
import connectNav from 'client/common/decorators/connect-nav';
import withPrivilege, { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadPartners } from 'common/reducers/shipment';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
import ShipmentDockPanel from '../../shipment/dock/shipmentDockPanel';
import DeliveryDockPanel from '../../../scof/shipments/docks/shipmentDockPanel';
import DelegationDockPanel from '../../../cms/common/dock/delegationDockPanel';
import ShipmentAdvanceModal from './modals/shipment-advance-modal';
import CreateSpecialCharge from './modals/create-specialCharge';
import ExportExcel from './modals/export-excel';

import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content } = Layout;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

function fetchData({ state, dispatch }) {
  return dispatch(loadPartners(
    state.account.tenantId,
    [PARTNER_ROLES.VEN],
    [PARTNER_BUSINESSE_TYPES.transport]
  ));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    statusfilters: state.trackingLandStatus.filters,
    podfilters: state.trackingLandPod.filters,
    excpfilters: state.trackingLandException.filters,
  }),
  { }
)
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
@withPrivilege({ module: 'transport', feature: 'tracking' })
export default class TrackingLandWrapper extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    location: PropTypes.shape({ pathname: PropTypes.string }).isRequired,
    children: PropTypes.node.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    radioValue: '',
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
    this.context.router.push(`/transport/tracking/road/status/${ev.target.value}`);
  }
  handlePodNav = (ev) => {
    this.context.router.push(`/transport/tracking/road/pod/${ev.target.value}`);
  }
  handleExcpNav = (ev) => {
    this.context.router.push(`/transport/tracking/road/exception/${ev.target.value}`);
  }

  render() {
    const { radioValue } = this.state;
    return (
      <QueueAnim animConfig={[{ opacity: [1, 0], translateY: [0, 50] },
            { opacity: [1, 0], translateY: [0, -50] }]}
      >
        <Header className="page-header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('transportTracking')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <RadioGroup onChange={this.handleStatusNav} value={radioValue} >
            <RadioButton value="all">{this.msg('allShipmt')}</RadioButton>
            <RadioButton value="pending">{this.msg('pendingShipmt')}</RadioButton>
            <RadioButton value="accepted">{this.msg('acceptedShipmt')}</RadioButton>
            <RadioButton value="dispatched">{this.msg('dispatchedShipmt')}</RadioButton>
            <RadioButton value="intransit">{this.msg('intransitShipmt')}</RadioButton>
            <RadioButton value="delivered">{this.msg('deliveredShipmt')}</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup onChange={this.handlePodNav} value={radioValue} >
            <RadioButton value="upload">{this.msg('uploadPOD')}</RadioButton>
            <RadioButton value="audit">{this.msg('auditPOD')}</RadioButton>
            <RadioButton value="passed">{this.msg('passedPOD')}</RadioButton>
          </RadioGroup>
          <span />
          <RadioGroup onChange={this.handleExcpNav} value={radioValue} >
            <RadioButton value="error">{this.msg('exceptionErr')}</RadioButton>
          </RadioGroup>
          <div className="page-header-tools">
            <PrivilegeCover module="transport" feature="tracking" action="create">
              <ExportExcel />
            </PrivilegeCover>
            <span />
          </div>
        </Header>
        <Content className="main-content" key="main">
          {this.props.children}
        </Content>
        <ShipmentDockPanel />
        <DeliveryDockPanel />
        <DelegationDockPanel />
        <ShipmentAdvanceModal />
        <CreateSpecialCharge />
      </QueueAnim>
    );
  }
}
