import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Button, Divider, Icon, Layout, Menu } from 'antd';
import ButtonToggle from 'client/components/ButtonToggle';
import DockPanel from 'client/components/DockPanel';
import Drawer from 'client/components/Drawer';
import { PARTNER_ROLES } from 'common/constants';
import { loadPartners } from 'common/reducers/partner';
import { toggleNewBillModal, reloadBillList, reloadOrderStatements } from 'common/reducers/bssBill';
import PageHeader from 'client/components/PageHeader';
import connectNav from 'client/common/decorators/connect-nav';
import BuyerBillTable from './buyerBillTable';
import SellerBillTable from './sellerBillTable';
import BuyerPendingTable from './buyerPendingTable';
import SellerPendingTable from './sellerPendingTable';
import NewBill from './modals/newBillModal';
import { formatMsg, formatGlobalMsg } from './message.i18n';

const { Content } = Layout;

@connectFetch()()
@injectIntl
@connect(
  state => ({
    aspect: state.account.aspect,
    listFilter: state.bssBill.listFilter,
    billListReload: state.bssBill.billListReload,
  }),
  {
    toggleNewBillModal, loadPartners, reloadBillList, reloadOrderStatements,
  }
)
@connectNav({
  depth: 2,
  moduleName: 'bss',
})
export default class BillList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    extraVisible: false,
    currentTab: 'buyerBill',
  }
  componentDidMount() {
    if (this.props.aspect === 0) {
      this.handleTabChange('sellerBill');
      this.props.loadPartners({ role: [PARTNER_ROLES.SUP] });
    } else {
      this.props.loadPartners({ role: [PARTNER_ROLES.CUS, PARTNER_ROLES.SUP] });
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.listReload) {
      if (nextProps.listFilter.status === 'pendingExpense') {
        this.props.reloadOrderStatements();
      } else {
        this.props.reloadBillList();
      }
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleFilterMenuClick = (ev) => {
    const filter = { ...this.props.listFilter, status: ev.key };
    this.props.reloadBillList(filter);
  }
  handleTabChange = (key) => {
    this.setState({ currentTab: key });
  }
  handleDetail = (row) => {
    const link = `/bss/bill/${row.order_rel_no}`;
    this.context.router.push(link);
  }
  handleCheck = (row) => {
    const link = `/bss/bill/reconcile/${row.order_rel_no}`;
    this.context.router.push(link);
  }
  toggleExtra = () => {
    this.setState({ extraVisible: !this.state.extraVisible });
  }
  handleExtraMenuClick = (ev) => {
    if (ev.key === 'templates') {
      const link = '/bss/bill/templates';
      this.context.router.push(link);
    }
  }
  handleCreate = () => {
    this.props.toggleNewBillModal(true);
  }
  renderDataTable() {
    const { currentTab } = this.state;
    const mode = this.props.listFilter.status;
    if (mode === 'pendingExpense') {
      if (currentTab === 'sellerBill') {
        return <SellerPendingTable />;
      } else if (currentTab === 'buyerBill') {
        return <BuyerPendingTable />;
      }
    }
    if (currentTab === 'buyerBill') {
      return <BuyerBillTable />;
    } else if (currentTab === 'sellerBill') {
      return <SellerBillTable />;
    }
    return null;
  }
  render() {
    let menus = [
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
    const { aspect } = this.props;
    if (aspect === 0) {
      menus = [{
        key: 'sellerBill',
        menu: this.msg('sellerBill'),
        default: true,
      }];
    }
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
            <Menu mode="inline" selectedKeys={[this.props.listFilter.status]} onClick={this.handleFilterMenuClick}>
              <Menu.Item key="pendingExpense">
                {this.msg('pendingExpense')}
              </Menu.Item>
              <Divider />
              <Menu.Item key="processingBills">
                {this.msg('processingBills')}
              </Menu.Item>
              <Menu.ItemGroup key="billStatus" title={this.msg('billStatus')}>
                <Menu.Item key="draft">
                  <Icon type="inbox" /> {this.msg('statusDraft')}
                </Menu.Item>
                <Menu.Item key="reconciling">
                  <Icon type="swap" /> {this.msg('statusReconciling')}
                </Menu.Item>
                <Menu.Item key="writeOff">
                  <Icon type="check-square-o" /> {this.msg('statusWriteOff')}
                </Menu.Item>
              </Menu.ItemGroup>
              <Divider />
              <Menu.Item key="writtenOffBills">
                {this.msg('writtenOffBills')}
              </Menu.Item>
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
                <Menu.Item key="templates">
                  <Icon type="tool" /> {this.msg('billTemplates')}
                </Menu.Item>
              </Menu.ItemGroup>
            </Menu>
          </DockPanel>
          <NewBill />
        </Layout>
      </Layout>
    );
  }
}
