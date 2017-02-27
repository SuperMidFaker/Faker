import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Row, Col, Table, Layout } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import MainForm from './forms/mainForm';
import ProfileForm from './forms/profileForm';
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
  moduleName: 'scof',
})
export default class CustomerList extends React.Component {
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
    currentPage: 1,
    collapsed: false,
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ customer: nextProps.customers[0] || {} });
    if (!nextProps.loaded) {
      this.handleTableLoad();
    }
  }
  msg = key => formatMsg(this.props.intl, key)

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
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
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  }
  render() {
    const { customer } = this.state;
    const columns = [{
      dataIndex: 'name',
      key: 'name',
      render: o => (<div style={{ paddingLeft: 15 }}>{o}</div>),
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
                {this.msg('customer')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="pull-right">
              <Button type="primary" icon="plus-circle-o" onClick={() => this.props.showCustomerModal('add')}>
                {this.msg('add')}
              </Button>
            </div>
          </div>
          <Table size="middle" dataSource={this.props.customers} columns={columns} showHeader={false} onRowClick={this.handleRowClick}
            pagination={{ current: this.state.currentPage, defaultPageSize: 15, onChange: this.handlePageChange }}
          />
          <CustomerModal onOk={this.handleTableLoad} />
        </Sider>
        <Layout>
          <Header className="top-bar">
            { this.state.collapsed && <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('customer')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                {customer.name}
              </Breadcrumb.Item>
            </Breadcrumb>}
            <Button size="large"
              className={this.state.collapsed ? '' : 'btn-toggle-on'}
              icon={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
            <div className="top-bar-tools">
              <Button.Group size="large">
                <Button icon="left" />
                <Button icon="right" />
              </Button.Group>
            </div>
          </Header>
          <Content className="main-content layout-fixed-width layout-fixed-width-large">
            <Row gutter={16}>
              <Col sm={24} md={16}>
                <MainForm customer={customer} />
              </Col>
              <Col sm={24} md={8}>
                <ProfileForm customer={customer} />
                <BusinessModel customer={customer} />
              </Col>
            </Row>
          </Content>

        </Layout>
      </Layout>
    );
  }
}
