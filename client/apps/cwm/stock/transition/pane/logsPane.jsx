import React from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { loadTraceTransactions } from 'common/reducers/cwmTransaction';
import DataTable from 'client/components/DataTable';
import { transactionColumns, commonTraceColumns } from '../../commonColumns';
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
      <DataTable
        size="middle"
        dataSource={transactions}
        loading={loading}
        rowKey="id"
        columns={this.columns}
      />
    );
  }
}
