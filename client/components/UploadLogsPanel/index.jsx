import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import DataTable from 'client/components/DataTable';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import { loadUploadRecords } from 'common/reducers/uploadRecords';
import { formatMsg, formatGlobalMsg } from './message.i18n';

@injectIntl
@connect(state => ({
  uploadRecords: state.uploadRecords.uploadRecords,
}), {
  loadUploadRecords,
})
export default class UploadLogsPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    onUploadBatchDelete: PropTypes.func.isRequired,
    reload: PropTypes.bool.isRequired,
    type: PropTypes.string.isRequired,
  }
  componentDidMount() {
    this.handleReload();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.reload) {
      this.handleReload();
    }
  }
  onUploadBatchDelete = (row) => {
    this.props.onUploadBatchDelete(row.upload_no);
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
    const filters = { searchText: value };
    this.props.handleReload(filters);
  }
  columns = [
    {
      title: this.msg('id'),
      dataIndex: 'upload_no',
      width: 100,
    }, {
      title: this.msg('status'),
      dataIndex: 'status',
      width: 60,
    }, {
      title: this.msg('successQty'),
      dataIndex: 'success_qty',
      width: 80,
    }, {
      title: this.msg('ignoredQty'),
      dataIndex: 'ignore_qty',
      width: 80,
    }, {
      title: this.msg('totalQty'),
      dataIndex: 'total_qty',
      width: 80,
    }, {
      title: this.msg('fileSize'),
      dataIndex: 'file_size',
      width: 80,
    }, {
      title: this.msg('fileType'),
      dataIndex: 'file_type',
      width: 90,
    }, {
      title: this.msg('uploadedDate'),
      dataIndex: 'upload_date',
      width: 100,
      render: o => o && moment(o).format('MM.DD HH:mm'),
    }, {
      title: this.gmsg('actions'),
      dataIndex: 'OPS_COL',
      align: 'right',
      fixed: 'right',
      width: 90,
      render: (o, record) => (<span>
        <RowAction onClick={this.handleDownload} label="下载" row={record} />
        <RowAction onClick={this.onUploadBatchDelete} label="清空" row={record} />
      </span>),
    },
  ];
  handleClose = () => {
    if (this.props.onClose) {
      this.props.onClose();
    }
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
          scrollOffset="240"
          rowkey="upload_no"
          toolbarActions={<SearchBox onSearch={this.handleSearch} />}
        />
      </DockPanel>
    );
  }
}
