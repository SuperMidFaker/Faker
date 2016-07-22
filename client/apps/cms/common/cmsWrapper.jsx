import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import AmLeftSidebar from 'client/components/am-ant-leftbar';
import { TENANT_ASPECT } from 'common/constants';
@connect(
  state => ({
    aspect: state.account.aspect,
  })
)
export default class CmsWrapper extends React.Component {
  static propTypes = {
    type: PropTypes.oneOf(['import', 'export']),
    location: PropTypes.object.isRequired,
    aspect: PropTypes.number.isRequired,
    children: PropTypes.object,
  };
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillMount() {
    const { aspect, type, location } = this.props;
    let pathname = location.pathname.substr(1);
    // todo pathname equal
    if (pathname[pathname.length - 1] === '/') {
      pathname = pathname.substr(0, pathname.length - 1);
    }
    if (pathname === type) {
      if (aspect === TENANT_ASPECT.SP) {
        this.context.router.push(`/${type}/accept`);
      } else {
        this.context.router.push(`/${type}/delegate`);
      }
    }
  }
  render() {
    const { type, location, children, aspect } = this.props;
    let linkMenus;
    if (aspect === TENANT_ASPECT.SP) {
      linkMenus = [{
        single: true,
        key: `${type}-0`,
        path: `/${type}/accept`,
        icon: 'zmdi zmdi-inbox',
        text: '受理',
      }, {
        single: true,
        key: `${type}-1`,
        path: `/${type}/declare`,
        icon: 'zmdi zmdi-file-text',
        text: '制单',
      }, {
        single: true,
        key: `${type}-3`,
        path: `/${type}/manage`,
        icon: 'zmdi zmdi-storage',
        text: '管理',
      }];
    } else {
      linkMenus = [{
        single: true,
        key: `${type}-4`,
        path: `/${type}/delegate`,
        icon: 'zmdi zmdi-storage',
        text: '委托',
      }];
    }
    return (
      <div className="am-content">
        <AmLeftSidebar location={location} links={linkMenus} />
        {children}
      </div>
    );
  }
}
