import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { locationShape } from 'react-router';
import Navigation from 'client/components/Navigation';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    disApps: state.account.apps.dis,
  }),
  {}
)
export default class ModuleDIS extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    location: locationShape.isRequired,
    children: PropTypes.node,
  };
  state = {
    linkMenus: [],
    appMenus: [],
  }
  componentWillMount() {
    const { intl, disApps } = this.props;
    const linkMenus = [];
    const appMenus = [];
    linkMenus.push({
      single: true,
      key: 'dis-0',
      disabled: false,
      path: '/dis/dashboard',
      icon: 'logixon icon-dashboard',
      text: formatMsg(intl, 'dashboard'),
    });
    linkMenus.push({
      single: true,
      key: 'dis-report',
      icon: 'logixon icon-expense-audit',
      text: formatMsg(intl, 'report'),
      path: '/dis/report',
    });
    if (disApps && disApps.length > 0) {
      if (disApps.length === 1) {
        appMenus.push({
          single: true,
          key: disApps[0].app_id,
          path: disApps[0].url,
          icon: 'logixon icon-apps',
          text: formatMsg(intl, disApps[0].app_name),
        });
      } else {
        appMenus.push({
          single: false,
          key: 'dis-app',
          icon: 'logixon icon-apps',
          text: formatMsg(intl, 'devApps'),
          sublinks: [],
        });
        disApps.forEach((b, index) => {
          appMenus[0].sublinks.push({
            key: `dis-app-${index}`,
            path: b.url,
            text: formatMsg(intl, b.app_name),
          });
        });
      }
    }
    this.setState({ linkMenus, appMenus });
  }
  render() {
    return (
      <Navigation
        links={this.state.linkMenus}
        appMenus={this.state.appMenus}
        childContent={this.props.children}
        location={this.props.location}
      />
    );
  }
}
