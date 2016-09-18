import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import AmLeftSidebar from 'client/components/am-ant-leftbar';
import messages from './message.i18n.js';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);

function getLinks(intl) {
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
    single: false,
    key: 'cms-3',
    icon: 'zmdi zmdi-case',
    text: formatMsg(intl, 'manage'),
    sublinks: [{
      key: 'cms-3-1',
      path: '/clearance/relation',
      text: formatMsg(intl, 'relation'),
    }, {
      key: 'cms-3-2',
      path: '/clearance/price',
      text: formatMsg(intl, 'priceManage'),
    }],
  }, {
    single: true,
    key: 'cms-4',
    path: '/clearance/settings',
    icon: 'zmdi zmdi-settings',
    text: formatMsg(intl, 'settings'),
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
