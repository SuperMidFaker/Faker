import React, { PropTypes } from 'react';
import AmLeftSidebar from '../components/am-ant-leftbar';

export default class Transport extends React.Component {
  static propTypes = {
    children: PropTypes.object.isRequired
  };
  render() {
    const linkMenus = [{
      single: true,
      key: 'tms-0',
      path: '/tms/',
      icon: 's7-display1',
      text: '工作台'
    }, {
      single: true,
      key: 'tms-1',
      path: '/tms/order',
      icon: 's7-next-2',
      text: '订单'
    }, {
      single: true,
      key: 'tms-2',
      path: '/tms/dispatch',
      icon: 's7-mail-open-file',
      text: '调度'
    }, {
      single: true,
      key: 'tms-3',
      path: '/tms/tracking',
      icon: 's7-note',
      text: '追踪'
    }, {
      single: true,
      key: 'tms-4',
      path: '/tms/invoicing',
      icon: 's7-look',
      text: '账单'
    }, {
      single: true,
      key: 'tms-5',
      path: '/tms/setting',
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
