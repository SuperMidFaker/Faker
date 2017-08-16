import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { transactionColumns, commonTraceColumns } from '../../../commonColumns';
import { loadTraceTransactions } from 'common/reducers/cwmTransaction';
import { formatMsg } from '../../../message.i18n';

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    detail: state.cwmTransition.transitionDock.detail,
    loading: state.cwmTransaction.traceLoading,
    transactions: state.cwmTransaction.traceTransactions,
  }),
  { loadTraceTransactions }
)
export default class LogsPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  componentWillMount() {
    const { detail, tenantId } = this.props;
    this.props.loadTraceTransactions(detail.trace_id, tenantId);
  }

  msg = formatMsg(this.props.intl);
  columns = transactionColumns(this.props.intl).concat({
    title: this.msg('location'),
    width: 120,
    dataIndex: 'location',
  }).concat(commonTraceColumns(this.props.intl))
  render() {
    const { loading, transactions } = this.props;
    this.columns[0].fixed = 'left';
    return (
      <div className="pane-content tab-pane">
        <Table dataSource={transactions} loading={loading} rowKey="id" bordered columns={this.columns}
          scroll={{ x: this.columns.reduce((acc, cur) => acc + (cur.width ? cur.width : 220), 0) }}
        />
      </div>
    );
  }
}
