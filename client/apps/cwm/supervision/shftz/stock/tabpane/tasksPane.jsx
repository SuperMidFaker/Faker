import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import DataTable from 'client/components/DataTable';
import RowAction from 'client/components/RowAction';
import { loadStockTasks, delStockTask } from 'common/reducers/cwmShFtzStock';
import { formatMsg, formatGlobalMsg } from '../message.i18n';

@injectIntl
@connect(
  state => ({
    defaultWhse: state.cwmContext.defaultWhse,
    ftzTaskList: state.cwmShFtzStock.ftzTaskList,
  }),
  { loadStockTasks, delStockTask }
)
export default class TasksPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.ftzTaskList.reload) {
      this.props.loadStockTasks(this.props.defaultWhse.code);
    }
  }
  msg = formatMsg(this.props.intl)
  gmsg=formatGlobalMsg(this.props.intl)
  columns = [{
    title: this.msg('taskId'),
    dataIndex: 'id',
    width: 60,
  }, {
    title: this.msg('owner'),
    dataIndex: 'owner_name',
  }, {
    title: '类型',
    dataIndex: 'type',
    width: 60,
    render: type => (type === 'match' ? '匹配' : '对比'),
  }, {
    title: this.msg('progress'),
    dataIndex: 'progress',
    width: 60,
    render: progress => (progress < 100 ? '进行中' : '完成'),
  }, {
    title: '时间',
    dataIndex: 'created_date',
    render: cdate => cdate && moment(cdate).format('MM.DD'),
    width: 70,
  }, {
    dataIndex: 'OPS_COL',
    className: 'table-col-ops',
    width: 70,
    render: (o, record) => {
      if (record.progress === 100) {
        return (<span>
          <RowAction icon="eye-o" onClick={this.handleDetail} tooltip="详情" row={record} />
          <RowAction danger icon="delete" confirm={this.gmsg('confirmOp')} onConfirm={this.handleDelete} tooltip={this.gmsg('delete')} row={record} />
        </span>);
      }
      return null;
    },
  }]
  handleDetail = (row) => {
    let link = `/cwm/supervision/shftz/stock/task/${row.id}`;
    if (row.type === 'match') {
      link = `/cwm/supervision/shftz/stock/matchtask/${row.id}`;
    }
    this.context.router.push(link);
  }
  handleDelete = (row) => {
    this.props.delStockTask(row.id);
  }
  render() {
    const { ftzTaskList } = this.props;
    return (
      <DataTable
        loading={ftzTaskList.loading}
        columns={this.columns}
        dataSource={ftzTaskList.data}
        rowKey="id"
        showToolbar={false}
      />
    );
  }
}
