import React, { PropTypes } from 'react';
import { Menu } from 'antd';
import CustomerListContainer from '../containers/CustomerListContainer';
import SupplierListContainer from '../containers/SupplierListContainer';
import ProviderListContainer from '../containers/ProviderListContainer';
import InvitationListContainer from '../containers/InvitationListContainer';

const MenuItem = Menu.Item;

export default function Main(props) {
  const { selectedMenuItemKey, onMenuItemClick } = props;
  const content = [<CustomerListContainer />, <SupplierListContainer />, <div></div>, <ProviderListContainer />, <InvitationListContainer />]
    .map((container, index) => <div style={{ display: index === parseInt(selectedMenuItemKey, 10) ? 'block' : 'none' }} key={index}>{container}</div>);
  return (
    <div>
      <header className="top-bar">
        <Menu selectedKeys={[selectedMenuItemKey]} mode="horizontal" onClick={onMenuItemClick}>
          <MenuItem key="0">客户</MenuItem>
          <MenuItem key="1">供应商</MenuItem>
          <MenuItem key="3">物流提供商</MenuItem>
          <MenuItem key="4">邀请伙伴</MenuItem>
        </Menu>
      </header>
      {content}
    </div>
  );
}

Main.propTypes = {
  selectedMenuItemKey: PropTypes.string.isRequired,        // 当前选中的Menu Itemm key
  onMenuItemClick: PropTypes.func.isRequired,            // Menu Item 被点击时执行的回调函数
};
