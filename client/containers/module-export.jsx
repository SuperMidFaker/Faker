import React, { PropTypes } from 'react';
import AmLeftSidebar from '../components/am-ant-leftbar';

export default class ExportM extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired
  };
  render() {
    const linkMenus = [{
      single: true,
      key: 'export-1',
      path: '/import/',
      icon: 's7-refresh-cloud',
      text: '工作台'
    }, {
      single: true,
      key: 'export-2',
      path: '/export/delegate',
      icon: 's7-refresh-cloud',
      text: '业务委托'
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
