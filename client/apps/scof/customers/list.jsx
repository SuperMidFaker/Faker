import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Form, Row, Col, Table, Tooltip, Layout } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import ListContentLayout from 'client/components/ListContentLayout';
import PageHeader from 'client/components/PageHeader';
import { format } from 'client/common/i18n/helpers';
import { loadCustomers, showCustomerModal, deleteCustomer } from 'common/reducers/sofCustomers';
import { PARTNER_ROLES } from 'common/constants';
import TrimSpan from 'client/components/trimSpan';
import OverviewCard from './cards/overviewCard';
import ResourcesCard from './cards/resourcesCard';

import ProfileCard from './cards/profileCard';
import CustomerModal from './modals/customerModal';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Content } = Layout;

function fetchData({ state, dispatch }) {
  return dispatch(loadCustomers(state.account.tenantId));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    customers: state.sofCustomers.customers,
    loading: state.sofCustomers.loading,
    loaded: state.sofCustomers.loaded,
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
    customers: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number })).isRequired,
    loadCustomers: PropTypes.func.isRequired,
    deleteCustomer: PropTypes.func.isRequired,
    showCustomerModal: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
  }
  state = {
    customer: {},
    currentPage: 1,
    collapsed: false,
    unchanged: true,
    customers: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.customers !== this.props.customers) {
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
    this.props.loadCustomers(this.props.tenantId);
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
    let { customers } = this.props;
    if (value) {
      customers = this.props.customers.filter((item) => {
        const reg = new RegExp(value);
        return reg.test(item.name);
      });
    }
    this.setState({ customers, currentPage: 1 });
  }
  handleSave = () => {
  }
  renderListColumn() {
    const { customer } = this.state;
    const columns = [{
      dataIndex: 'name',
      key: 'name',
      render: o => (<span className="menu-sider-item"><TrimSpan text={o} maxLen={22} /></span>),
    }];
    return (
      <Table
        size="middle"
        dataSource={this.state.customers}
        columns={columns}
        showHeader={false}
        pagination={{
          current: this.state.currentPage,
          defaultPageSize: 50,
          onChange: this.handlePageChange,
        }}
        rowClassName={record => (record.id === customer.id ? 'table-row-selected' : '')}
        rowKey="id"
        loading={this.props.loading}
        onRow={record => ({
          onClick: () => { this.handleRowClick(record); },
        })}
      />);
  }
  render() {
    const { customer } = this.state;
    return (
      <ListContentLayout
        title={this.msg('customer')}
        action={<Tooltip placement="bottom" title="新增客户">
          <Button type="primary" shape="circle" icon="plus" onClick={() => this.props.showCustomerModal('add')} />
        </Tooltip>}
        list={this.renderListColumn()}
        onSearch={this.handleSearch}
      >
        <PageHeader title={customer.name}>
          <PageHeader.Actions>
            <Button type="primary" icon="save" disabled={this.state.unchanged} onClick={this.handleSave}>
              {this.msg('save')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content">
          <Row gutter={16}>
            <Col sm={24} md={16}>
              <OverviewCard customer={customer} />
              <ResourcesCard customer={customer} />
            </Col>
            <Col sm={24} md={8}>
              <ProfileCard customer={customer} />
            </Col>
          </Row>
        </Content>
        <CustomerModal onOk={this.handleTableLoad} />
      </ListContentLayout>
    );
  }
}
