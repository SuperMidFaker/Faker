import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Row, Col, Tabs, Table } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import QueueAnim from 'rc-queue-anim';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';
import Profile from './profile';
import CustomerModal from './customerModal';
import { loadCustomers } from 'common/reducers/crmCustomers';

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
  }),
  { loadCustomers }
)
@connectNav({
  depth: 2,
  moduleName: 'customer',
})
export default class List extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    customers: PropTypes.array.isRequired,
    loadCustomers: PropTypes.func.isRequired,
  }
  state = {
    customerModalVisible: false,
    customer: {},
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ customer: nextProps.customers[0] || {} });
  }
  msg = key => formatMsg(this.props.intl, key)
  toggleCustomerModal = () => {
    this.setState({ customerModalVisible: !this.state.customerModalVisible });
  }
  handleRowClick = (record) => {
    this.setState({ customer: record });
  }
  render() {
    const columns = [{
      dataIndex: 'name',
      key: 'name',
    }];
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
                    <Button type="primary" icon="plus-circle-o" onClick={this.toggleCustomerModal}>
                      {this.msg('add')}
                    </Button>
                  </div>
                  <h3>客户列表</h3>
                </div>
                <div className="panel-body table-panel" >
                  <Table dataSource={this.props.customers} columns={columns} showHeader={false} onRowClick={this.handleRowClick} />
                  <CustomerModal visible={this.state.customerModalVisible} toggle={this.toggleCustomerModal} />
                </div>
              </div>
            </Col>
            <Col span={18}>
              <div className="page-body">
                <h2>客户名称</h2>
                <Tabs defaultActiveKey="1">
                  <Tabs.TabPane tab="企业资料" key="1"><Profile customer={this.state.customer} /></Tabs.TabPane>
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
