import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Table } from 'antd';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    expenses: state.cmsExpense.expenses,
  })
)
export default class ExpensePane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    expenses: PropTypes.object.isRequired,
  }
  msg = descriptor => formatMsg(this.props.intl, descriptor)
  render() {
    const { expenses } = this.props;
    const columns = [{
      title: this.msg('feeName'),
      dataIndex: 'fee_name',
      key: 'fee_name',
      width: '16.7%',
    }, {
      title: this.msg('charCount'),
      dataIndex: 'charge_count',
      key: 'charge_count',
      width: '16.7%',
    }, {
      title: this.msg('unitPrice'),
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: '16.7%',
    }, {
      title: this.msg('feeVal'),
      dataIndex: 'sum_fee',
      key: 'sum_fee',
      width: '16.7%',
    }, {
      title: this.msg('taxFee'),
      dataIndex: 'tax_fee',
      key: 'tax_fee',
      width: '16.7%',
      render: (o) => {
        return o.toFixed(2);
      },
    }, {
      title: this.msg('totalFee'),
      dataIndex: 'total_fee',
      key: 'total_fee',
      width: '16.7%',
      render: (o) => {
        return o.toFixed(2);
      },
    }];
    const cushColumns = [{
      title: this.msg('feeName'),
      dataIndex: 'fee_name',
      key: 'fee_name',
      width: '40%',
    }, {
      title: this.msg('totalFee'),
      dataIndex: 'total_fee',
      key: 'total_fee',
      width: '60%',
    }];
    const servDataSource = expenses.server_charges;
    if (expenses.tot_sercharges) {
      servDataSource.push(expenses.tot_sercharges);
    }
    const cushDataSource = expenses.cush_charges;
    return (
      <div className="pane-content tab-pane">
        <Card title={this.msg('serviceFee')} bodyStyle={{ padding: 16 }}>
          <Table columns={columns} dataSource={servDataSource} rowKey="id" bordered pagination={false} />
        </Card>
        <Card title={this.msg('cushionFee')} bodyStyle={{ padding: 16 }}>
          <Table columns={cushColumns} dataSource={cushDataSource} rowKey="id" bordered pagination={false} />
        </Card>
      </div>
    );
  }
}
