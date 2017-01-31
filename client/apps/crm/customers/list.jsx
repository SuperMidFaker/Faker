import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Tabs, Table, Menu, Dropdown, Layout } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import Profile from './profile';
import BusinessModel from './businessModel';
import CustomerModal from './customerModal';
import { loadCustomers, showCustomerModal, deleteCustomer } from 'common/reducers/crmCustomers';
import { PARTNER_ROLES } from 'common/constants';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;

function fetchData({ state, dispatch }) {
  return dispatch(loadCustomers({
    tenantId: state.account.tenantId,
  }));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    customers: state.crmCustomers.customers,
    loaded: state.crmCustomers.loaded,
  }),
  { loadCustomers, deleteCustomer, showCustomerModal }
)
@connectNav({
  depth: 2,
  moduleName: 'customer',
})
export default class List extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loaded: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    customers: PropTypes.array.isRequired,
    loadCustomers: PropTypes.func.isRequired,
    deleteCustomer: PropTypes.func.isRequired,
    showCustomerModal: PropTypes.func.isRequired,
  }
  state = {
    customerModalVisible: false,
    customer: {},
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ customer: nextProps.customers[0] || {} });
    if (!nextProps.loaded) {
      this.handleTableLoad();
    }
  }
  msg = key => formatMsg(this.props.intl, key)

  handleRowClick = (record) => {
    this.setState({ customer: record });
  }
  handleTableLoad = () => {
    this.props.loadCustomers({
      tenantId: this.props.tenantId,
    });
  }
  handleOptionClick = (e) => {
    if (e.key === 'remove') {
      this.props.deleteCustomer(this.state.customer.id, PARTNER_ROLES.CUS);
    }
  }
  render() {
    const { customer } = this.state;
    const columns = [{
      dataIndex: 'name',
      key: 'name',
      render: o => (<div style={{ paddingLeft: 15 }}>{o}</div>),
    }];
    const menu = (
      <Menu onClick={this.handleOptionClick}>
        <Menu.Item key="remove">删除</Menu.Item>
      </Menu>
    );
    const operations = (
      <Dropdown.Button overlay={menu} onClick={() => this.props.showCustomerModal('edit', customer)}>
        修 改
      </Dropdown.Button>
    );
    return (
      <QueueAnim type={['bottom', 'up']}>
        <Header className="top-bar" key="header">
          <Breadcrumb>
            <Breadcrumb.Item>
              {this.msg('customer')}
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              {customer.name}
            </Breadcrumb.Item>
          </Breadcrumb>
        </Header>
        <Content className="main-content" key="main">
          <div className="page-body">
            <Layout style={{ padding: '24px 0', background: '#fff' }}>
              <Sider width={360} style={{ background: '#fff', borderRight: '1px solid #e9e9e9' }}>
                <div className="toolbar">
                  <div className="pull-right">
                    <Button type="primary" icon="plus-circle-o" onClick={() => this.props.showCustomerModal('add')}>
                      {this.msg('add')}
                    </Button>
                  </div>
                  <h3>客户列表</h3>
                </div>
                <Table size="middle" dataSource={this.props.customers} columns={columns} showHeader={false} onRowClick={this.handleRowClick} />
                <CustomerModal onOk={this.handleTableLoad} />
              </Sider>
              <Content style={{ padding: '0 24px', minHeight: 280 }}>
                <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
                  <Tabs.TabPane tab="企业资料" key="1"><Profile customer={customer} /></Tabs.TabPane>
                  <Tabs.TabPane tab="业务规则" key="2"><BusinessModel customer={customer} /></Tabs.TabPane>
                </Tabs>
              </Content>
            </Layout>
          </div>
        </Content>
      </QueueAnim>
    );
  }
}
