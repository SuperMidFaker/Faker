import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { intlShape, injectIntl } from 'react-intl';
import DockPanel from 'client/components/DockPanel';
import DataTable from 'client/components/DataTable';
import SearchBox from 'client/components/SearchBox';
import RowAction from 'client/components/RowAction';
import { formatMsg, formatGlobalMsg } from './message.i18n';

@injectIntl
export default class UploadLogsPanel extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func,
    logs: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number })).isRequired,
    handleReload: PropTypes.func.isRequired,
    handleEmpty: PropTypes.func.isRequired,
  }
  state = {

  }
  componentDidMount() {
    this.props.handleReload();
  }
  msg = formatMsg(this.props.intl)
  gmsg = formatGlobalMsg(this.props.intl)
  handleDownload = (row) => {
    const a = document.createElement('a');
    a.href = row.file_path;
    a.click();
  }
  handleEmpty = (row) => {
    this.props.handleEmpty(row.upload_no);
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
        <RowAction onClick={this.handleEmpty} label="清空" row={record} />
      </span>),
    },
  ];
  handleClose = () => {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }
  render() {
    const {
      logs, visible,
    } = this.props;
    return (
      <DockPanel title={this.gmsg('importLogs')} size="large" visible={visible} onClose={this.handleClose}>
        <DataTable
          size="middle"
          columns={this.columns}
          dataSource={logs}
          scrollOffset="240"
          rowkey="upload_no"
          toolbarActions={<SearchBox onSearch={this.handleSearch} />}
        />
      </DockPanel>
    );
  }
}
