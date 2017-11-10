import React from 'react';
import moment from 'moment';
import { Table, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { loadSendRecords, loadReturnRecords } from 'common/reducers/cmsDeclare';

const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    sendRecords: state.cmsDeclare.sendRecords,
    returnRecords: state.cmsDeclare.returnRecords,
  }),
  { loadSendRecords, loadReturnRecords }
)
export default class DeclMsgPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  componentWillMount() {
    this.props.loadSendRecords();
    this.props.loadReturnRecords();
  }
  sentColumns = [{
    title: '统一编号',
    dataIndex: 'pre_entry_seq_no',
    width: 180,
  }, {
    title: '申报报文',
    dataIndex: 'sent_file',
  }, {
    title: '发送人员',
    dataIndex: 'sender_name',
    width: 160,
  }, {
    title: '发送时间',
    dataIndex: 'sent_date',
    width: 160,
    render: o => moment(o).format('YYYY/MM/DD'),
  }];
  recvColumns = [{
    title: '统一编号',
    dataIndex: 'pre_entry_seq_no',
    width: 160,
  }, {
    title: '回执报文',
    dataIndex: 'return_file',
    width: 160,
  }, {
    title: '接收时间',
    dataIndex: 'return_date',
    width: 160,
    render: o => moment(o).format('YYYY/MM/DD'),
  }];
  render() {
    const { sendRecords, returnRecords } = this.props;
    return (
      <div className="right-sider-panel">
        <div className="panel-header">
          <h3>报文收发记录</h3>
        </div>
        <Tabs defaultActiveKey="sent">
          <TabPane tab="发送记录" key="sent">
            <Table size="middle" columns={this.sentColumns} dataSource={sendRecords}
              scroll={{ x: this.sentColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }}
            />
          </TabPane>
          <TabPane tab="接收记录" key="recv">
            <Table size="middle" columns={this.recvColumns} dataSource={returnRecords}
              scroll={{ x: this.sentColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0) }}
            />
          </TabPane>
        </Tabs>
      </div>
    );
  }
}
