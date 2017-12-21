import React from 'react';
import moment from 'moment';
import { Input } from 'antd';
import DataTable from 'client/components/DataTable';
import { injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import RowAction from 'client/components/RowAction';
import { connect } from 'react-redux';
import { loadSendRecords, hideDeclMsgDock, showDeclMsgModal, hideDeclMsgModal } from 'common/reducers/cmsDeclare';
import { toggleDeclMsgModal } from 'common/reducers/cmsCiqDeclare';


const { Search } = Input;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    sendRecords: state.cmsDeclare.sendRecords,
    visible: state.cmsDeclare.declMsgDock.visible,
  }),
  {
    loadSendRecords, hideDeclMsgDock, showDeclMsgModal, hideDeclMsgModal, toggleDeclMsgModal,
  }
)
export default class DeclMsgPanel extends React.Component {
  static propTypes = {
  }
  state = {
    searchText: '',
  }
  componentWillMount() {
    const { sendRecords } = this.props;
    this.props.loadSendRecords({
      searchText: '',
      current: sendRecords.current,
      pageSize: sendRecords.pageSize,
    });
  }
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
  sentColumns = [{
    title: '统一编号',
    dataIndex: 'pre_entry_seq_no',
    width: 180,
  }, {
    title: '申报通道',
    dataIndex: 'channel',
    width: 100,
    render: (o, record) => {
      if (o === 'EDI') {
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
  hideDock = () => {
    this.props.hideDeclMsgDock();
  }
  searchSend = (e) => {
    this.setState({
      searchText: e.target.value,
    });
  }
  handleSearchSend = () => {
    const { sendRecords } = this.props;
    const { searchText } = this.state;
    this.props.loadSendRecords({
      searchText,
      current: 1,
      pageSize: sendRecords.pageSize,
    });
  }
  hideDeclMsgModal = () => {
    this.props.hideDeclMsgModal();
  }
  showDeclMsgModal = (type, filename) => {
    this.props.toggleDeclMsgModal(true, filename, type);
  }
  render() {
    const { visible, sendRecords } = this.props;
    this.sendDataSource.remotes = sendRecords;
    return (
      <DockPanel title="报文收发记录" size="large" visible={visible} onClose={this.hideDock}>
        {visible && <DataTable
          size="middle"
          columns={this.sentColumns}
          dataSource={this.sendDataSource}
          scrollOffset="240"
          rowkey="sent_file"
          toolbarActions={
            <Search
              style={{ width: 200 }}
              value={this.state.searchText}
              onChange={this.searchSend}
              onSearch={this.handleSearchSend}
            />
            }
        />}
      </DockPanel>
    );
  }
}
