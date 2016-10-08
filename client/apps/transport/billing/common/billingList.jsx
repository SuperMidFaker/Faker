import React, { PropTypes } from 'react';
import { Table, Button } from 'antd';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import connectNav from 'client/common/decorators/connect-nav';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);
const rowSelection = {
  onSelect() {},
};
@injectIntl
@connectNav({
  depth: 2,
  moduleName: 'transport',
})
@connect(
  state => ({
    billing: state.transportBilling.billing,
  }),
  { }
)
export default class BillingList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    type: PropTypes.oneOf(['receivable', 'payable']),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values)
  handleAddBtnClicked = () => {
    this.context.router.push(`/transport/billing/${this.props.type}/create`);
  }
  render() {
    const dataSource = [{
      billingId: '1',
      name: '胡彦斌',
      age: 32,
      address: '西湖区湖底公园1号',
    }, {
      billingId: '2',
      name: '胡彦祖',
      age: 42,
      address: '西湖区湖底公园1号',
    }];

    const columns = [{
      title: '账单名称',
      dataIndex: 'name',
    }, {
      title: '开始日期',
      dataIndex: 'begin_date',
    }, {
      title: '结束日期',
      dataIndex: 'end_date',
    }, {
      title: '客户',
      dataIndex: 'customer',
    }, {
      title: '订单数量',
      dataIndex: 'num',
    }, {
      title: '运单总费用',
      dataIndex: 'total_charge',
    }, {
      title: '调整费用',
      dataIndex: 'adjust_charge',
    }, {
      title: '账单总金额',
      dataIndex: 'bill_amount',
    }, {
      title: '核销金额',
      dataIndex: 'cancel_charge',
    }, {
      title: '账单状态',
      dataIndex: 'status',
    }, {
      title: '操作',
      dataIndex: 'billingId',
      render: (o, record) => {
        return <Link to={`/transport/billing/checkBilling/${record.billingId}`}>{this.msg('checkBilling')}</Link>;
      },
    }];

    return (
      <div>
        <header className="top-bar">
          <span>{this.msg(this.props.type)}{this.msg('billing')}</span>
        </header>
        <div className="main-content">
          <div className="page-body">
            <div className="panel-header">
              <Button type="default" type="primary" onClick={this.handleAddBtnClicked}>{this.msg('createBilling')}</Button>
              <Button style={{ marginLeft: 16 }}>{this.msg('export')}</Button>
            </div>
            <div className="panel-body">
              <Table dataSource={dataSource} columns={columns} rowKey="billingId" />
            </div>
          </div>
        </div>
      </div>

    );
  }
}
