import React from 'react';
import { Table, Tabs } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import { connect } from 'react-redux';

const TabPane = Tabs.TabPane;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
  { }
)
export default class DeclMsgPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,

  }
  state = {
  }
  sentColumns = [{
    title: '统一编号',
    dataIndex: 'pre_entry_seq_no',
    width: 160,
  }, {
    title: '申报报文',
    dataIndex: 'sent_file',
    width: 160,
  }, {
    title: '发送时间',
    dataIndex: 'sent_date',
    width: 160,
  }];
  recvColumns = [{
    title: '统一编号',
    dataIndex: 'pre_entry_seq_no',
    width: 160,
  }, {
    title: '回执报文',
    dataIndex: 'recv_file',
    width: 160,
  }, {
    title: '接收时间',
    dataIndex: 'recv_date',
    width: 160,
  }];
  render() {
    return (
      <div className="right-sider-panel">
        <div className="panel-header">
          <h3>报文收发记录</h3>
        </div>
        <Tabs defaultActiveKey="sent">
          <TabPane tab="发送记录" key="sent"><Table size="middle" columns={this.sentColumns} /></TabPane>
          <TabPane tab="接收记录" key="recv"><Table size="middle" columns={this.recvColumns} /></TabPane>
        </Tabs>
      </div>
    );
  }
}
