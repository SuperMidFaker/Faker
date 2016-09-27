import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { locationShape } from 'react-router';
import AmLeftSidebar from 'client/components/am-ant-leftbar';
import messages from './message.i18n.js';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);

@injectIntl
export default class ModuleSCV extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    location: locationShape.isRequired,
    children: PropTypes.object.isRequired,
  };
  state = {
    linkMenus: [],
  }
  componentWillMount() {
    const { intl } = this.props;
    const linkMenus = [];
    linkMenus.push({
      single: true,
      key: 'scv-1',
      path: '/scv/dashboard',
      icon: 'icon-ikons-login',
      text: formatMsg(intl, 'dashboard'),
    });
    linkMenus.push({
      single: true,
      key: 'scv-2',
      path: '/scv/order',
      icon: 'icon-ikons-logout',
      text: formatMsg(intl, 'order'),
    });
    linkMenus.push({
      single: true,
      key: 'scv-3',
      path: '/scv/inbound',
      icon: 'zmdi zmdi-money-box',
      text: formatMsg(intl, 'inbound'),
    });
    linkMenus.push({
      single: true,
      key: 'scv-4',
      path: '/scv/outbound',
      icon: 'zmdi zmdi-money-box',
      text: formatMsg(intl, 'outbound'),
    });
    linkMenus.push({
      single: false,
      key: 'scv-5',
      icon: 'icon-ikons-credit-card',
      text: formatMsg(intl, 'payment'),
      sublinks: [{
        key: 'scv-5-0',
        path: '/scv/payment/tax',
        text: formatMsg(intl, 'taxPayment'),
      }, {
        key: 'scv-5-1',
        path: '/scv/payment/frightbill',
        text: formatMsg(intl, 'freightBillPayment'),
      }],
    });
    linkMenus.push({
      single: false,
      key: 'scv-6',
      icon: 'icon-ikons-credit-card',
      text: formatMsg(intl, 'analytics'),
      sublinks: [{
        key: 'scv-6-0',
        path: '/scv/analytic/kpi',
        text: formatMsg(intl, 'kpiAnalytic'),
      }, {
        key: 'scv-6-1',
        path: '/scv/analytic/cost',
        text: formatMsg(intl, 'costAnalytic'),
      }],
    });
    linkMenus.push({
      single: true,
      key: 'scv-7',
      path: '/clearance/settings',
      icon: 'zmdi zmdi-settings',
      text: formatMsg(intl, 'settings'),
    });
    this.setState({ linkMenus });
  }
  render() {
    return (
      <div className="am-content">
        <AmLeftSidebar links={this.state.linkMenus} location={this.props.location} />
        {this.props.children}
      </div>
    );
  }
}
