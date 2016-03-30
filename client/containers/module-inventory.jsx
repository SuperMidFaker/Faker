import React, { PropTypes } from 'react';
import AmLeftSidebar from '../components/am-ant-leftbar';

export default class Inventory extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired
  };
  render() {
    const linkMenus = [{
      single: true,
      key: 'wewms-1',
      path: '/warehouse',
      icon: 's7-refresh-cloud',
      text: '仓库'
    }, {
      single: false,
      key: 'wewms-6',
      icon: 's7-diamond',
      text: 'UI elements',
      sublinks: [{
        key: 'ui-1',
        path: '/login',
        text: 'Login'
      }, {
        key: 'ui-2',
        path: '/',
        text: 'Home'
      }, {
        key: 'ui-3',
        path: '/bill',
        text: 'Panels'
      }, {
        key: 'ui-5',
        path: '/wms',
        text: 'Modals'
      }, {
        key: 'ui-4',
        path: '/wms',
        text: 'Modals'
      }]
    }, {
      single: false,
      key: 'wewms-3',
      icon: 's7-monitor',
      text: '控制台',
      sublinks: [{
        key: 'dashboard-1',
        path: '/bill',
        text: '控制台1'
      }, {
        key: 'dashboard-2',
        path: '/bill',
        text: '控制台2'
      }, {
        key: 'dashboard-3',
        path: '/bill',
        text: '控制台3'
      }]
    }, {
      single: false,
      key: 'wewms-9',
      icon: 's7-ribbon',
      text: 'Forms',
      sublinks: [{
        key: 'form-1',
        path: '/bill',
        text: 'General'
      }, {
        key: 'form-2',
        path: '/bill',
        text: 'Alerts'
      }, {
        key: 'form-3',
        path: '/bill',
        text: 'Panels'
      }]
    }, {
      single: true,
      key: 'wewms-13',
      path: '/wms/notice',
      icon: 's7-refresh-cloud',
      text: '通知'
    }, {
      single: true,
      key: 'wewms-14',
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
