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
  state => ({
    tenantId: state.account.tenantId,
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
  componentWillMount() {
    this.props.loadTraceTransactions(this.props.traceId, this.props.tenantId).then((result) => {
      if (!result.error) {
        this.setState({
          dataSource: result.data,
        });
      }
    });
  }
  column = [{
    title: '事物类型',
    width: 80,
    dataIndex: 'type',
    className: 'cell-align-center',
    render: type => <span className="text-emphasis">{CWM_TRANSACTIONS_TYPE[type].text}</span>,
  }, {
    title: '变动数量',
    width: 100,
    dataIndex: 'transaction_qty',
    className: 'cell-align-right',
    render: (text) => {
      if (text > 0) {
        return <span className="text-success">+{text}</span>;
      } else {
        return <span className="text-warning">{text}</span>;
      }
    },
  }, {
    title: '原因',
    width: 100,
    dataIndex: 'reason',
    className: 'text-normal',
  }, {
    title: '事务时间',
    width: 150,
    dataIndex: 'transaction_timestamp',
    render: traxTime => traxTime && moment(traxTime).format('YYYY.MM.DD HH:mm'),
  }]
  msg = key => formatMsg(this.props.intl, key);
  handleVisibleChange = (visible) => {
    this.setState({ visible });
    if (visible) {
      this.props.loadTraceTransactions(this.props.traceId, this.props.tenantId).then((result) => {
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
      <div style={{ width: 400 }}>
        <Table columns={this.column} dataSource={dataSource} rowKey="transaction_timestamp" pagination={{ defaultPageSize: 5 }} />
      </div>
    );
    return (
      <Popover content={content} title="变更记录" trigger="click" visible={this.state.visible} onVisibleChange={this.handleVisibleChange}>
        <Button size="middle">{traceId}</Button>
      </Popover>
    );
  }
}
