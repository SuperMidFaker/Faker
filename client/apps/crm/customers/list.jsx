import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Row, Col, Tabs, Table, Menu, Dropdown } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import Profile from './profile';
import CustomerModal from './customerModal';
import { loadCustomers, showCustomerModal } from 'common/reducers/crmCustomers';
import { deletePartner } from 'common/reducers/partner';

const formatMsg = format(messages);
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
  { loadCustomers, deletePartner, showCustomerModal }
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
    deletePartner: PropTypes.func.isRequired,
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
      this.props.deletePartner(this.state.customer.id, 'CUS').then(() => {
        this.handleTableLoad();
      });
    }
  }
  render() {
    const { customer } = this.state;
    const columns = [{
      dataIndex: 'name',
      key: 'name',
      render: (o) => {
        return (<div style={{ paddingLeft: 30 }}>{o}</div>);
      },
    }];
    const menu = (
      <Menu onClick={this.handleOptionClick}>
        <Menu.Item key="remove">删除</Menu.Item>
      </Menu>
    );
    const operations = (
      <Dropdown.Button overlay={menu} type="ghost" onClick={() => this.props.showCustomerModal('edit', customer)}>
        修 改
      </Dropdown.Button>
    );
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <div className="tools" />
          <span>{this.msg('customer')}</span>
        </header>
        <div className="main-content" key="main">
          <Row gutter={16}>
            <Col span={6}>
              <div className="page-body">
                <div className="panel-header">

                  <div className="pull-right">
                    <Button type="primary" icon="plus-circle-o" onClick={() => this.props.showCustomerModal('add')}>
                      {this.msg('add')}
                    </Button>
                  </div>
                  <h3>客户列表</h3>
                </div>
                <div className="panel-body table-panel" >
                  <Table dataSource={this.props.customers} columns={columns} showHeader={false} onRowClick={this.handleRowClick} />
                  <CustomerModal onOk={this.handleTableLoad} />
                </div>
              </div>
            </Col>
            <Col span={18}>
              <div className="page-body">
                <Tabs defaultActiveKey="1" tabBarExtraContent={operations}>
                  <Tabs.TabPane tab="企业资料" key="1"><Profile customer={customer} /></Tabs.TabPane>
                  <Tabs.TabPane tab="业务规则" key="2"><div /></Tabs.TabPane>
                </Tabs>
              </div>
            </Col>
          </Row>
        </div>
      </QueueAnim>
    );
  }
}
