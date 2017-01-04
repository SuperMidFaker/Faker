import React, { PropTypes } from 'react';
import CollapseSideLayout from 'client/components/collapseSideLayout';

function getLinks() {
  return [{
    single: true,
    key: 'mng-0',
    path: '/manager',
    icon: 'zmdi zmdi-tv-list',
    text: '工作台',
  }, {
    single: true,
    key: 'mng-1',
    path: '/manager/tenants',
    icon: 'zmdi zmdi-inbox',
    text: '租户管理',
  }, {
    single: true,
    key: 'mng-4',
    path: '/manager/users',
    icon: 'zmdi zmdi-library',
    text: '用户管理',
  }, {
    single: true,
    key: 'mng-2',
    path: '/manager/logs',
    icon: 'zmdi zmdi-arrow-split',
    text: '操作日志',
  }, {
    single: true,
    key: 'mng-5',
    path: '/manager/settings',
    icon: 'zmdi zmdi-settings',
    text: '设置',
  }];
}

export default class PackManager extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
  };
  render() {
    const linkMenus = getLinks();
    return (
      <CollapseSideLayout links={linkMenus} childContent={this.props.children} location={this.props.location} showLogo />
    );
  }
}