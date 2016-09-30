import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Card, Table } from 'antd';

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
  render() {
    const { expenses } = this.props;
    const columns = [{
      title: '费用名称',
      dataIndex: 'fee_name',
      key: 'fee_name',
      width: '16.7%',
    }, {
      title: '计费数量',
      dataIndex: 'charge_count',
      key: 'charge_count',
      width: '16.7%',
    }, {
      title: '计费单价',
      dataIndex: 'unit_price',
      key: 'unit_price',
      width: '16.7%',
    }, {
      title: '费用金额',
      dataIndex: 'sum_fee',
      key: 'sum_fee',
      width: '16.7%',
    }, {
      title: '税金',
      dataIndex: 'tax_fee',
      key: 'tax_fee',
      width: '16.7%',
      render: (o) => {
        return o.toFixed(2);
      },
    }, {
      title: '应收金额',
      dataIndex: 'total_fee',
      key: 'total_fee',
      width: '16.7%',
      render: (o) => {
        return o.toFixed(2);
      },
    }];
    const cushColumns = [{
      title: '费用名称',
      dataIndex: 'fee_name',
      key: 'fee_name',
      width: '40%',
    }, {
      title: '应收金额',
      dataIndex: 'total_fee',
      key: 'total_fee',
      width: '60%',
    }];
    const servDataSource = expenses.server_charges;
    if(expenses.tot_sercharges) {
      servDataSource.push(expenses.tot_sercharges);
    }
    const cushDataSource = expenses.cush_charges;
    return (
      <div className="pane-content tab-pane">
        <Card title="服务费" bodyStyle={{ padding: 16 }}>
          <Table columns={columns} dataSource={servDataSource} rowKey="id" bordered pagination={false} />
        </Card>
        <Card title="代垫费" bodyStyle={{ padding: 16 }}>
          <Table columns={cushColumns} dataSource={cushDataSource} rowKey="id" bordered pagination={false} />
        </Card>
      </div>
    );
  }
}
