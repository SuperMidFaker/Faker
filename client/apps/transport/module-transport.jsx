import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import AmLeftSidebar from 'client/components/am-ant-leftbar';
import { TENANT_ASPECT } from 'common/constants';
import { format } from 'client/common/i18n/helpers';
import messages from 'client/apps/message.i18n';
const formatMsg = format(messages);

function getLinksByAspect(aspect, intl) {
  if (aspect === TENANT_ASPECT.SP) {
    return [{
      single: true,
      key: 'tms-0',
      path: '/transport/',
      icon: 'zmdi zmdi-tv-list',
      text: '工作台',
    }, {
      single: true,
      key: 'tms-1',
      path: '/transport/shipment',
      icon: 'zmdi zmdi-inbox',
      text: formatMsg(intl, 'transportShipment'),
    }, {
      single: true,
      key: 'tms-2',
      path: '/transport/dispatch',
      icon: 'zmdi zmdi-arrow-split',
      text: '调度',
    }, {
      single: true,
      key: 'tms-3',
      path: '/transport/tracking',
      icon: 'zmdi zmdi-assignment-check',
      text: '追踪',
    }, {
      single: false,
      key: 'tms-4',
      path: '/transport/resources',
      icon: 'zmdi zmdi-library',
      text: '管理',
      sublinks: [{
        key: 'tms-4-1',
        path: '/transport/resources',
        text: '资源管理',
      }, {
        key: 'tms-4-2',
        path: '/transport/tariff',
        text: '价格管理',
      }],
    }];
  } else {
    return [{
      single: true,
      key: 'tms-2',
      path: '/transport/tracking',
      icon: 'zmdi zmdi-eye',
      text: '追踪',
    }];
  }
}
@injectIntl
@connect(
  state => ({
    aspect: state.account.aspect,
  })
)
export default class Transport extends React.Component {
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
