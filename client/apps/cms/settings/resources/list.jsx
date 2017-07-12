import React, { Component } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import connectNav from 'client/common/decorators/connect-nav';
import { Layout, Table, Input, Breadcrumb, Tabs, Form } from 'antd';
import TradersPane from './tabpane/tradersPane';
import ManifestRulesPane from './tabpane/manifestRulesPane';
import DocuTemplatesPane from './tabpane/docuTemplatesPane';
import { formatMsg } from './message.i18n';

const { Header, Content, Sider } = Layout;
const Search = Input.Search;
const TabPane = Tabs.TabPane;

@injectIntl
@connectNav({
  depth: 2,
  moduleName: 'clearance',
})
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,

  }),
  { }
)
@Form.create()
export default class ResourcesList extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    collapsed: false,
    currentPage: 1,
    customer: {},
    customerList: [],
  }

  msg = formatMsg(this.props.intl)

  render() {
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
              <Search placeholder={this.msg('searchPlaceholder')} size="large" />
            </div>
            <Table size="middle" columns={columns} dataSource={this.state.customerList} showHeader={false} onRowClick={this.handleRowClick}
              pagination={{ current: this.state.currentPage, defaultPageSize: 15 }}
              rowClassName={record => record.code === this.state.customer.code ? 'table-row-selected' : ''} rowKey="code"
            />
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.state.customer.name}
              </Breadcrumb.Item>
            </Breadcrumb>
          </Header>
          <Content className="main-content">
            <div className="page-body tabbed">
              <Tabs defaultActiveKey="owners">
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
