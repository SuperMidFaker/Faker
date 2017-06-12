import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Form, Input, Row, Col, Table, Tooltip, Layout } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import ButtonToggle from 'client/components/ButtonToggle';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import ProfileCard from './cards/profileCard';
import CustomerModal from './modals/customerModal';
import { loadCustomers, showCustomerModal, deleteCustomer } from 'common/reducers/crmCustomers';
import { PARTNER_ROLES } from 'common/constants';
import OverviewCard from './cards/overviewCard';
import ResourcesCard from './cards/resourcesCard';
import ServiceCard from './cards/serviceCard';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;
const Search = Input.Search;

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
    loading: state.crmCustomers.loading,
    loaded: state.crmCustomers.loaded,
  }),
  { loadCustomers, deleteCustomer, showCustomerModal }
)
@connectNav({
  depth: 2,
  moduleName: 'scof',
})
@Form.create()
export default class CustomerList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    loaded: PropTypes.bool.isRequired,
    tenantId: PropTypes.number.isRequired,
    customers: PropTypes.array.isRequired,
    loadCustomers: PropTypes.func.isRequired,
    deleteCustomer: PropTypes.func.isRequired,
    showCustomerModal: PropTypes.func.isRequired,
    updateCustomerNames: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
  }
  state = {
    customerModalVisible: false,
    customer: {},
    currentPage: 1,
    collapsed: false,
    unchanged: true,
    customers: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.customers !== this.props.customers && !this.state.customer.id) {
      this.setState({
        customer: nextProps.customers.length === 0 ? {} : nextProps.customers[0],
      });
    }
    this.setState({ customers: nextProps.customers });
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
  handleInputChanged = () => {
    this.setState({ unchanged: false });
  }
  handleRowClick = (record) => {
    this.setState({
      customer: record,
      unchanged: true,
    });
    this.props.form.setFieldsValue(record);
  }
  handleTableLoad = () => {
    this.props.loadCustomers({
      tenantId: this.props.tenantId,
    });
  }
  handleDelCustomer = () => {
    this.props.deleteCustomer(this.state.customer.id, PARTNER_ROLES.CUS).then(() => {
      this.handleTableLoad();
    });
  }
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  }
  handleSearch = (value) => {
    let customers = this.props.customers;
    if (value) {
      customers = this.props.customers.filter((item) => {
        const reg = new RegExp(value);
        return reg.test(item.name);
      });
    }
    this.setState({ customers, currentPage: 1 });
  }
  handleSaveBtnClick = () => {
  }
  render() {
    const { customer } = this.state;
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
          <div className="left-sider-panel">
            <div className="top-bar">
              <Breadcrumb>
                <Breadcrumb.Item>
                  {this.msg('customer')}
                </Breadcrumb.Item>
              </Breadcrumb>
              <div className="pull-right">
                <Tooltip placement="bottom" title="新增客户">
                  <Button type="primary" shape="circle" icon="plus" onClick={() => this.props.showCustomerModal('add')} />
                </Tooltip>
              </div>
            </div>
            <div className="left-sider-panel">
              <div className="toolbar">
                <Search
                  placeholder={this.msg('searchPlaceholder')}
                  onSearch={this.handleSearch} size="large"
                />
              </div>
              <Table size="middle" dataSource={this.state.customers} columns={columns} showHeader={false} onRowClick={this.handleRowClick}
                pagination={{ current: this.state.currentPage, defaultPageSize: 15, onChange: this.handlePageChange }}
                rowClassName={record => record.id === customer.id ? 'table-row-selected' : ''} rowKey="id" loading={this.props.loading}
              />
              <CustomerModal onOk={this.handleTableLoad} />
            </div>
          </div>
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
            <ButtonToggle size="large"
              iconOn="menu-fold" iconOff="menu-unfold"
              onClick={this.toggle}
              toggle
            />
            <div className="top-bar-tools">
              <Button.Group size="large">
                <Button icon="left" />
                <Button icon="right" />
              </Button.Group>
              <Button size="large" type="primary" icon="save" disabled={this.state.unchanged} onClick={this.handleSaveBtnClick}>
                {this.msg('save')}
              </Button>
            </div>
          </Header>
          <Content className="main-content layout-fixed-width layout-fixed-width-lg">
            <Row gutter={16}>
              <Col sm={24} md={16}>
                <OverviewCard customer={customer} />
                <Row gutter={16}>
                  <Col sm={24} md={8}>
                    <ServiceCard />
                  </Col>
                  <Col sm={24} md={8}>
                    <ServiceCard />
                  </Col>
                  <Col sm={24} md={8}>
                    <ServiceCard />
                  </Col>
                </Row>
                <ResourcesCard customer={customer} />
              </Col>
              <Col sm={24} md={8}>
                <ProfileCard customer={customer} />
              </Col>
            </Row>
          </Content>
        </Layout>
      </Layout>
    );
  }
}