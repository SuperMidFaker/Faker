import React from 'react';
import moment from 'moment';
import superAgent from 'superagent';
import { Tabs, Input, Modal } from 'antd';
import Table from 'client/components/remoteAntTable';
import { injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import TrimSpan from 'client/components/trimSpan';
import { connect } from 'react-redux';
import { loadSendRecords, loadReturnRecords, hideDeclMsgDock, showDeclMsgModal, hideDeclMsgModal } from 'common/reducers/cmsDeclare';

const { TabPane } = Tabs;
const { Search } = Input;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    sendRecords: state.cmsDeclare.sendRecords,
    returnRecords: state.cmsDeclare.returnRecords,
    visible: state.cmsDeclare.declMsgDock.visible,
    modalVisible: state.cmsDeclare.declMsgModal.visible,
  }),
  {
    loadSendRecords, loadReturnRecords, hideDeclMsgDock, showDeclMsgModal, hideDeclMsgModal,
  }
)
export default class DeclMsgPanel extends React.Component {
  static propTypes = {
  }
  state = {
    sendText: '',
    recvText: '',
    text: '',
  }
  componentWillMount() {
    const { sendRecords, returnRecords } = this.props;
    this.props.loadSendRecords({
      preEntrySeqNo: '',
      current: sendRecords.current,
      pageSize: sendRecords.pageSize,
    });
    this.props.loadReturnRecords({
      preEntrySeqNo: '',
      current: returnRecords.current,
      pageSize: returnRecords.pageSize,
    });
  }
  sendDataSource = new Table.DataSource({
    fetcher: params => this.props.loadSendRecords(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination) => {
      const params = {
        preEntrySeqNo: this.state.sendText,
        pageSize: pagination.pageSize,
        current: pagination.current,
      };
      return params;
    },
    remotes: this.props.sendRecords,
  });
  recvDataSource = new Table.DataSource({
    fetcher: params => this.props.loadReturnRecords(params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
      showTotal: total => `共 ${total} 条`,
    }),
    getParams: (pagination) => {
      const params = {
        preEntrySeqNo: this.state.recvText,
        pageSize: pagination.pageSize,
        current: pagination.current,
      };
      return params;
    },
    remotes: this.props.returnRecords,
  });
  sentColumns = [{
    title: '统一编号',
    dataIndex: 'pre_entry_seq_no',
    width: 180,
  }, {
    title: '申报报文',
    dataIndex: 'sent_file',
    render: o => <a onClick={() => this.showDeclMsgModal('send', o)}><TrimSpan text={o} maxLen={50} tailer={20} /></a>,
  }, {
    title: '通道',
    dataIndex: 'ep_code',
    width: 100,
  }, {
    title: '发送人员',
    dataIndex: 'sender_name',
    width: 100,
  }, {
    title: '发送时间',
    dataIndex: 'sent_date',
    width: 150,
    render: o => moment(o).format('YYYY.MM.DD HH:mm'),
  }];
  recvColumns = [{
    title: '统一编号',
    dataIndex: 'pre_entry_seq_no',
    width: 180,
  }, {
    title: '回执报文',
    dataIndex: 'return_file',
    render: o => <a onClick={() => this.showDeclMsgModal('return', o)}><TrimSpan text={o} maxLen={70} tailer={20} /></a>,
  }, {
    title: '接收时间',
    dataIndex: 'return_date',
    width: 150,
    render: o => moment(o).format('YYYY.MM.DD HH:mm'),
  }];
  hideDock = () => {
    this.props.hideDeclMsgDock();
  }
  searchSend = (e) => {
    this.setState({
      sendText: e.target.value,
    });
  }
  searchRecv = (e) => {
    this.setState({
      recvText: e.target.value,
    });
  }
  handleSearchSend = () => {
    const { sendRecords } = this.props;
    const { sendText } = this.state;
    this.props.loadSendRecords({
      preEntrySeqNo: sendText,
      current: 1,
      pageSize: sendRecords.pageSize,
    });
  }
  handleSearchRecv = () => {
    const { returnRecords } = this.props;
    const { recvText } = this.state;
    this.props.loadReturnRecords({
      preEntrySeqNo: recvText,
      current: 1,
      pageSize: returnRecords.pageSize,
    });
  }
  hideDeclMsgModal = () => {
    this.props.hideDeclMsgModal();
  }
  showDeclMsgModal = (type, filename) => {
    const me = this;
    let url = '';
    if (type === 'send') {
      url = `${API_ROOTS.default}v1/cms/customs/epsend/xml?filename=${filename}`;
    } else {
      url = `${API_ROOTS.default}v1/cms/customs/eprecv/xml?filename=${filename}`;
    }
    superAgent
      .get(url)
      .withCredentials()
      .type('text/xml')
      .end((err, req) => {
        if (!err) {
          me.setState({
            text: req.text,
          });
        }
      });
    this.props.showDeclMsgModal();
  }
  renderTabs = () => {
    const { sendRecords, returnRecords } = this.props;
    this.sendDataSource.remotes = sendRecords;
    this.recvDataSource.remotes = returnRecords;
    return (
      <Tabs defaultActiveKey="sent">
        <TabPane tab="发送记录" key="sent">
          <div className="toolbar">
            <Search
              style={{ width: 200 }}
              value={this.state.sendText}
              onChange={this.searchSend}
              onSearch={this.handleSearchSend}
            />
          </div>
          <Table
            size="middle"
            columns={this.sentColumns}
            dataSource={this.sendDataSource}
            scrollOffset="400"
            rowkey="sent_file"
            scroll={{
              x: this.sentColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0),
            }}
          />
        </TabPane>
        <TabPane tab="接收记录" key="recv">
          <div className="toolbar">
            <Search
              style={{ width: 200 }}
              value={this.state.recvText}
              onChange={this.searchRecv}
              onSearch={this.handleSearchRecv}
            />
          </div>
          <Table
            size="middle"
            columns={this.recvColumns}
            dataSource={this.recvDataSource}
            scrollOffset="400"
            rowkey="return_file"
            scroll={{
              x: this.sentColumns.reduce((acc, cur) => acc + (cur.width ? cur.width : 200), 0),
            }}
          />
        </TabPane>
      </Tabs>
    );
  }
  render() {
    const { visible, modalVisible } = this.props;
    return (
      <DockPanel title="报文收发记录" size="large" visible={visible} onClose={this.hideDock}>
        {visible && this.renderTabs()}
        <Modal width={800} maskClosable={false} visible={modalVisible} title="declMsg" onCancel={this.hideDeclMsgModal} onOk={this.hideDeclMsgModal}>
          <pre>{this.state.text}</pre>
        </Modal>
      </DockPanel>
    );
  }
}
