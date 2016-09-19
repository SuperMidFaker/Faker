import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import AmLeftSidebar from 'client/components/am-ant-leftbar';
import messages from './message.i18n.js';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);

function getLinks(intl) {
  return [{
    single: true,
    key: 'cms-1',
    path: '/clearance/import',
    icon: 'icon-ikons-login',
    text: formatMsg(intl, 'import'),
  }, {
    single: true,
    key: 'cms-2',
    path: '/clearance/export',
    icon: 'icon-ikons-logout',
    text: formatMsg(intl, 'export'),
  }, {
    single: true,
    key: 'cms-5',
    path: '/clearance/price',
    icon: 'zmdi zmdi-case',
    text: formatMsg(intl, 'quote'),
  }, {
    single: true,
    key: 'cms-3',
    path: '/clearance/expense',
    icon: 'zmdi zmdi-money-box',
    text: formatMsg(intl, 'expense'),
  }, {
    single: true,
    key: 'cms-4',
    path: '/clearance/billing',
    icon: 'icon-ikons-credit-card',
    text: formatMsg(intl, 'billing'),
  }, {
    single: false,
    key: 'cms-6',
    path: '/clearance/settings',
    icon: 'zmdi zmdi-settings',
    text: formatMsg(intl, 'settings'),
    sublinks: [{
      key: 'cms-3-1',
      path: '/clearance/relation',
      text: formatMsg(intl, 'relation'),
    }],
  }];
}

@injectIntl
export default class Clearance extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
  };
  render() {
    const linkMenus = getLinks(this.props.intl);
    return (
      <div className="am-content">
        <AmLeftSidebar links={linkMenus} location={this.props.location} />
        {this.props.children}
      </div>
    );
  }
}
