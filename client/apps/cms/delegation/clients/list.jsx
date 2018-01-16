import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Card, Layout, Table, Icon, Input, Breadcrumb, Tabs, Form } from 'antd';
import { loadPartners } from 'common/reducers/partner';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
import { setResTabkey, setCustomer } from 'common/reducers/cmsResources';
import connectNav from 'client/common/decorators/connect-nav';
import connectFetch from 'client/common/decorators/connect-fetch';
import PageHeader from 'client/components/PageHeader';
import NavLink from 'client/components/NavLink';
import TradersPane from './tabpane/tradersPane';
import ManifestRulesPane from './tabpane/manifestRulesPane';
import DocuTemplatesPane from './tabpane/docuTemplatesPane';
import { formatMsg } from '../message.i18n';


const { Content, Sider } = Layout;
const { Search } = Input;
const { TabPane } = Tabs;

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
export default class ClientsList extends Component {
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
    let { customers } = this.props;
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
        <Sider
          width={320}
          className="menu-sider"
          key="sider"
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >
          <div className="page-header">
            <Breadcrumb>
              <Breadcrumb.Item>
                <NavLink to="/clearance/delegation">
                  <Icon type="left" /> {this.msg('delgManifest')}
                </NavLink>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {this.msg('clientSetting')}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="left-sider-panel">
            <div className="toolbar">
              <Search onSearch={this.handleSearch} placeholder={this.msg('searchPlaceholder')} />
            </div>
            <div className="list-body">
              <Table
                size="middle"
                columns={columns}
                dataSource={this.state.customers}
                showHeader={false}
                pagination={{
                  current: this.state.currentPage,
                  defaultPageSize: 15,
                  onChange: this.handlePageChange,
                }}
                rowClassName={record => (record.id === customer.id ? 'table-row-selected' : '')}
                rowKey="code"
                onRow={record => ({
                  onClick: () => { this.handleRowClick(record); },
                })}
              />
            </div>
          </div>
        </Sider>
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  {customer.name}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
          </PageHeader>
          <Content className="page-content">
            <Card bodyStyle={{ padding: 0 }}>
              <Tabs activeKey={this.props.tabkey} onChange={this.handleTabChange}>
                <TabPane tab="收发货人" key="traders">
                  <TradersPane />
                </TabPane>
                <TabPane tab="制单规则" key="rules">
                  <ManifestRulesPane />
                </TabPane>
                <TabPane tab="单据模板" key="templates">
                  <DocuTemplatesPane />
                </TabPane>
              </Tabs>
            </Card>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
