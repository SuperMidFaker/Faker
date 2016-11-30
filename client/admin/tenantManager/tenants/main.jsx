import React, { Component, PropTypes } from 'react';
import { Menu } from 'antd';
import { connect } from 'react-redux';
import TenantList from './tenantList';
import TenantApplicationList from './tenantApplicationList';
import connectNav from 'client/common/decorators/connect-nav';
import { setMenuItemKey } from 'common/reducers/tenants';

const MenuItem = Menu.Item;

@connect(state => ({
  selectedMenuItemKey: state.tenants.selectedMenuItemKey,
}), { setMenuItemKey })
@connectNav({
  depth: 2,
  text: '租户管理',
  moduleName: 'tenants',
})
export default class Main extends Component {
  static propTyps = {
    selectedMenuItemKey: PropTypes.string.isRequired,  // 选中的menuItem keys
    setMenuItemKey: PropTypes.func.isRequired,        // itemItem点击后执行的回调函数,
  }
  handleMenuItemClick = (e) => {
    this.props.setMenuItemKey(e.key);
  }

  render() {
    const { selectedMenuItemKey } = this.props;
    const contents = [<TenantList />, <TenantApplicationList />];
    const menu = (
      <Menu mode="horizontal" selectedKeys={[selectedMenuItemKey]} onClick={this.handleMenuItemClick}>
        <MenuItem key="0">所有租户</MenuItem>
        <MenuItem key="1">租户申请</MenuItem>
      </Menu>
    );
    const content = contents[selectedMenuItemKey];
    return (
      <div>
        <header className="top-bar">
          {menu}
        </header>
        {content}
      </div>
    );
  }
}
