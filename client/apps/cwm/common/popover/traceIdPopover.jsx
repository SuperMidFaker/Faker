import React, { Component } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Button, Popover, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { loadTraceTransactions } from 'common/reducers/cwmTransaction';
import { format } from 'client/common/i18n/helpers';
import { CWM_TRANSACTIONS_TYPE } from 'common/constants';
import messages from '../../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  () => ({
  }),
  { loadTraceTransactions }
)
export default class TraceIdPopover extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    traceId: PropTypes.string.isRequired,
  }
  state = {
    visible: false,
    dataSource: [],
  }
  column = [{
    title: '事务',
    width: 80,
    dataIndex: 'type',
    align: 'center',
    render: type => <span className="text-emphasis">{CWM_TRANSACTIONS_TYPE[type].text}</span>,
  }, {
    title: '变动数量',
    width: 100,
    dataIndex: 'transaction_qty',
    align: 'right',
    render: (text) => {
      if (text > 0) {
        return <span className="text-success">+{text}</span>;
      }
      return <span className="text-warning">{text}</span>;
    },
  }, {
    title: '事务时间',
    width: 150,
    dataIndex: 'transaction_timestamp',
    render: traxTime => traxTime && moment(traxTime).format('YYYY.MM.DD HH:mm'),
    sorter: (a, b) => a.transaction_timestamp - b.transaction_timestamp,
  }, {
    title: '库位',
    width: 80,
    dataIndex: 'location',
  }, {
    title: '追踪ID',
    width: 180,
    dataIndex: 'trace_id',
  }, {
    title: '客户单号',
    width: 180,
    dataIndex: 'ref_order_no',
  }, {
    title: '原因',
    width: 130,
    dataIndex: 'reason',
    className: 'text-normal',
  }]
  msg = key => formatMsg(this.props.intl, key);
  handleVisibleChange = (visible) => {
    this.setState({ visible });
    if (visible) {
      this.props.loadTraceTransactions(this.props.traceId).then((result) => {
        if (!result.error) {
          this.setState({
            dataSource: result.data,
          });
        }
      });
    }
  }
  render() {
    const { traceId } = this.props;
    const { dataSource } = this.state;
    const content = (
      <div style={{ width: 850 }}>
        <Table size="small" columns={this.column} dataSource={dataSource} rowKey="id" pagination={{ defaultPageSize: 10 }} />
      </div>
    );
    return (
      <Popover content={content} title="变更记录" trigger="click" visible={this.state.visible} onVisibleChange={this.handleVisibleChange}>
        <Button size="small">{traceId}</Button>
      </Popover>
    );
  }
}
