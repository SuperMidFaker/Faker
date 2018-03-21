import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Button, Icon, Layout, Menu } from 'antd';
import ButtonToggle from 'client/components/ButtonToggle';
import DockPanel from 'client/components/DockPanel';
import Drawer from 'client/components/Drawer';

import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import BuyerBillTable from './buyerBillTable';
import SellerBillTable from './sellerBillTable';
import PendingTable from './pendingTable';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;

@connectFetch()()
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    loginName: state.account.username,
  }),
  { }
)
@connectNav({
  depth: 2,
  moduleName: 'bss',
})
export default class BillList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    extraVisible: false,
    currentTab: 'buyerBill',
    mode: 'pendingExpense',
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)

  handleFilterMenuClick = (ev) => {
    this.setState({ mode: ev.key });
  }
  handleTabChange = (key) => {
    this.setState({ currentTab: key });
  }
  handleSearch = (value) => {
    const filters = { ...this.props.filters, name: value };
    const whseCode = this.props.defaultWhse.code;
    this.props.loadAsnLists({
      whseCode,
      tenantId: this.props.tenantId,
      pageSize: this.props.asnlist.pageSize,
      current: 1,
      filters,
    });
  }
  handleDetail = (row) => {
    const link = `/bss/bill/${row.order_rel_no}`;
    this.context.router.push(link);
  }
  handleCheck = (row) => {
    const link = `/bss/bill/check/${row.order_rel_no}`;
    this.context.router.push(link);
  }
  toggleExtra = () => {
    this.setState({ extraVisible: !this.state.extraVisible });
  }
  renderDataTable() {
    const { currentTab, mode } = this.state;
    if (mode === 'pendingExpense') {
      return <PendingTable />;
    }
    if (currentTab === 'buyerBill') {
      return <BuyerBillTable />;
    } else if (currentTab === 'sellerBill') {
      return <SellerBillTable />;
    }
    return null;
  }
  render() {
    const menus = [
      {
        key: 'buyerBill',
        menu: this.msg('buyerBill'),
        default: true,
      },
      {
        key: 'sellerBill',
        menu: this.msg('sellerBill'),
      },
    ];
    const primaryAction = (<Button type="primary" icon="plus" onClick={this.handleCreate}>
      {this.msg('新建账单')}
    </Button>);
    const secondaryAction = <Button>导出</Button>;
    return (
      <Layout>
        <PageHeader
          title={this.msg('bill')}
          menus={menus}
          onTabChange={this.handleTabChange}
        >
          <PageHeader.Actions>
            {primaryAction}
            {secondaryAction}
            <ButtonToggle icon="ellipsis" onClick={this.toggleExtra} state={this.state.extraVisible} />
          </PageHeader.Actions>
        </PageHeader>
        <Layout>
          <Drawer width={160}>
            <Menu mode="inline" selectedKeys={[this.state.mode]} onClick={this.handleFilterMenuClick}>
              <Menu.Item key="pendingExpense">
                {this.msg('pendingExpense')}
              </Menu.Item>
              <Menu.Item key="offlineBill">
                {this.msg('offlineBill')}
              </Menu.Item>
              <Menu.ItemGroup key="onlineBill" title={this.msg('onlineBill')}>
                <Menu.Item key="draft">
                  <Icon type="inbox" /> {this.msg('statusDraft')}
                </Menu.Item>
                <Menu.Item key="checking">
                  <Icon type="swap" /> {this.msg('statusChecking')}
                </Menu.Item>
                <Menu.Item key="accepted">
                  <Icon type="check-square-o" /> {this.msg('statusAccepted')}
                </Menu.Item>
              </Menu.ItemGroup>
            </Menu>
          </Drawer>
          <Content className="page-content" key="main">
            {this.renderDataTable()}
          </Content>
          <DockPanel
            title={this.gmsg('extraMenu')}
            mode="inner"
            size="small"
            visible={this.state.extraVisible}
            onClose={this.toggleExtra}
          >
            <Menu mode="inline" selectedKeys={[this.state.status]} onClick={this.handleExtraMenuClick}>
              <Menu.ItemGroup key="views" title={this.gmsg('views')}>
                <Menu.Item key="table">
                  <Icon type="table" /> {this.gmsg('tableView')}
                </Menu.Item>
                <Menu.Item key="board" disabled>
                  <Icon type="layout" /> {this.gmsg('boardView')}
                </Menu.Item>
              </Menu.ItemGroup>
              <Menu.ItemGroup key="settings" title={this.gmsg('settings')}>
                <Menu.Item key="rules">
                  <Icon type="tool" /> {this.msg('billTemplates')}
                </Menu.Item>
              </Menu.ItemGroup>
            </Menu>
          </DockPanel>
        </Layout>
      </Layout>
    );
  }
}
