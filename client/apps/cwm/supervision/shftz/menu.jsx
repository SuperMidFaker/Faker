import React from 'react';
import PropTypes from 'prop-types';
import { Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from 'client/components/NavLink';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
export default class ModuleMenu extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    currentKey: PropTypes.string,
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { currentKey } = this.props;
    return (
      <Menu
        defaultSelectedKeys={[currentKey]}
        mode="inline"
      >
        <Menu.ItemGroup key="g_in" title="入库">
          <Menu.Item key="entry">
            <NavLink to="/cwm/supervision/shftz/entry">{this.msg('ftzEntryReg')}</NavLink>
          </Menu.Item>
          <Menu.Item key="transferin">
            <NavLink to="/cwm/supervision/shftz/transfer/in">{this.msg('ftzTransferIn')}</NavLink>
          </Menu.Item>
        </Menu.ItemGroup>
        <Menu.ItemGroup key="g_out" title="出库">
          <Menu.Item key="release">
            <NavLink to="/cwm/supervision/shftz/release">{this.msg('ftzReleaseReg')}</NavLink>
          </Menu.Item>
          <Menu.Item key="transferout">
            <NavLink to="/cwm/supervision/shftz/transfer/out">{this.msg('ftzTransferOut')}</NavLink>
          </Menu.Item>
          <Menu.Item key="clearance">
            <NavLink to="/cwm/supervision/shftz/clearance">{this.msg('ftzClearance')}</NavLink>
          </Menu.Item>
          <Menu.Item key="batch">
            <NavLink to="/cwm/supervision/shftz/batch">{this.msg('ftzBatchDecl')}</NavLink>
          </Menu.Item>
        </Menu.ItemGroup>
        <Menu.ItemGroup key="g_stock" title="库存">
          <Menu.Item key="stock">
            <NavLink to="/cwm/supervision/shftz/stock">{this.msg('ftzStock')}</NavLink>
          </Menu.Item>
          <Menu.Item key="transferself">
            <NavLink to="/cwm/supervision/shftz/transfer/self">{this.msg('ftzTransferSelf')}</NavLink>
          </Menu.Item>
        </Menu.ItemGroup>
        <Menu.ItemGroup key="g_cargo" title="货物监管">
          <Menu.Item key="cargo">
            <NavLink to="/cwm/supervision/shftz/cargo">{this.msg('ftzCargoReg')}</NavLink>
          </Menu.Item>
        </Menu.ItemGroup>
      </Menu>);
  }
}
