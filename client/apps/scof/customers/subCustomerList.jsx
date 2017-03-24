import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Table, Popconfirm, Icon } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import SubCustomerModal from './modals/subCustomerModal';
import { loadSubCustomers, showSubCustomerModal, deleteCustomer } from 'common/reducers/crmCustomers';
import { PARTNER_ROLES } from 'common/constants';

const formatMsg = format(messages);

function fetchData({ state, dispatch }) {
  return dispatch(loadSubCustomers({
    tenantId: state.account.tenantId,
  }));
}
@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    subCustomers: state.crmCustomers.subCustomers,
  }),
  { loadSubCustomers, deleteCustomer, showSubCustomerModal }
)
@connectNav({
  depth: 2,
  moduleName: 'scof',
})

export default class SubCustomerList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    loadSubCustomers: PropTypes.func.isRequired,
    deleteCustomer: PropTypes.func.isRequired,
    showSubCustomerModal: PropTypes.func.isRequired,
    customer: PropTypes.object.isRequired,
    subCustomers: PropTypes.array.isRequired,
  }
  state = {
    currentPage: 1,
    unchanged: true,
    customers: [],
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.customer.id !== this.props.customer.id) {
      this.handleTableLoad(nextProps);
    }
    this.setState({ customers: nextProps.subCustomers });
  }
  msg = key => formatMsg(this.props.intl, key)

  handleRowClick = (record) => {
    this.setState({
      customer: record,
      unchanged: true,
    });
  }
  handleTableLoad = (props) => {
    this.props.loadSubCustomers({
      tenantId: this.props.tenantId,
      parentId: props ? props.customer.id : this.props.customer.id,
    });
  }
  handleDelCustomer = (id) => {
    this.props.deleteCustomer(id, PARTNER_ROLES.CUS).then(() => {
      this.handleTableLoad();
    });
  }
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
  }
  handleSearch = (value) => {
    const customers = this.props.subCustomers.filter((item) => {
      if (value) {
        const reg = new RegExp(value);
        return reg.test(item.name);
      } else {
        return true;
      }
    });
    this.setState({ customers, currentPage: 1 });
  }
  render() {
    const { customer } = this.props;
    const columns = [{
      dataIndex: 'name',
      key: 'name',
      render: o => (<div style={{ paddingLeft: 15 }}>{o}</div>),
    }, {
      dataIndex: 'option',
      key: 'option',
      width: 60,
      render: (col, row) => (
        <span>
          <a onClick={() => this.props.showSubCustomerModal('edit', row)}><Icon type="edit" /></a>
          <span className="ant-divider" />
          <Popconfirm title="确认删除该子客户?" onConfirm={() => this.handleDelCustomer(row.id)}>
            <a role="button"><Icon type="delete" /></a>
          </Popconfirm>
        </span>
        ),
    }];
    return (
      <Card
        bodyStyle={{ padding: 0, backgroundColor: '#fff' }}
        className="aside-card"
        title={this.msg('subCustomer')}
        extra={<a href="#" onClick={() => this.props.showSubCustomerModal('add', customer)}>添加</a>}
      >
        <Table size="middle" dataSource={this.state.customers} columns={columns} showHeader={false} onRowClick={this.handleRowClick}
          pagination={{ current: this.state.currentPage, defaultPageSize: 15, onChange: this.handlePageChange }}
        />
        <SubCustomerModal onOk={() => this.handleTableLoad()} />
      </Card>
    );
  }
}
