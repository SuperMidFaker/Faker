import React from 'react';
import { connect } from 'react-redux';
import { Card, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { transactionColumns, commonTraceColumns } from '../../commonColumns';
import { loadTraceTransactions } from 'common/reducers/cwmTransaction';
import { formatMsg } from '../../../message.i18n';

@injectIntl
@connect(
  state => ({
    detail: state.cwmTransition.transitionModal.detail,
    loading: state.cwmTransaction.traceLoading,
    transactions: state.cwmTransaction.traceTransactions,
  }),
  { loadTraceTransactions }
)
export default class LogsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    scrollY: 0,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.detail !== this.props.detail) {
      this.props.loadTraceTransactions(nextProps.detail.trace_id);
    }
  }

  msg = formatMsg(this.props.intl);
  columns = transactionColumns(this.props.intl).concat({
    title: this.msg('location'),
    width: 120,
    dataIndex: 'location',
  }, {
    title: this.msg('traceId'),
    width: 200,
    dataIndex: 'trace_id',
    sorter: true,
  }).concat(commonTraceColumns(this.props.intl))
  render() {
    const { loading, transactions } = this.props;
    this.columns[0].fixed = 'left';
    return (
      <div>
        <Card noHovering bodyStyle={{ padding: 0 }} >
          <div className="table-panel table-fixed-layout">
            <Table size="middle" dataSource={transactions} loading={loading} rowKey="id" columns={this.columns}
              scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 220), 0) }}
            />
          </div>
        </Card>
      </div>
    );
  }
}
