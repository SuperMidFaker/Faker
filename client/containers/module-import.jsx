import React, { PropTypes } from 'react';
import AmLeftSidebar from '../components/am-ant-leftbar';

export default class ImportM extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired
  };
  render() {
    const linkMenus = [{
      single: true,
      key: 'import-1',
      path: '/import/',
      icon: 's7-refresh-cloud',
      text: '工作台'
    }, {
      single: true,
      key: 'import-2',
      path: '/import/delegate',
      icon: 's7-refresh-cloud',
      text: '业务委托'
    }, {
      single: true,
      key: 'import-3',
      path: '/import/passage',
      icon: 's7-refresh-cloud',
      text: '通关作业'
    }, {
      single: true,
      key: 'import-4',
      path: '/import/tracking',
      icon: 's7-refresh-cloud',
      text: '业务跟踪'
    }, {
      single: true,
      key: 'import-5',
      path: '/import/billing',
      icon: 's7-refresh-cloud',
      text: '计费账单'
    }, {
      single: true,
      key: 'import-6',
      path: '/wms/setting',
      icon: 's7-settings',
      text: '设置'
    }];
    return (
      <div className="am-content">
        <AmLeftSidebar links={ linkMenus } />
        {this.props.children}
      </div>);
  }
}
