import React, { Component, PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { Table } from 'antd';
import messages from './message.i18n.js';
import { format } from 'client/common/i18n/helpers';

const formatMsg = format(messages);

@injectIntl
export default class Expander extends Component {
  static propTypes = {
    intl: intlShape.isRequired,
    row: PropTypes.shape({
      key: PropTypes.number.isRequired,
      forwarder: PropTypes.string,
      carrier: PropTypes.string,
      broker: PropTypes.string,
    }).isRequired,
  }
  state = {
    dataSource: [],
    columns: [],
  }
  componentWillMount() {
    const row = this.props.row;
    const columns = [{
      title: this.msg('forwarder'),
      dataIndex: 'forwarder',
      width: 100,
    }, {
      title: this.msg('carrier'),
      dataIndex: 'carrier',
      width: 100,
    }];
    if (row.trans_mode === 'Air') {
      columns.push({
        title: this.msg('mawb'),
        dataIndex: 'mawb',
        width: 100,
      }, {
        title: this.msg('hawb'),
        dataIndex: 'hawb',
        width: 100,
      }, {
        title: this.msg('flightNo'),
        dataIndex: 'flight_no',
        width: 100,
      });
    } else {
      columns.push({
        title: this.msg('vessel'),
        dataIndex: 'vessel',
        width: 100,
      }, {
        title: this.msg('billlading'),
        dataIndex: 'bl_no',
        width: 100,
      }, {
        title: this.msg('voyage'),
        dataIndex: 'voyage',
        width: 100,
      });
    }
    columns.push({
      title: this.msg('containerNo'),
      dataIndex: 'container_no',
      width: 100,
    }, {
      title: this.msg('containerSizeHeight'),
      width: 100,
      render: (o, record) =>
        `${record.container_size}/${record.container_height}`,
    }, {
      title: this.msg('moveType'),
      dataIndex: 'movement_type',
      width: 100,
    }, {
      title: this.msg('pickupQty'),
      dataIndex: 'pick_qty',
      width: 100,
    }, {
      title: this.msg('ctnQty'),
      dataIndex: 'ctn_qty',
      width: 100,
    }, {
      title: this.msg('broker'),
      dataIndex: 'broker',
      width: 100,
    }, {
      title: this.msg('cdSheetNo'),
      dataIndex: 'cd_sheet_no',
      width: 140,
    });
    const dataSource = [row];
    this.setState({ columns, dataSource });
  }
  msg = key => formatMsg(this.props.intl, key);
  render() {
    const { columns, dataSource } = this.state;
    return (
      <Table columns={columns} dataSource={dataSource} pagination={false}
        size="middle" scroll={{ y: 200 }}
      />
    );
  }
}
