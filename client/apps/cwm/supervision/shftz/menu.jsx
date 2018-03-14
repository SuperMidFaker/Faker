import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Menu } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import NavLink from 'client/components/NavLink';
import { format } from 'client/common/i18n/helpers';
import { switchDefaultWhse } from 'common/reducers/cwmContext';
import WhseSelect from '../../common/whseSelect';
import messages from './message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    whses: state.cwmContext.whses,
    whse: state.cwmContext.defaultWhse,
    listFilter: state.cwmShFtz.listFilter,
  }),
  { switchDefaultWhse }
)
export default class ModuleMenu extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    currentKey: PropTypes.string,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = key => formatMsg(this.props.intl, key);
  handleWhseChange = () => {
    this.context.router.push('/cwm/supervision/shftz/entry');
  }
  render() {
    const { currentKey } = this.props;
    return (
      <div>
        <div className="toolbar">
          <WhseSelect bonded onChange={this.handleWhseChange} />
        </div>
        <Menu
          defaultSelectedKeys={[currentKey]}
          mode="inline"
        >
          <Menu.ItemGroup key="g_in" title="入库">
            <Menu.Item key="bondedEntry">
              <NavLink to="/cwm/supervision/shftz/entry">{this.msg('ftzBondedEntryReg')}</NavLink>
            </Menu.Item>
          </Menu.ItemGroup>
          <Menu.ItemGroup key="g_out" title="出库">
            <Menu.Item key="relNormal">
              <NavLink to="/cwm/supervision/shftz/release/normal">{this.msg('ftzRelNormalReg')}</NavLink>
            </Menu.Item>
            <Menu.Item key="normalDecl">
              <NavLink to="/cwm/supervision/shftz/decl/normal">{this.msg('ftzNormalDecl')}</NavLink>
            </Menu.Item>
            <Menu.Item key="relPortion">
              <NavLink to="/cwm/supervision/shftz/release/portion">{this.msg('ftzRelPortionReg')}</NavLink>
            </Menu.Item>
            <Menu.Item key="batchDecl">
              <NavLink to="/cwm/supervision/shftz/decl/batch">{this.msg('ftzBatchDecl')}</NavLink>
            </Menu.Item>
          </Menu.ItemGroup>
          <Menu.ItemGroup key="g_transfer" title="移库">
            <Menu.Item key="transferin">
              <NavLink to="/cwm/supervision/shftz/transfer/in">{this.msg('ftzTransferIn')}</NavLink>
            </Menu.Item>
            <Menu.Item key="transferout">
              <NavLink to="/cwm/supervision/shftz/transfer/out">{this.msg('ftzTransferOut')}</NavLink>
            </Menu.Item>
            <Menu.Item key="transferself">
              <NavLink to="/cwm/supervision/shftz/transfer/self">{this.msg('ftzTransferSelf')}</NavLink>
            </Menu.Item>
          </Menu.ItemGroup>
          <Menu.ItemGroup key="g_stock" title="库存">
            <Menu.Item key="stock">
              <NavLink to="/cwm/supervision/shftz/stock">{this.msg('ftzBondedStock')}</NavLink>
            </Menu.Item>
            <Menu.Item key="nonbonded">
              <NavLink to="/cwm/supervision/shftz/stock/nonbonded">{this.msg('ftzNonbondedStock')}</NavLink>
            </Menu.Item>
          </Menu.ItemGroup>
          <Menu.ItemGroup key="g_cargo" title="货物监管">
            <Menu.Item key="cargo">
              <NavLink to="/cwm/supervision/shftz/cargo">{this.msg('ftzCargoReg')}</NavLink>
            </Menu.Item>
          </Menu.ItemGroup>
        </Menu>
      </div>);
  }
}
