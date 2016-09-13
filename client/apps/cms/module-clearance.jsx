import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AmLeftSidebar from 'client/components/am-ant-leftbar';
import { TENANT_ASPECT } from 'common/constants';
import { intlShape, injectIntl } from 'react-intl';
import messages from './message.i18n.js';
import { format } from 'client/common/i18n/helpers';
const formatMsg = format(messages);

function getLinksByAspect(aspect, intl) {
  if (aspect === TENANT_ASPECT.SP) {
    return [{
      single: true,
      key: 'cms-0',
      path: '/clearance/import',
      icon: 'zmdi zmdi-sign-in',
      text: formatMsg(intl, 'import'),
    }, {
      single: true,
      key: 'cms-1',
      path: '/clearance/export',
      icon: 'zmdi zmdi-open-in-new',
      text: formatMsg(intl, 'export'),
    }, {
      single: true,
      key: 'cms-2',
      path: '/clearance/expense',
      icon: 'zmdi zmdi-money-box',
      text: formatMsg(intl, 'expense'),
    }, {
      single: true,
      key: 'cms-3',
      path: '/clearance/manage',
      icon: 'zmdi zmdi-case',
      text: formatMsg(intl, 'manage'),
    }, {
      single: true,
      key: 'cms-4',
      path: '/clearance/settings',
      icon: 'zmdi zmdi-settings',
      text: formatMsg(intl, 'settings'),
    }];
  }
}
@injectIntl
@connect(
  state => ({
    aspect: state.account.aspect,
  })
)
export default class Clearance extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    aspect: PropTypes.number.isRequired,
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
  };
  render() {
    const { aspect, intl } = this.props;
    const linkMenus = getLinksByAspect(aspect, intl);
    return (
      <div className="am-content">
        <AmLeftSidebar links={linkMenus} location={this.props.location} />
        {this.props.children}
      </div>
    );
  }
}
