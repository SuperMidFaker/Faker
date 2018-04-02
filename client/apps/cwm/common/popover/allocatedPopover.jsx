import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Popover, Table } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { loadTraceIdAllocDetails } from 'common/reducers/cwmOutbound';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);

@injectIntl
@connect(
  () => ({
  }),
  { loadTraceIdAllocDetails }
)
export default class allocatedPopover extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    text: PropTypes.number.isRequired,
    traceId: PropTypes.string.isRequired,
  }
  state = {
    visible: false,
    dataSource: [],
  }
  column = [{
    title: '出库订单号',
    width: 120,
    dataIndex: 'so_cust_order_no',
  }, {
    title: 'SO订单号',
    width: 120,
    dataIndex: 'so_no',
  }, {
    title: '分配数量',
    width: 80,
    dataIndex: 'alloc_qty',
    align: 'right',
  }, {
    title: '拣货数量',
    width: 80,
    dataIndex: 'picked_qty',
    align: 'right',
  }, {
    title: '入库订单号',
    width: 120,
    dataIndex: 'asn_cust_order_no',
  }]
  msg = key => formatMsg(this.props.intl, key);
  handleVisibleChange = (visible) => {
    if (this.props.text) {
      this.setState({ visible });
      if (visible) {
        this.props.loadTraceIdAllocDetails(this.props.traceId).then((result) => {
          if (!result.error) {
            this.setState({
              dataSource: result.data,
            });
          }
        });
      }
    }
  }
  render() {
    const { text } = this.props;
    const { dataSource } = this.state;
    const content = (
      <div style={{ width: 600 }}>
        <Table size="small" columns={this.column} dataSource={dataSource} rowKey="id" pagination={false} />
      </div>
    );
    return (
      <Popover content={content} title="分配记录" trigger="click" visible={this.state.visible} onVisibleChange={this.handleVisibleChange}>
        <Button size="small"><span className="text-warning">{text}</span></Button>
      </Popover>
    );
  }
}
