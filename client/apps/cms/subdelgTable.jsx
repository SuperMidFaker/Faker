import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Table from 'client/components/remoteAntTable';
import moment from 'moment';
import { loadSubdelgsTable } from 'common/reducers/cmsDelegation';
import { message } from 'antd';
@connect(
  state => ({
    tenantId: state.account.tenantId,
    subdelgs: state.cmsDelegation.subdelgs,
  }),
  { loadSubdelgsTable }
)

export default class SubdelgTable extends Component {
  static propTypes = {
    listFilter: PropTypes.object.isRequired,
    subdelgs: PropTypes.object.isRequired,
    delgNo: PropTypes.string.isRequired,
  }

  componentDidMount() {
    this.props.loadSubdelgsTable(null, {
      delg_no: this.props.delgNo,
    }).then(result => {
      if (result.error) {
        message.error(result.error.message, 5);
      }
    });
  }

  columns = [{
    title: '子委托编号',
    dataIndex: 'bill_seq_no',
  }, {
    title: '报关方式',
    dataIndex: 'decl_way_code',
  }, {
    title: '备案编号',
    dataIndex: 'manual_no',
  }, {
    title: '统一编号',
    dataIndex: 'mawb_no',
  }, {
    title: '报关单号',
    dataIndex: 'ra_decl_no',
  }, {
    title: '件数',
    dataIndex: 'pack_count',
  }, {
    title: '毛重',
    dataIndex: 'gross_wt',
  }, {
    title: '回执状态',
    dataIndex: 'status',
  }, {
    title: '回执时间',
    dataIndex: 'delg_time',
    render: (o, record) => moment(record.delg_time).format('YYYY.MM.DD'),
  }]

  dataSource = new Table.DataSource({
    fetcher: params => this.props.loadSubdelgsTable(null, params),
    resolve: result => result.data,
    getPagination: (result, resolve) => ({
      total: result.totalCount,
      current: resolve(result.totalCount, result.current, result.pageSize),
      showSizeChanger: true,
      showQuickJumper: false,
      pageSize: result.pageSize,
    }),
    getParams: (pagination, filters, sorter) => {
      const params = {
        delg_no: this.props.delgNo,
        pageSize: pagination.pageSize,
        currentPage: pagination.current,
      };
      const filter = { ...this.props.listFilter, sortField: sorter.field, sortOrder: sorter.order };
      params.filter = JSON.stringify(filter);
      return params;
    },
    remotes: this.props.subdelgs,
  })

  render() {
    const { subdelgs } = this.props;
    this.dataSource.remotes = subdelgs;
    return (
      <div style={{ height: 200 }}>
        <Table columns={this.columns} dataSource={this.dataSource} pagination={false} size="small" scroll={{ y: 170 }} />
      </div>
  ); }
}
