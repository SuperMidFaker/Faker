import React, { PropTypes } from 'react';
import AmLeftSidebar from 'client/components/am-ant-leftbar';

export default function(type) {
  if (type !== 'import' && type !== 'export') {
    throw new Error(`type must be "import" or "export"`);
  }
  return class Sidebar extends React.Component {
    static propTypes = {
      location: PropTypes.object.isRequired,
      children: PropTypes.object.isRequired
    };
    render() {
      const linkMenus = [{
        single: true,
        key: 'import-0',
        path: `/${type}/accept`,
        text: '受理'
      }, {
        single: true,
        key: 'import-1',
        path: `/${type}/make`,
        text: '制单'
      }, {
        single: true,
        key: 'import-3',
        path: `/${type}/manage`,
        text: '管理'
      }];
      return (
        <div className="am-content">
          <AmLeftSidebar location={ this.props.location } links={ linkMenus } />
          {this.props.children}
        </div>);
    }
  };
}
