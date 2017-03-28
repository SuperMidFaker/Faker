import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Table, Popconfirm, Icon } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import SubCustomerModal from './modals/subCustomerModal';
import { showSubCustomerModal, deleteCustomer } from 'common/reducers/crmCustomers';
import { PARTNER_ROLES } from 'common/constants';

const formatMsg = format(messages);


@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { deleteCustomer, showSubCustomerModal }
)
@connectNav({
  depth: 2,
  moduleName: 'scof',
})

export default class SubCustomerList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    deleteCustomer: PropTypes.func.isRequired,
    showSubCustomerModal: PropTypes.func.isRequired,
    customer: PropTypes.object.isRequired,
  }
  state = {
    currentPage: 1,
  }
  msg = key => formatMsg(this.props.intl, key)
  handleDelCustomer = (id) => {
    this.props.deleteCustomer(id, PARTNER_ROLES.CUS);
  }
  handlePageChange = (page) => {
    this.setState({ currentPage: page });
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
        <Table size="middle" dataSource={customer.subCustomers} columns={columns} showHeader={false}
          pagination={{ current: this.state.currentPage, defaultPageSize: 15, onChange: this.handlePageChange }} rowKey="id"
        />
        <SubCustomerModal onOk={() => this.handleTableLoad()} />
      </Card>
    );
  }
}
