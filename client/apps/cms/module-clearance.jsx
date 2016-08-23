import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import AmLeftSidebar from 'client/components/am-ant-leftbar';
import { TENANT_ASPECT } from 'common/constants';

function getLinksByAspect(aspect) {
  if (aspect === TENANT_ASPECT.SP) {
    return [{
      single: true,
      key: 'cms-0',
      path: '/clearance/import',
      icon: 'zmdi zmdi-sign-in',
      text: '进口',
    }, {
      single: true,
      key: 'cms-1',
      path: '/clearance/export',
      icon: 'zmdi zmdi-open-in-new',
      text: '出口',
    }, {
      single: true,
      key: 'cms-2',
      path: '/clearance/expense',
      icon: 'zmdi zmdi-money-box',
      text: '费用',
    }, {
      single: true,
      key: 'cms-3',
      path: '/clearance/manage',
      icon: 'zmdi zmdi-case',
      text: '管理',
    }, {
      single: true,
      key: 'cms-4',
      path: '/clearance/settings',
      icon: 'zmdi zmdi-settings',
      text: '设置',
    }];
  } else {
    return [{
      single: true,
      key: 'cms-3',
      path: '/transport/dispatch',
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
export default class clearance extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    aspect: PropTypes.number.isRequired,
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
  };
  render() {
    const { aspect } = this.props;
    const linkMenus = getLinksByAspect(aspect);
    return (
      <div className="am-content">
        <AmLeftSidebar links={linkMenus} location={this.props.location} />
        {this.props.children}
      </div>
    );
  }
}
