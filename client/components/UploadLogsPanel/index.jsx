import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { Tag } from 'antd';
import { intlShape, injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import DataTable from 'client/components/DataTable';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import { loadUploadRecords, togglePanelVisible } from 'common/reducers/uploadRecords';
import { formatMsg, formatGlobalMsg } from './message.i18n';

@injectIntl
@connect(state => ({
  uploadRecords: state.uploadRecords.uploadRecords,
  filter: state.uploadRecords.filter,
  visible: state.uploadRecords.visible,
}), {
  loadUploadRecords, togglePanelVisible,
})
export default class UploadLogsPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    onUploadBatchDelete: PropTypes.func,
    type: PropTypes.string.isRequired,
  }
  componentDidMount() {
    this.handleReload();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.uploadRecords.reload) {
      this.handleReload();
    }
  }
  onUploadBatchDelete = (row) => {
    const { onUploadBatchDelete } = this.props;
    if (onUploadBatchDelete) {
      onUploadBatchDelete(row.upload_no, this.handleReload);
    }
  }
  handleReload = (filter = {}) => {
    const { pageSize, current } = this.props.uploadRecords;
    this.props.loadUploadRecords({
      pageSize,
      current,
      type: this.props.type,
      filter: JSON.stringify(filter),
    });
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleDownload = (row) => {
    window.open(row.file_path);
  }
  handleSearch = (value) => {
    const filter = { ...this.props.filter, searchText: value };
    this.handleReload(filter);
  }
  columns = [{
    title: '上传文件',
    dataIndex: 'filename',
    render: filename => filename && decodeURI(filename),
  }, {
    title: this.msg('status'),
    dataIndex: 'status',
    width: 60,
    render: (o) => {
      if (o && o === 1) {
        return <Tag color="#87d068">{this.gmsg('completed')}</Tag>;
      }
      return <Tag color="#f50">{this.gmsg('error')}</Tag>;
    },
  }, {
    title: this.msg('totalQty'),
    dataIndex: 'total_qty',
    width: 250,
    render: (o, record) => {
      if (o && o > 0) {
        return (<span>
          <span className={record.success_qty > 0 ? 'text-success' : ''}>{record.success_qty}</span> / <span className={record.ignore_qty > 0 ? 'text-warning' : ''}>{record.ignore_qty}</span> / <span className="text-emphasis">{o}</span>
        </span>);
      }
      return o;
    },
  }, {
    title: this.msg('fileSize'),
    dataIndex: 'file_size',
    align: 'right',
    width: 80,
    render: size => size && `${(size / 1000).toFixed(1)}K`,
  }, {
    title: this.msg('fileType'),
    dataIndex: 'file_type',
    width: 80,
  }, {
    title: this.msg('uploadedDate'),
    dataIndex: 'upload_date',
    width: 130,
    render: o => o && moment(o).format('YYYY.MM.DD HH:mm'),
  }, {
    title: this.gmsg('actions'),
    dataIndex: 'OPS_COL',
    fixed: 'right',
    className: 'table-col-ops',
    width: 88,
    render: (o, record) => (<span>
      <RowAction icon="download" onClick={this.handleDownload} tooltip={this.gmsg('download')} row={record} />
      {this.props.onUploadBatchDelete &&
        <RowAction danger icon="delete" confirm={this.gmsg('confirmOp')} onConfirm={this.onUploadBatchDelete} tooltip={this.gmsg('empty')} row={record} />}
    </span>),
  },
  ];
  handleClose = () => {
    const { pageSize } = this.props.uploadRecords;
    this.props.togglePanelVisible(false);
    this.props.loadUploadRecords({
      pageSize,
      current: 1,
      type: this.props.type,
      filter: JSON.stringify({}),
    });
  }
  render() {
    const { visible } = this.props;
    const dataSource = new DataTable.DataSource({
      fetcher: params => this.props.loadUploadRecords(params),
      resolve: result => result.data,
      getPagination: (result, resolve) => ({
        total: result.totalCount,
        current: Number(resolve(result.totalCount, result.current, result.pageSize)),
        showSizeChanger: true,
        showQuickJumper: false,
        pageSize: Number(result.pageSize),
        showTotal: total => `共 ${total} 条`,
      }),
      getParams: (pagination) => {
        const params = {
          pageSize: pagination.pageSize,
          current: pagination.current,
          type: this.props.type,
          filter: JSON.stringify(this.props.filter),
        };
        return params;
      },
      remotes: this.props.uploadRecords,
    });
    return (
      <DockPanel title={this.gmsg('importLogs')} size="large" visible={visible} onClose={this.handleClose}>
        <DataTable
          size="middle"
          columns={this.columns}
          dataSource={dataSource}
          scrollOffset={240}
          rowKey="upload_no"
          toolbarActions={<SearchBox onSearch={this.handleSearch} />}
          noSetting
          bordered
        />
      </DockPanel>
    );
  }
}
