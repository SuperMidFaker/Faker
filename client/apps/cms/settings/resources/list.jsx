import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import connectFetch from 'client/common/decorators/connect-fetch';
import { Layout, Table, Input, Breadcrumb, Tabs, Form } from 'antd';
import TradersPane from './tabpane/tradersPane';
import ManifestRulesPane from './tabpane/manifestRulesPane';
import DocuTemplatesPane from './tabpane/docuTemplatesPane';
import { formatMsg } from './message.i18n';
import { loadPartners } from 'common/reducers/partner';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
import { setResTabkey, setCustomer } from 'common/reducers/cmsResources';

const { Header, Content, Sider } = Layout;
const Search = Input.Search;
const TabPane = Tabs.TabPane;

function fetchData({ state, dispatch }) {
  return dispatch(loadPartners({
    tenantId: state.account.tenantId,
    role: PARTNER_ROLES.CUS,
    businessType: PARTNER_BUSINESSE_TYPES.clearance,
  }));
}
@connectFetch()(fetchData)
@injectIntl
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    customers: state.partner.partners,
    tabkey: state.cmsResources.tabkey,
    customer: state.cmsResources.customer,
  }),
  { setResTabkey, setCustomer }
)
@Form.create()
export default class ResourcesList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tabkey: PropTypes.string.isRequired,
  }
  state = {
    collapsed: false,
    currentPage: 1,
    customers: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.customers !== this.props.customers && !this.props.customer.id) {
      const customer = nextProps.customers.length === 0 ? {} : nextProps.customers[0];
      this.handleRowClick(customer);
    }
    this.setState({ customers: nextProps.customers });
  }
  handleRowClick = (record) => {
    this.props.setCustomer(record);
  }
  handleTabChange = (tabkey) => {
    this.props.setResTabkey(tabkey);
  }
  handleSearch = (value) => {
    let customers = this.props.customers;
    if (value) {
      customers = this.props.customers.filter((item) => {
        const reg = new RegExp(value);
        return reg.test(item.name) || reg.test(item.id);
      });
    }
    this.setState({ customers, currentPage: 1 });
  }
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  }
  msg = formatMsg(this.props.intl)
  render() {
    const { customer } = this.props;
    const columns = [{
      dataIndex: 'name',
      key: 'name',
      render: o => (<span className="menu-sider-item">{o}</span>),
    }];
    return (
      <Layout>
        <Sider width={320} className="menu-sider" key="sider" trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >
          <div className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                设置
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                资源设置
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <div className="toolbar">
              <Search onSearch={this.handleSearch} placeholder={this.msg('searchPlaceholder')} size="large" />
            </div>
            <div className="list-body">
              <Table size="middle" columns={columns} dataSource={this.state.customers} showHeader={false} onRowClick={this.handleRowClick}
                pagination={{ current: this.state.currentPage, defaultPageSize: 15, onChange: this.handlePageChange }}
                rowClassName={record => record.id === customer.id ? 'table-row-selected' : ''} rowKey="code"
              />
            </div>
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {customer.name}
              </Breadcrumb.Item>
            </Breadcrumb>
          </Header>
          <Content className="main-content">
            <div className="page-body tabbed">
              <Tabs activeKey={this.props.tabkey} onChange={this.handleTabChange}>
                <TabPane tab="收发货人" key="owners">
                  <TradersPane />
                </TabPane>
                <TabPane tab="制单规则" key="location">
                  <ManifestRulesPane />
                </TabPane>
                <TabPane tab="随附单据模板" key="dock">
                  <DocuTemplatesPane />
                </TabPane>
              </Tabs>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
