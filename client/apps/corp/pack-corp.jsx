import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import AmNavBar from 'client/components/am-navbar';
import AmLeftSidebar from 'client/components/am-ant-leftbar';
import { hasPermission } from 'client/common/decorators/withPrivilege';
import { TENANT_LEVEL } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from 'client/apps/message.i18n';
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    level: state.account.tenantLevel,
    privileges: state.account.privileges,
  })
)
export default class CorpPack extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    level: PropTypes.number.isRequired,
    privileges: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
  }
  state = {
    linkMenus: [],
  }
  componentWillMount() {
    const linkMenus = [];
    const { intl, privileges, level } = this.props;
    if (hasPermission(privileges, { module: 'corp', feature: 'overview' })) {
      linkMenus.push({
        single: true,
        key: 'corpsetting-0',
        path: '/corp/overview',
        icon: 'icon-ikons-timer',
        text: formatMsg(intl, 'corpOverview'),
      });
    }
    if (hasPermission(privileges, { module: 'corp', feature: 'info' })) {
      linkMenus.push({
        single: true,
        key: 'corpsetting-1',
        path: '/corp/info',
        icon: 'icon-ikons-presentation',
        text: formatMsg(intl, 'corpInfo'),
      });
    }
    if (hasPermission(privileges, { module: 'corp', feature: 'personnel' })) {
      linkMenus.push({
        single: true,
        key: 'corpsetting-2',
        path: '/corp/personnel',
        icon: 'icon-ikons-users',
        text: formatMsg(intl, 'personnelUser'),
      });
    }
    if (
      level === TENANT_LEVEL.ENTERPRISE &&
      hasPermission(privileges, { module: 'corp', feature: 'organization' })
    ) {
      linkMenus.push({
        single: true,
        key: 'corpsetting-3',
        path: '/corp/organization',
        icon: 'zmdi zmdi-group',
        text: formatMsg(intl, 'organTitle'),
      });
    }
    if (hasPermission(privileges, { module: 'corp', feature: 'partners' })) {
      linkMenus.push({
        single: true,
        key: 'corpsetting-4',
        path: '/corp/partners',
        icon: 'zmdi zmdi-share',
        text: formatMsg(intl, 'partnership'),
      });
    }
    this.setState({ linkMenus });
  }

  render() {
    return (
      <div className="am-wrapper am-fixed-sidebar">
        <AmNavBar />
        <div className="am-content">
          <AmLeftSidebar links={this.state.linkMenus} location={this.props.location} />
          {this.props.children}
        </div>
      </div>);
  }
}
