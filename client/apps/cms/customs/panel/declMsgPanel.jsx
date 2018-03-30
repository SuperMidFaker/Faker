import React from 'react';
import moment from 'moment';
import { Tabs } from 'antd';
import { injectIntl, intlShape } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import DataTable from 'client/components/DataTable';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import TrimSpan from 'client/components/trimSpan';
import { connect } from 'react-redux';
import { loadSendRecords, loadReturnRecords, hideDeclMsgDock, showDeclMsgModal, hideDeclMsgModal } from 'common/reducers/cmsCustomsDeclare';
import { toggleDeclMsgModal } from 'common/reducers/cmsCiqDeclare';
import { formatMsg } from '../message.i18n';

const { TabPane } = Tabs;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    sendRecords: state.cmsCustomsDeclare.sendRecords,
    returnRecords: state.cmsCustomsDeclare.returnRecords,
    visible: state.cmsCustomsDeclare.declMsgDock.visible,
  }),
  {
    loadSendRecords,
    loadReturnRecords,
    hideDeclMsgDock,
    showDeclMsgModal,
    hideDeclMsgModal,
    toggleDeclMsgModal,
  }
)
export default class DeclMsgPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  state = {
    searchText: '',
    recvText: '',
  }
  componentWillMount() {
    const { sendRecords, returnRecords } = this.props;
    this.props.loadSendRecords({
      searchText: '',
      current: sendRecords.current,
      pageSize: sendRecords.pageSize,
    });
    this.props.loadReturnRecords({
      preEntrySeqNo: '',
      current: returnRecords.current,
      pageSize: returnRecords.pageSize,
    });
  }
  msg = formatMsg(this.props.intl)
  sendDataSource = new DataTable.DataSource({
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
        searchText: this.state.searchText,
        pageSize: pagination.pageSize,
        current: pagination.current,
      };
      return params;
    },
    remotes: this.props.sendRecords,
  });
  recvDataSource = new DataTable.DataSource({
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
    title: '申报通道',
    dataIndex: 'channel',
    width: 100,
    render: (o, record) => {
      if (o === 'ep') {
        return record.ep_code;
      }
      return o;
    },
  }, {
    title: '报文',
    dataIndex: 'sent_file',
    width: 80,
    render: o => <RowAction onClick={() => this.showDeclMsgModal('sent', o)} icon="eye-o" />,
  }, {
    title: '发送人员',
    dataIndex: 'sender_name',
    width: 100,
  }, {
    title: '发送时间',
    dataIndex: 'sent_date',
    width: 120,
    render: o => moment(o).format('MM.DD HH:mm'),
  }, {
    title: '报关单号',
    dataIndex: 'entry_id',
    width: 180,
  }, {
    title: '回执',
    dataIndex: 'return_file',
    width: 80,
    render: o => o && <RowAction onClick={() => this.showDeclMsgModal('return', o)} icon="eye-o" />,
  }, {
    title: '接收时间',
    dataIndex: 'return_date',
    width: 120,
    render: o => o && moment(o).format('MM.DD HH:mm'),
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
    this.setState({
      searchText: '',
      recvText: '',
    });
    this.props.hideDeclMsgDock();
  }
  handleSearchSend = (searchVal) => {
    const { sendRecords } = this.props;
    this.props.loadSendRecords({
      searchText: searchVal,
      current: 1,
      pageSize: sendRecords.pageSize,
    });
    this.setState({
      searchText: searchVal,
    });
  }
  handleSearchRecv = (searchVal) => {
    const { returnRecords } = this.props;
    const { recvText } = this.state;
    this.props.loadReturnRecords({
      preEntrySeqNo: recvText,
      current: 1,
      pageSize: returnRecords.pageSize,
    });
    this.setState({
      recvText: searchVal,
    });
  }
  hideDeclMsgModal = () => {
    this.props.hideDeclMsgModal();
  }
  showDeclMsgModal = (type, filename) => {
    this.props.toggleDeclMsgModal(true, filename, type);
  }
  renderTabs = () => {
    const { sendRecords, returnRecords } = this.props;
    this.sendDataSource.remotes = sendRecords;
    this.recvDataSource.remotes = returnRecords;
    return (
      <Tabs defaultActiveKey="sent">
        <TabPane tab="发送记录" key="sent">
          <DataTable
            size="middle"
            columns={this.sentColumns}
            dataSource={this.sendDataSource}
            scrollOffset="240"
            rowkey="sent_file"
            toolbarActions={
              <SearchBox
                onSearch={this.handleSearchSend}
              />
              }
          />
        </TabPane>
        <TabPane tab="接收记录" key="recv">
          <DataTable
            size="middle"
            columns={this.recvColumns}
            dataSource={this.recvDataSource}
            scrollOffset="240"
            rowkey="return_file"
            toolbarActions={
              <SearchBox
                onSearch={this.handleSearchRecv}
              />
              }
          />
        </TabPane>
      </Tabs>
    );
  }
  render() {
    const { visible, sendRecords } = this.props;
    this.sendDataSource.remotes = sendRecords;
    return (
      <DockPanel title="报文收发记录" size="large" visible={visible} onClose={this.hideDock}>
        {visible && this.renderTabs()}
      </DockPanel>
    );
  }
}
