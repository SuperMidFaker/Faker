import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Table } from 'antd';
import RowAction from 'client/components/RowAction';
import { loadStockTasks } from 'common/reducers/cwmShFtz';
import { formatMsg } from '../message.i18n';

@injectIntl
@connect(
  state => ({
    defaultWhse: state.cwmContext.defaultWhse,
    ftzTaskList: state.cwmShFtz.ftzTaskList,
  }),
  { loadStockTasks }
)
export default class TasksPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    collapsed: PropTypes.bool.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
  }
  componentWillReceiveProps(nextProps) {
    if ((nextProps.collapsed !== this.props.collapsed && !nextProps.collapsed)
      || nextProps.ftzTaskList.reload) {
      this.props.loadStockTasks(nextProps.defaultWhse.code);
    }
  }
  msg = formatMsg(this.props.intl)
  columns = [{
    title: this.msg('taskId'),
    dataIndex: 'id',
    width: 60,
  }, {
    title: this.msg('owner'),
    dataIndex: 'owner_name',
  }, {
    title: this.msg('progress'),
    dataIndex: 'progress',
    width: 60,
  }, {
    title: this.msg('createdDate'),
    dataIndex: 'created_date',
    render: cdate => cdate && moment(cdate).format('MM.DD'),
    width: 100,
  }, {
    dataIndex: 'OPS_COL',
    render: (o, record) => {
      if (record.progress === 100) {
        return (<span>
          <RowAction onClick={this.handleDetail} label="对比详情" row={record} />
          {record.progress === -1 && <span className="ant-divider" />}
        </span>);
      }
    },
    width: 100,
  }]
  handleDetail = (row) => {
    const link = `/cwm/supervision/shftz/stock/task/${row.id}`;
    this.context.router.push(link);
  }
  render() {
    const { ftzTaskList } = this.props;
    return (
      <div className="table-panel table-fixed-layout">
        <Table loading={ftzTaskList.loading} columns={this.columns} dataSource={ftzTaskList.data} rowKey="id" />
      </div>
    );
  }
}
