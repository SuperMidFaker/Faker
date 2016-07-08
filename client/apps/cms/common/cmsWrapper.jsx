import React, { PropTypes } from 'react';
import AmLeftSidebar from 'client/components/am-ant-leftbar';

export default function CmsWrapper(props) {
  const { type, location, children } = props;
  const linkMenus = [{
    single: true,
    key: `${type}-0`,
    path: `/${type}/accept`,
    icon: 'zmdi zmdi-inbox',
    text: '受理'
  }, {
    single: true,
    key: `${type}-1`,
    path: `/${type}/declare`,
    icon: 'zmdi zmdi-file-text',
    text: '制单'
  }, {
    single: true,
    key: `${type}-3`,
    path: `/${type}/manage`,
    icon: 'zmdi zmdi-storage',
    text: '管理'
  }];
  return (
    <div className="am-content">
      <AmLeftSidebar location={location} links={ linkMenus } />
      {children}
    </div>
  );
}

CmsWrapper.propTypes = {
  type: PropTypes.oneOf(['import', 'export']),
  location: PropTypes.object.isRequired,
  children: PropTypes.object.isRequired
};
