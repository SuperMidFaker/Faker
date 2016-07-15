import React, { PropTypes } from 'react';
import AmLeftSidebar from 'client/components/am-ant-leftbar';

export default class ExportM extends React.Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    children: PropTypes.object.isRequired,
  };
  render() {
    const linkMenus = [{
      single: true,
      key: 'export-0',
      path: '/export/',
      icon: 's7-display1',
      text: '看板',
    }, {
      single: true,
      key: 'export-1',
      path: '/export/delegate',
      icon: 's7-next-2',
      text: '报关委托',
    }, {
      single: true,
      key: 'export-2',
      path: '/export/accept',
      icon: 's7-mail-open-file',
      text: '报关受理',
    }, {
      single: true,
      key: 'export-3',
      path: '/export/task',
      icon: 's7-note',
      text: '通关作业',
    }, {
      single: true,
      key: 'export-4',
      path: '/export/tracking',
      icon: 's7-look',
      text: '通关追踪',
    }];
    return (
      <div className="am-content">
        <AmLeftSidebar links={linkMenus} location={this.props.location} />
        {this.props.children}
      </div>);
  }
}
