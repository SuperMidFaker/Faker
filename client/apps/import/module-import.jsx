import React, { PropTypes } from 'react';
import AmLeftSidebar from 'client/components/am-ant-leftbar';

export default class ImportM extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired
  };
  render() {
    const linkMenus = [{
      single: true,
      key: 'import-0',
      path: '/import',
      icon: 's7-display1',
      text: '看板'
    }, {
      single: true,
      key: 'import-1',
      path: '/import/delegate',
      icon: 's7-next-2',
      text: '报关委托'
    }, {
      single: true,
      key: 'import-2',
      path: '/import/accept',
      icon: 's7-mail-open-file',
      text: '报关受理'
    }, {
      single: true,
      key: 'import-3',
      path: '/import/task',
      icon: 's7-note',
      text: '通关作业'
    }, {
      single: true,
      key: 'import-4',
      path: '/import/tracking',
      icon: 's7-look',
      text: '通关追踪'
    }];
    return (
      <div className="am-content">
        <AmLeftSidebar location={ this.props.location } links={ linkMenus } />
        {this.props.children}
      </div>);
  }
}
