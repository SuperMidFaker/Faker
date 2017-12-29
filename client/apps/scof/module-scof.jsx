import React from 'react';
import PropTypes from 'prop-types';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { locationShape } from 'react-router';
import { loadTrackings } from 'common/reducers/scvTracking';
import { format } from 'client/common/i18n/helpers';
import CollapsibleSiderLayout from 'client/components/CollapsibleSiderLayout';
import messages from './message.i18n';

const formatMsg = format(messages);

@connect(
  state => ({
    tenantId: state.account.tenantId,
    trackings: state.scvTracking.trackings,
  }),
  { loadTrackings }
)
@injectIntl
export default class ModuleSCOF extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    location: locationShape.isRequired,
    children: PropTypes.node,
    trackings: PropTypes.array.isRequired,
  };
  state = {
    linkMenus: [],
  }
  componentWillMount() {
    this.props.loadTrackings(this.props.tenantId);
  }
  componentWillReceiveProps(nextProps) {
    let trackingSublinks = [];
    if (nextProps.trackings.length > 0) {
      trackingSublinks = nextProps.trackings.map((item, index) => ({
        key: `scof-tracking-${index}`,
        path: `/scof/tracking/${item.id}`,
        text: item.name,
      }));
    }
    const { intl } = this.props;
    const linkMenus = [];
    linkMenus.push({
      single: true,
      key: 'scof-order',
      path: '/scof/orders',
      icon: 'logixon icon-order-mng',
      text: formatMsg(intl, 'orders'),
    });
    linkMenus.push({
      single: false,
      key: 'scof-tracking',
      icon: 'logixon icon-monitor',
      text: formatMsg(intl, 'tracking'),
      sublinks: trackingSublinks.concat([{
        key: 'scof-tracking-999',
        icon: 'zmdi zmdi-wrench',
        path: '/scof/tracking/customize',
        text: formatMsg(intl, 'customizeTracking'),
      }]),
    });
    linkMenus.push({
      single: true,
      key: 'scof-flow',
      path: '/scof/flow',
      icon: 'logixon icon-process',
      text: formatMsg(intl, 'flow'),
    });
    linkMenus.push({
      single: true,
      key: 'scof-customer',
      path: '/scof/customers',
      icon: 'logixon icon-customer-mng',
      text: formatMsg(intl, 'customers'),
    });
    linkMenus.push({
      single: true,
      key: 'scof-vendor',
      path: '/scof/vendors',
      icon: 'logixon icon-supplier-mng',
      text: formatMsg(intl, 'vendors'),
    });
    this.setState({ linkMenus });
  }
  render() {
    return (
      <CollapsibleSiderLayout
        links={this.state.linkMenus}
        childContent={this.props.children}
        location={this.props.location}
      />
    );
  }
}
